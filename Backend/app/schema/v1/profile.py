from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

class UpdateProfile(BaseModel):
    name: str | None = None
    bio: str | None = None
    password: str | None = None
    mobile_number: str | None = None
    image_url: str | None = None
    student_batch: str | None = None


class ChangeUsername(BaseModel):
    username: str | None = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if '@' in value:
            raise ValueError("Username can't contain '@' symbol.")
        return value
    

class ChangeEmail(BaseModel):
    new_email: EmailStr | None = None

