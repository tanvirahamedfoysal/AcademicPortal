from pydantic import BaseModel, EmailStr

class CreateMessage(BaseModel):
    name: str  
    email: EmailStr
    message: str

