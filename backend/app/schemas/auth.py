import uuid

from pydantic import BaseModel


class GuestAuthResponse(BaseModel):
    user_id: uuid.UUID
