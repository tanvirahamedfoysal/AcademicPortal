from datetime import datetime, timedelta, UTC, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password( plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify( plain_password, hashed_password)


def create_access_token(data: dict):
    payload = data.copy() 
    expire_minutes = getattr(settings, "access_token_expire_minutes", 60)
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    payload.update({"exp": expire})
    token = jwt.encode(
        payload,
        getattr(settings, "secret_key", ""),
        algorithm=getattr(settings, "algorithm", "HS256")
    )
    return token

 
def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            getattr(settings, "secret_key", ""),
            algorithms=[getattr(settings, "algorithm", "HS256")]
        )
        return {
            "is_valid": True,
            "data": payload
        }
    except JWTError:
        return {
            "is_valid": False,
            "data": None
        }
    
def validate_user_access(token: str) -> dict:
    """
    Validates the user access based on the provided JWT token.
    Returns a dictionary with 'is_valid' and 'data' keys.
    """
    response = verify_token(token)
    if response["is_valid"]:
        user_data = response["data"]
        # You can add additional checks here, e.g., check user roles, permissions, etc.
        return {
            "is_valid": True,
            "data": user_data
        }
    else:
        return {
            "is_valid": False,
            "data": None
        }
