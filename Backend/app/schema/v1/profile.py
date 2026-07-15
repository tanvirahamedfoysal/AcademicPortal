from pydantic import BaseModel, EmailStr, field_validator

class UpdateProfile(BaseModel):
    name: str  
    username: str
    email: EmailStr
    password: str
    otp: str
    student_batch: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if '@' in value:
            raise ValueError("Username can't contain '@' symbol.")
        return value


class ChangeUsername(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if '@' in value:
            raise ValueError("Username can't contain '@' symbol.")
        return value
    
    