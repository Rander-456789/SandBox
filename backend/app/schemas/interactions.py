import uuid
from typing import Literal

from pydantic import BaseModel

from app.models.interaction import InteractionType


class InteractionLogRequest(BaseModel):
    user_id: uuid.UUID
    track_id: uuid.UUID
    model_used: str
    interaction_type: InteractionType


class InteractionLogResponse(BaseModel):
    status: Literal["ok"] = "ok"
