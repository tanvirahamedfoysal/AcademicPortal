from slowapi import Limiter
from fastapi import Request

def get_device_id(request: Request) -> str:
    return request.headers.get(
        "device-id",
        request.client.host,
    )

limiter = Limiter(key_func=get_device_id)