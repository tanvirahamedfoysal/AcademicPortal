import asyncio
import cloudinary.uploader
from typing import Any, Dict


async def upload_asset_to_cloudinary(file: Any) -> Dict[str, str]:
    result = await asyncio.to_thread(
        cloudinary.uploader.upload,
        file.file,
        folder="AcademicPortal",
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}


async def remove_asset_from_cloudinary(public_id: str) -> Dict[str, Any]:
    result = await asyncio.to_thread(cloudinary.uploader.destroy, public_id)
    return result