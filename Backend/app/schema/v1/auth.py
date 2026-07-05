from pydantic import BaseModel, EmailStr, field_validator

class UserRegister(BaseModel):
    name: str  
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if '@' in value:
            raise ValueError("Username can't contain '@' symbol.")
        return value
    

class ValidateUsername(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if '@' in value:
            raise ValueError("Username can't contain '@' symbol.")
        return value
    

class RequestOTP(BaseModel):
    email: EmailStr


class UserLogin(BaseModel):
    credential: str
    password: str


