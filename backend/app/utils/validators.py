import re
from typing import Optional


def validate_phone(phone: str) -> bool:
    pattern = r'^01[0-9]{9}$'
    return bool(re.match(pattern, phone))


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_time_format(time_str: str) -> bool:
    pattern = r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
    return bool(re.match(pattern, time_str))


def validate_date_format(date_str: str) -> bool:
    patterns = [r'^\d{4}-\d{2}-\d{2}$', r'^\d{2}-\d{2}-\d{4}$', r'^\d{2}/\d{2}/\d{4}$']
    return any(re.match(pattern, date_str) for pattern in patterns)


def format_phone(phone: str) -> str:
    digits = re.sub(r'\D', '', phone)
    if digits.startswith('0'):
        return digits
    elif digits.startswith('88'):
        return digits[2:]
    elif len(digits) == 10:
        return digits
    return digits


def extract_phone_from_text(text: str) -> Optional[str]:
    patterns = [
        r'01[0-9]{9}',
        r'\+8801[0-9]{9}',
        r'8801[0-9]{9}',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            phone = match.group()
            return format_phone(phone)
    return None


def extract_name_from_text(text: str) -> Optional[str]:
    words = text.split()
    if len(words) >= 2:
        return " ".join(words[:2])
    return text.strip()


SERVICES = [
    "Dental Checkup",
    "Teeth Cleaning",
    "Tooth Extraction",
    "Root Canal",
    "Braces Consultation",
    "Teeth Whitening",
    "Gum Treatment"
]


def is_valid_service(service: str) -> bool:
    return service in SERVICES


def normalize_service(service: str) -> Optional[str]:
    service_lower = service.lower()
    for s in SERVICES:
        if s.lower() in service_lower or service_lower in s.lower():
            return s
    return None
