from hashlib import sha256
from slowapi import Limiter
from fastapi import Request

from app.utility.auth import verify_token


def rate_limit_key(request: Request) -> str:
    # 1. Authenticated user: Use user ID from JWT
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth[7:].strip()
        try:
            user_id = verify_token(token)
            if user_id:
                return f"user:{user_id}"
        except Exception:
            pass

    # 2. Guest: IP + device ID
    ip = request.client.host or "unknown"
    device_id = request.headers.get("device-id")
    if device_id:
        return "guest:" + sha256(f"{ip}:{device_id}".encode()).hexdigest()

    # 3. Last resort: IP only
    return f"guest-ip:{ip}"

limiter = Limiter(key_func=rate_limit_key)
