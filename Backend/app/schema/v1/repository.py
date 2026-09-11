from pydantic import BaseModel


class DeleteResourcePayload(BaseModel):
    urls: list[str]