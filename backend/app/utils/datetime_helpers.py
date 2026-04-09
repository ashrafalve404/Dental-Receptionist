from datetime import datetime, timedelta, time
from typing import List, Optional


def parse_date(date_str: str) -> Optional[datetime]:
    if not date_str:
        return None
    
    date_str_lower = date_str.lower().strip()
    
    today = datetime.now().date()
    
    if date_str_lower in ['today', 'todays']:
        return datetime.combine(today, datetime.min.time())
    
    if date_str_lower in ['tomorrow', 'tmrw', 'tmr']:
        return datetime.combine(today + timedelta(days=1), datetime.min.time())
    
    if date_str_lower in ['yesterday', 'yest']:
        return datetime.combine(today - timedelta(days=1), datetime.min.time())
    
    if 'next week' in date_str_lower:
        return datetime.combine(today + timedelta(days=7), datetime.min.time())
    
    weekday_map = {
        'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
        'friday': 4, 'saturday': 5, 'sunday': 6
    }
    
    for day_name, target_weekday in weekday_map.items():
        if day_name in date_str_lower:
            current_weekday = today.weekday()
            days_ahead = target_weekday - current_weekday
            if days_ahead <= 0:
                days_ahead += 7
            if 'next' in date_str_lower:
                days_ahead += 7
            return datetime.combine(today + timedelta(days=days_ahead), datetime.min.time())
    
    formats = ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d", "%B %d, %Y", "%b %d, %Y", "%B %d %Y", "%b %d %Y", "%d %B %Y", "%d %b %Y", "%d-%B-%Y", "%d-%b-%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    return None


def parse_time(time_str: str) -> Optional[time]:
    formats = ["%H:%M", "%I:%M %p", "%H:%M:%S"]
    for fmt in formats:
        try:
            return datetime.strptime(time_str, fmt).time()
        except ValueError:
            continue
    return None


def format_datetime(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M")


def format_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def format_time(t: time) -> str:
    return t.strftime("%H:%M")


def get_time_slots(start_time: str, end_time: str, duration_minutes: int = 30) -> List[str]:
    slots = []
    start = datetime.strptime(start_time, "%H:%M")
    end = datetime.strptime(end_time, "%H:%M")
    
    current = start
    while current < end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(minutes=duration_minutes)
    
    return slots


def is_friday(date: datetime) -> bool:
    return date.weekday() == 4


def is_valid_clinic_day(date: datetime, working_days: List[str]) -> bool:
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return day_names[date.weekday()] in working_days


def get_next_available_date(working_days: List[str]) -> datetime:
    today = datetime.now()
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    for i in range(7):
        check_date = today + timedelta(days=i)
        if is_valid_clinic_day(check_date, working_days) and not is_friday(check_date):
            return check_date
    
    return today
