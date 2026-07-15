from pydantic import BaseModel

class CollaboratorCreate(BaseModel):
    name: str  
    bio: str
    organization: str | None = None
    website_url: str | None = None
    image_url: str | None = None

class CollaboratorUpdate(BaseModel):
    name: str | None = None
    bio: str | None = None
    organization: str | None = None
    website_url: str | None = None
    image_url: str | None = None