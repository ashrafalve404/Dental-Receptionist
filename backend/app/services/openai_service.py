import json
import re
from typing import Optional, Dict, Any
from openai import OpenAI
from app.core.config import get_settings


class OpenAIService:
    def __init__(self):
        settings = get_settings()
        self.openai_key = settings.OPENAI_API_KEY
        self.groq_key = settings.GROQ_API_KEY
        self._client = None
        self._use_groq = False
    
    @property
    def client(self) -> Optional[OpenAI]:
        if self._client is None:
            key = self.groq_key or self.openai_key
            if key:
                base_url = None
                if self.groq_key:
                    base_url = "https://api.groq.com/openai/v1"
                    self._use_groq = True
                self._client = OpenAI(api_key=key, base_url=base_url)
        return self._client
    
    def _get_model(self) -> str:
        if self._use_groq:
            return "llama-3.1-8b-instant"
        return "gpt-4o-mini"
    
    def get_response(
        self,
        system_prompt: str,
        user_message: str,
        conversation_history: list = None
    ) -> str:
        if not self.client:
            return "AI service not configured. Please set OPENAI_API_KEY or GROQ_API_KEY."
        
        messages: list = [{"role": "system", "content": system_prompt}]
        
        if conversation_history:
            for msg in conversation_history:
                if msg.get("role") and msg.get("content"):
                    messages.append(msg)
        
        messages.append({"role": "user", "content": user_message})
        
        try:
            response = self.client.chat.completions.create(
                model=self._get_model(),
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            content = response.choices[0].message.content
            return content if content else "I'm here to help you book an appointment. How can I assist you today?"
        except Exception as e:
            print(f"Primary AI API error: {e}")
            
            if not self._use_groq and self.groq_key:
                try:
                    self._client = OpenAI(
                        api_key=self.groq_key,
                        base_url="https://api.groq.com/openai/v1"
                    )
                    self._use_groq = True
                    response = self.client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=messages,
                        temperature=0.7,
                        max_tokens=500
                    )
                    content = response.choices[0].message.content
                    return content if content else "I'm here to help you book an appointment. How can I assist you today?"
                except Exception as e2:
                    print(f"Fallback Groq API error: {e2}")
            
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
                model=self._get_model(),
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
        
        try:
            response = self.client.chat.completions.create(
                model=self._get_model(),
                messages=[
                    {"role": "system", "content": "Summarize the conversation in a brief paragraph."},
                    {"role": "user", "content": conversation_text}
                ],
                max_tokens=100
            )
            
            content = response.choices[0].message.content
            return content if content else ""
        except Exception as e:
            print(f"Summarize error: {e}")
            return ""


openai_service = OpenAIService()