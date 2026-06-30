from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
import cloudinary


BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    api_title: str
    api_version: str
    api_description: str

    database_url: str
    database_echo: bool
    secret_key: str
    internal_api_key: str
    algorithm: str
    access_token_expire_minutes: int

    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str

    smtp_host: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    mail_from: str

    debug: bool
    environment: str

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

settings = Settings()

async def async_init_settings() -> Settings:
    return settings


cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True
)