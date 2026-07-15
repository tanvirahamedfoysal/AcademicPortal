from pydantic import BaseModel


class DeleteImagesPayload(BaseModel):
    urls: list[str]