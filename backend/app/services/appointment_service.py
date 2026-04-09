from sqlalchemy.orm import Session
from app.crud import appointment as appointment_crud
from app.crud import patient as patient_crud
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.utils.datetime_helpers import get_time_slots, is_friday, is_valid_clinic_day, parse_date
from app.crud.clinic import get_clinic_settings
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any


class AppointmentService:
    def __init__(self, db: Session):
        self.db = db
    
    def check_slot_availability(self, date: datetime, time: str) -> bool:
        settings = get_clinic_settings(self.db)
        
        if is_friday(date):
            return False
        
        if settings:
            working_days = settings.working_days.split(",")
            if not is_valid_clinic_day(date, working_days):
                return False
        else:
            if not is_valid_clinic_day(date, ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]):
                return False
        
        appointments = appointment_crud.get_appointments_by_date(self.db, date)
        booked_times = [appt.appointment_time for appt in appointments]
        
        return time not in booked_times
    
    def get_available_slots(self, date: datetime) -> List[str]:
        settings = get_clinic_settings(self.db)
        
        if is_friday(date):
            return []
        
        if settings:
            working_days = settings.working_days.split(",")
            if not is_valid_clinic_day(date, working_days):
                return []
        else:
            if not is_valid_clinic_day(date, ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]):
                return []
        
        if settings:
            all_slots = get_time_slots(
                settings.opening_time,
                settings.closing_time,
                settings.slot_duration_minutes
            )
        else:
            all_slots = get_time_slots("09:00", "20:00", 30)
        
        appointments = appointment_crud.get_appointments_by_date(self.db, date)
        booked_times = [appt.appointment_time for appt in appointments]
        
        available = [slot for slot in all_slots if slot not in booked_times]
        return available
    
    def suggest_alternative_slots(self, requested_date: datetime, requested_time: str) -> List[Dict[str, str]]:
        suggestions = []
        
        if not self.check_slot_availability(requested_date, requested_time):
            available = self.get_available_slots(requested_date)
            if available:
                for time in available[:3]:
                    suggestions.append({
                        "date": requested_date.strftime("%Y-%m-%d"),
                        "time": time
                    })
        
        if not suggestions:
            for i in range(1, 7):
                alt_date = requested_date + timedelta(days=i)
                if is_friday(alt_date):
                    continue
                working_days = get_clinic_settings(self.db).working_days.split(",")
                if is_valid_clinic_day(alt_date, working_days):
                    available = self.get_available_slots(alt_date)
                    if available:
                        for time in available[:2]:
                            suggestions.append({
                                "date": alt_date.strftime("%Y-%m-%d"),
                                "time": time
                            })
                        if len(suggestions) >= 3:
                            break
        
        return suggestions
    
    def create_booking(
        self,
        patient_id: int,
        service_type: str,
        appointment_date: str,
        appointment_time: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        date_obj = parse_date(appointment_date)
        if not date_obj:
            return {"success": False, "error": "Invalid date format"}
        
        date_str = date_obj.strftime("%Y-%m-%d")
        time_str = appointment_time
        
        if not self.check_slot_availability(date_obj, time_str):
            suggestions = self.suggest_alternative_slots(date_obj, time_str)
            return {
                "success": False,
                "error": "Slot not available",
                "suggestions": suggestions
            }
        
        date_time = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        
        appointment_data = AppointmentCreate(
            patient_id=patient_id,
            service_type=service_type,
            appointment_date=date_time,
            appointment_time=time_str,
            reason=reason
        )
        
        appointment = appointment_crud.create_appointment(self.db, appointment_data)
        
        patient = patient_crud.get_patient(self.db, patient_id)
        
        return {
            "success": True,
            "appointment_id": appointment.id,
            "patient_name": patient.full_name,
            "service_type": service_type,
            "appointment_date": appointment_date,
            "appointment_time": time_str,
            "message": f"Your appointment has been booked successfully for {appointment_date} at {time_str}."
        }
    
    def reschedule_appointment(
        self,
        appointment_id: int,
        new_date: str,
        new_time: str
    ) -> Dict[str, Any]:
        appointment = appointment_crud.get_appointment(self.db, appointment_id)
        if not appointment:
            return {"success": False, "error": "Appointment not found"}
        
        if appointment.status == "cancelled":
            return {"success": False, "error": "Cannot reschedule a cancelled appointment"}
        
        date_obj = datetime.strptime(new_date, "%Y-%m-%d")
        
        if not self.check_slot_availability(date_obj, new_time):
            suggestions = self.suggest_alternative_slots(date_obj, new_time)
            return {
                "success": False,
                "error": "New slot not available",
                "suggestions": suggestions
            }
        
        update_data = AppointmentUpdate(
            appointment_date=datetime.strptime(f"{new_date} {new_time}", "%Y-%m-%d %H:%M"),
            appointment_time=new_time,
            status="rescheduled"
        )
        
        updated = appointment_crud.update_appointment(self.db, appointment_id, update_data)
        
        return {
            "success": True,
            "appointment_id": appointment_id,
            "new_date": new_date,
            "new_time": new_time,
            "message": f"Your appointment has been rescheduled to {new_date} at {new_time}."
        }
    
    def cancel_appointment(
        self,
        appointment_id: int,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        appointment = appointment_crud.get_appointment(self.db, appointment_id)
        if not appointment:
            return {"success": False, "error": "Appointment not found"}
        
        if appointment.status == "cancelled":
            return {"success": False, "error": "Appointment already cancelled"}
        
        cancelled = appointment_crud.cancel_appointment(self.db, appointment_id)
        
        return {
            "success": True,
            "appointment_id": appointment_id,
            "message": "Your appointment has been cancelled successfully."
        }


def get_appointment_service(db: Session) -> AppointmentService:
    return AppointmentService(db)
