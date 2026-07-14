from datetime import datetime
from zoneinfo import ZoneInfo

def utc_now():
    return datetime.now(ZoneInfo("UTC"))

def bd_now(utc_dt: datetime) -> datetime:
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=ZoneInfo("UTC"))
    return utc_dt.astimezone(ZoneInfo("Asia/Dhaka"))