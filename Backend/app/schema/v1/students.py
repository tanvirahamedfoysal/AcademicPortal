from typing import Optional
from pydantic import BaseModel

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    mobile_number: Optional[str] = None
    address: Optional[str] = None
    image_url: Optional[str] = None
    student_batch: Optional[int] = None

    