from hashlib import sha256
from slowapi import Limiter
from fastapi import Request

from app.utility.auth import verify_token


def rate_limit_key(request: Request) -> str:

    # 1. Authenticated user: Use user ID from JWT
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth[7:].strip()
        response = verify_token(token)
        if response["is_valid"]:
            return token

    # 2. Guest: IP + device ID
    ip = request.client.host or "unknown"
    device_id = request.headers.get("device-id", "").strip().lower()
    if device_id:
        return f"{ip}:{device_id}"

    # 3. Last resort: IP only
    return ip


limiter = Limiter(key_func=rate_limit_key)
