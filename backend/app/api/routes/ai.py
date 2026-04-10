from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from openai import OpenAI
from app.core.database import get_db
from app.schemas.ai import AIChatRequest, AIChatResponse, AIBookingRequest, AIRescheduleRequest, AICancelRequest
from app.schemas.patient import PatientCreate
from app.crud import patient as patient_crud
from app.services.conversation_service import get_conversation_service
from app.services.appointment_service import get_appointment_service
from app.services.clinic_service import get_clinic_service
from app.services.openai_service import openai_service
from app.utils.prompts import SYSTEM_PROMPT, build_clinic_context, parse_intent
from app.utils.datetime_helpers import parse_date
from app.utils.validators import normalize_service, validate_time_format
from datetime import datetime

router = APIRouter()

def extract_booking_details_from_history(history: list) -> dict:
    if not history:
        print("[DEBUG] No history")
        return {}
    
    conversation_text = "\n".join([f"{msg['role']}: {msg.get('content', '')}" for msg in history])
    print(f"[DEBUG] Conversation text:\n{conversation_text}")
    
    conversation_text = "\n".join([f"{msg['role']}: {msg.get('content', '')}" for msg in history])
    
    prompt = f"""Extract complete booking information from this conversation. 
Return a JSON with these exact fields only if ALL are present:
- full_name: Customer's full name (string)
- phone: Phone number like 01712345678 (string)
- service_type: One of Dental Checkup, Teeth Cleaning, Tooth Extraction, Root Canal, Braces Consultation, Teeth Whitening, Gum Treatment (string)
- preferred_date: Date as written (string)
- preferred_time: Time as written (string)
- confirmed: "yes" if user confirmed, otherwise "no" (string)

Conversation:
{conversation_text}

Return ONLY valid JSON or empty {{}} if not all fields are present."""

    try:
        import json
        key = openai_service.groq_key or openai_service.openai_key
        if not key:
            return {}
        client = None
        use_groq = False
        if openai_service.groq_key:
            use_groq = True
            client = OpenAI(api_key=openai_service.groq_key, base_url="https://api.groq.com/openai/v1")
        else:
            client = OpenAI(api_key=openai_service.openai_key)
        
        model = "llama-3.1-8b-instant" if use_groq else "gpt-4o-mini"
        
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You extract structured booking data from conversations. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )
        content = response.choices[0].message.content
        if content:
            import re
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                return json.loads(match.group())
    except Exception as e:
        print(f"Extraction error: {e}")
    
    return {}


def parse_time_to_24h(time_input: str) -> str:
    time_input = time_input.strip()
    time_lower = time_input.lower().replace('a.m.', 'am').replace('m.', 'm')
    time_str = time_input
    
    if 'am' in time_lower or 'pm' in time_lower:
        time_clean = time_lower.replace('am', '').replace('pm', '').strip()
        try:
            if ':' in time_clean:
                parts = time_clean.split(':')
                hour = int(parts[0])
                minute = int(parts[1]) if len(parts) > 1 else 0
            else:
                hour = int(time_clean)
                minute = 0
            if 'pm' in time_lower and hour < 12:
                hour += 12
            if 'am' in time_lower and hour == 12:
                hour = 0
            time_str = f"{hour:02d}:{minute:02d}"
        except:
            pass
    return time_str


def try_book_appointment(booking_data: dict, db, appt_service, patient_crud) -> tuple:
    """Attempt to book appointment. Returns (success, message, booking_confirmed)"""
    print(f"[DEBUG] try_book_appointment called with: {booking_data}")
    
    if not booking_data or not booking_data.get('full_name') or \
       not booking_data.get('phone') or not booking_data.get('service_type') or \
       not booking_data.get('preferred_date') or not booking_data.get('preferred_time'):
        print("[DEBUG] Missing required fields in booking_data")
        return (False, None, False)
    
    try:
        parsed_date = parse_date(booking_data.get('preferred_date', ''))
        if not parsed_date:
            print(f"[DEBUG] Failed to parse date: {booking_data.get('preferred_date')}")
            return (False, None, False)
        
        print(f"[DEBUG] Parsed date: {parsed_date} (day: {parsed_date.strftime('%A')})")
        
        from app.utils.datetime_helpers import is_friday
        if is_friday(parsed_date):
            print("[DEBUG] Selected date is Friday (closed)")
            return (False, "Sorry, the clinic is closed on Fridays. Would you like to book for another day?", False)
        
        date_str = parsed_date.strftime("%Y-%m-%d")
        time_str = parse_time_to_24h(booking_data.get('preferred_time', ''))
        print(f"[DEBUG] Parsed time: {time_str}")
        
        if not validate_time_format(time_str):
            return (False, None, False)
        
        # Check availability
        if not appt_service.check_slot_availability(parsed_date, time_str):
            suggestions = appt_service.suggest_alternative_slots(parsed_date, time_str)
            if suggestions:
                slots = ", ".join([f"{s['date']} at {s['time']}" for s in suggestions[:3]])
                return (False, f"Sorry, that slot is taken. Available: {slots}. Which works?", False)
            return (False, "No slots available. Please choose different time.", False)
        
        # Create or get patient
        patient = patient_crud.get_patient_by_phone(db, booking_data.get('phone', ''))
        if not patient:
            patient_data = PatientCreate(
                full_name=booking_data.get('full_name', ''),
                phone=booking_data.get('phone', '')
            )
            patient = patient_crud.create_patient(db, patient_data)
        
        # Create booking
        result = appt_service.create_booking(
            patient_id=patient.id,
            service_type=normalize_service(booking_data.get('service_type', '')),
            appointment_date=date_str,
            appointment_time=time_str
        )
        
        if result["success"]:
            return (True, f"Your appointment has been booked for {result['appointment_date']} at {result['appointment_time']}. Thank you!", True)
        else:
            return (False, "Booking failed. Please try again.", False)
            
    except Exception as e:
        print(f"Booking error: {e}")
        return (False, None, False)


@router.post("/chat", response_model=AIChatResponse)
def chat(request: AIChatRequest, db: Session = Depends(get_db)):
    conv_service = get_conversation_service(db)
    clinic_service = get_clinic_service(db)
    appt_service = get_appointment_service(db)
    
    # Store user message
    conv_service.add_message(
        session_id=request.session_id,
        role="user",
        message=request.message,
        patient_id=request.patient_id
    )
    
    history = conv_service.get_history_for_ai(request.session_id)
    clinic_info = clinic_service.get_info()
    
    system_msg = SYSTEM_PROMPT
    if clinic_info:
        system_msg += build_clinic_context(clinic_info)
    
    intent = parse_intent(request.message)
    user_msg_lower = request.message.lower()
    
    # Build conversation for AI
    conversation_for_ai = [
        {"role": msg["role"], "content": msg.get("content") or ""} 
        for msg in history[-8:] 
        if msg.get("content")
    ]
    conversation_for_ai.append({"role": "user", "content": request.message})
    
    # Check if user is confirming or selecting time
    confirm_words = ['confirm', 'yes', 'sure', 'ok', 'proceed', 'go ahead', 'yep', 'yeah']
    is_confirmation = any(word in user_msg_lower for word in confirm_words)
    
    time_slots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '09:00', '09:30']
    
    def extract_time_from_message(msg: str) -> str | None:
        msg_lower = msg.lower().replace('a.m.', 'am').replace('m.', 'm')
        for slot in time_slots:
            if slot in msg_lower or slot.replace(':', ' ') in msg_lower:
                return slot
        for slot in time_slots:
            hour = slot.split(':')[0]
            if f'{hour}am' in msg_lower or f'{hour}pm' in msg_lower:
                return slot
        return None
    
    is_time_selection = extract_time_from_message(request.message) is not None
    
    response_text = ""
    booking_confirmed = False
    
    # If user confirms with "yes", try to book
    if is_confirmation:
        print(f"[DEBUG] Confirmation detected. History length: {len(history)}")
        booking_data = extract_booking_details_from_history(history)
        print(f"[DEBUG] Extracted booking data: {booking_data}")
        success, message, confirmed = try_book_appointment(booking_data, db, appt_service, patient_crud)
        print(f"[DEBUG] Booking result: success={success}, message={message}, confirmed={confirmed}")
        
        if success:
            response_text = message
            booking_confirmed = confirmed
        elif message:  # Has error message with suggestions
            response_text = message
        # If no message, fall through to AI response
    
    # If user selects a time from alternatives
    if not response_text and is_time_selection:
        print(f"[DEBUG] Time selection detected: {request.message}")
        booking_data = extract_booking_details_from_history(history)
        print(f"[DEBUG] Booking data before time update: {booking_data}")
        
        if booking_data:
            selected_time = extract_time_from_message(request.message)
            print(f"[DEBUG] Found selected time: {selected_time}")
            
            if selected_time:
                booking_data['preferred_time'] = selected_time
                print(f"[DEBUG] Updated time to: {selected_time}")
                try:
                    parsed_date = parse_date(booking_data.get('preferred_date', ''))
                    print(f"[DEBUG] Parsed date: {parsed_date}")
                    if parsed_date:
                        time_str = parse_time_to_24h(selected_time)
                        print(f"[DEBUG] Checking availability for {parsed_date} at {time_str}")
                        if not appt_service.check_slot_availability(parsed_date, time_str):
                            print(f"[DEBUG] Slot not available, getting suggestions")
                            suggestions = appt_service.suggest_alternative_slots(parsed_date, time_str)
                            if suggestions:
                                slots = ", ".join([f"{s['date']} at {s['time']}" for s in suggestions[:3]])
                                response_text = f"Sorry, that slot is not available. Alternatives: {slots}. Which works?"
                        else:
                            print(f"[DEBUG] Slot available! Setting up confirmation")
                            response_text = f"Please confirm: {booking_data.get('full_name')}, {booking_data.get('phone')}, {booking_data.get('service_type')}, {booking_data.get('preferred_date')}, {selected_time}. Reply 'yes' to book."
                except Exception as e:
                    print(f"Time selection error: {e}")
    
    # If no response yet, get AI response
    if not response_text:
        response_text = openai_service.get_response(
            system_prompt=system_msg,
            user_message=request.message,
            conversation_history=conversation_for_ai
        )
        
    # Only check slot availability if AI already gathered booking info AND user has actually provided it
    # Need at least 3+ messages in history to have real booking data
    booking_data = extract_booking_details_from_history(history)
    if (booking_data.get('preferred_date') and booking_data.get('preferred_time') and 
        not booking_data.get('confirmed') and len(history) >= 6):
        try:
            parsed_date = parse_date(booking_data.get('preferred_date', ''))
            if parsed_date:
                time_str = parse_time_to_24h(booking_data.get('preferred_time', ''))
                if validate_time_format(time_str):
                    if not appt_service.check_slot_availability(parsed_date, time_str):
                        suggestions = appt_service.suggest_alternative_slots(parsed_date, time_str)
                        if suggestions:
                            slots = ", ".join([f"{s['date']} at {s['time']}" for s in suggestions[:3]])
                            response_text = f"Sorry, that slot is not available. Alternatives: {slots}. Which works?"
        except:
            pass
    
    # Store assistant response
    conv_service.add_message(
        session_id=request.session_id,
        role="assistant",
        message=response_text,
        patient_id=request.patient_id
    )
    
    # Determine quick replies based on context
    quick_replies = []
    user_msg_lower = request.message.lower()
    
    booking_data = extract_booking_details_from_history(history)
    has_name = bool(booking_data.get('full_name'))
    has_phone = bool(booking_data.get('phone'))
    has_service = bool(booking_data.get('service_type'))
    has_date = bool(booking_data.get('preferred_date'))
    has_time = bool(booking_data.get('preferred_time'))
    
    # First greeting - offer services
    if not has_service and not any(x in user_msg_lower for x in ['name', 'phone', 'date', 'time']):
        if len(history) <= 2:
            quick_replies = [
                "Book an Appointment",
                "Ask about services",
                "Clinic hours",
                "Location"
            ]
    # If booking started but no service selected
    elif not has_service and any(word in user_msg_lower for word in ['book', 'appointment', 'want', 'need']):
        quick_replies = [
            "Dental Checkup",
            "Teeth Cleaning", 
            "Tooth Extraction",
            "Root Canal",
            "Braces Consultation",
            "Teeth Whitening",
            "Gum Treatment"
        ]
    # If service selected but no date
    elif has_service and not has_date:
        from datetime import datetime, timedelta
        today = datetime.now()
        quick_replies = [
            f"Today",
            f"Tomorrow",
            f"Saturday",
            f"Monday",
        ]
    # If date selected but no time
    elif has_date and not has_time:
        quick_replies = ["10:00 AM", "10:30 AM", "2:00 PM", "2:30 PM", "3:00 PM", "4:00 PM"]
    # If all info collected and waiting for confirmation
    elif has_name and has_phone and has_service and has_date and has_time and not booking_data.get('confirmed'):
        quick_replies = ["Yes, confirm booking", "No, change details"]
    
    return AIChatResponse(
        response=response_text,
        intent=intent,
        extracted_data={},
        booking_confirmed=booking_confirmed,
        suggestions=[],
        quick_replies=quick_replies if quick_replies else []
    )


@router.post("/book-from-chat")
def book_from_chat(request: AIBookingRequest, db: Session = Depends(get_db)):
    appt_service = get_appointment_service(db)
    patient_crud_local = patient_crud
    
    patient = patient_crud_local.get_patient_by_phone(db, request.phone)
    if not patient:
        patient_data = PatientCreate(
            full_name=request.full_name,
            phone=request.phone
        )
        patient = patient_crud_local.create_patient(db, patient_data)
    
    result = appt_service.create_booking(
        patient_id=patient.id,
        service_type=request.service_type,
        appointment_date=request.appointment_date,
        appointment_time=request.appointment_time,
        reason=request.reason
    )
    
    if result["success"]:
        return {
            "success": True,
            "appointment_id": result.get("appointment_id"),
            "patient_name": request.full_name,
            "service_type": request.service_type,
            "appointment_date": result["appointment_date"],
            "appointment_time": result["appointment_time"],
            "message": f"Appointment booked successfully for {result['appointment_date']} at {result['appointment_time']}"
        }
    else:
        return {
            "success": False,
            "message": result.get("error", "Booking failed"),
            "suggestions": result.get("suggestions", [])
        }


@router.post("/reschedule-from-chat")
def reschedule_from_chat(request: AIRescheduleRequest, db: Session = Depends(get_db)):
    appt_service = get_appointment_service(db)
    
    result = appt_service.reschedule_appointment(
        appointment_id=request.appointment_id,
        new_date=request.new_date,
        new_time=request.new_time
    )
    
    if result["success"]:
        return {
            "success": True,
            "message": f"Appointment rescheduled to {result['appointment_date']} at {result['appointment_time']}"
        }
    return {
        "success": False,
        "message": result.get("error", "Reschedule failed")
    }


@router.post("/cancel-from-chat")
def cancel_from_chat(request: AICancelRequest, db: Session = Depends(get_db)):
    appt_service = get_appointment_service(db)
    
    result = appt_service.cancel_appointment(
        appointment_id=request.appointment_id,
        reason=request.reason
    )
    
    if result["success"]:
        return {
            "success": True,
            "message": "Appointment cancelled successfully"
        }
    return {
        "success": False,
        "message": result.get("error", "Cancellation failed")
    }