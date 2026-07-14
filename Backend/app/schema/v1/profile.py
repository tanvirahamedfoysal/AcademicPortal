from pydantic import BaseModel, EmailStr, field_validator

class UpdateProfile(BaseModel):
    name: str  
    username: str
    email: EmailStr
    password: str
    otp: str
    student_batch: str

    