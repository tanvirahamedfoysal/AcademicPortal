from datetime import datetime
from zoneinfo import ZoneInfo
 
def bd_now():
    return datetime.now(ZoneInfo("Asia/Dhaka"))

