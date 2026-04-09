import json
import re
from typing import Optional, Dict, Any
from openai import OpenAI
from app.core.config import get_settings


class OpenAIService:
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.OPENAI_API_KEY
        self._client = None
    
    @property
    def client(self) -> Optional[OpenAI]:
        if self._client is None and self.api_key:
            self._client = OpenAI(api_key=self.api_key)
        return self._client
    
    def get_response(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: list = None
    ) -> str:
        if not self.client:
            return "AI service not configured. Please set OPENAI_API_KEY."
        
        messages = [{"role": "system", "content": system_prompt}]
        
        if conversation_history:
            for msg in conversation_history:
                if msg.get("role") and msg.get("content"):
                    messages.append(msg)
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            return content if content else "I'm here to help you book an appointment. How can I assist you today?"
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return "Sorry, I'm having trouble connecting to the AI service. Please try again."
    
    def extract_booking_info(self, message: str) -> Optional[Dict[str, Any]]:
        if not self.client:
            return None
        
        extraction_prompt = f"""Extract booking information from the following message. 
Return JSON with these exact fields if present:
- full_name: Customer's full name (just the name, no other text)
- phone: Phone number in Bangladesh format like 01712345678
- service_type: One of: Dental Checkup, Teeth Cleaning, Tooth Extraction, Root Canal, Braces Consultation, Teeth Whitening, Gum Treatment (choose closest match)
- preferred_date: Keep as the user wrote it - do NOT convert to YYYY-MM-DD. Examples: "tomorrow", "next Monday", "this Saturday", "2026-04-15" - just copy what they said
- preferred_time: Keep as the user wrote it - do NOT convert. Examples: "10am", "2pm", "10:00", "14:30" - just copy what they said
- reason: Short reason if mentioned

Message: {message}

Return ONLY valid JSON starting with {{ and ending with }}. No explanations."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You extract structured data from user messages. Return only valid JSON."},
                    {"role": "user", "content": extraction_prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            content = response.choices[0].message.content
            if not content:
                return None
                
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return data
        except Exception as e:
            print(f"OpenAI extraction error: {e}")
        
        return None
    
    def summarize_conversation(self, messages: list) -> str:
        if not self.client:
            return ""
        
        if not messages:
            return ""
        
        conversation_text = "\n".join([
            f"{msg.get('role', 'unknown')}: {msg.get('content', '')}"
            for msg in messages
        ])
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Summarize the conversation in a brief paragraph."},
                {"role": "user", "content": conversation_text}
            ],
            max_tokens=100
        )
        
        return response.choices[0].message.content


openai_service = OpenAIService()