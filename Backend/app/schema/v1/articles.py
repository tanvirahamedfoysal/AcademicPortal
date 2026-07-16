from pydantic import BaseModel

class ArticleCreate(BaseModel):
    title: str
    body: str

class ArticleUpdate(BaseModel):
    title: str | None = None
    body: str | None = None

class ArticleStatusUpdate(BaseModel):
    status: str