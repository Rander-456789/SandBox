import uuid

from pydantic import BaseModel, Field


class PlaylistGenerateRequest(BaseModel):
    user_id: uuid.UUID
    model: str
    limit: int = Field(default=5, ge=1, le=100)


class PlaylistTrackResponse(BaseModel):
    id: uuid.UUID
    artist_name: str
    track_name: str


class PlaylistGenerateResponse(BaseModel):
    tracks: list[PlaylistTrackResponse]
