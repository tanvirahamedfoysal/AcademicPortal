from pydantic import BaseModel, EmailStr, HttpUrl

class AdminInfoUpdate(BaseModel):
    school: str | None = None
    college: str | None = None
    public_bio: str | None = None
    research_description: str | None = None
    research_interests: list[str] | None = None
    email: EmailStr | None = None
    phone: str | None = None
    github_url: HttpUrl | str | None = None
    orcid_url: HttpUrl | str | None = None
    researchgate_url: HttpUrl | str | None = None
    google_scholar_url: HttpUrl | str | None = None
    cv_url: HttpUrl | str | None = None
    discord_url: HttpUrl | str | None = None
    linkedin_url: HttpUrl | str | None = None
    facebook_url: HttpUrl | str | None = None
    x_url: HttpUrl | str | None = None
    instagram_url: HttpUrl | str | None = None