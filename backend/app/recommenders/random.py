import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.models.track import Track
from app.recommenders.base import BaseRecommender


class RandomRecommender(BaseRecommender):
    def __init__(self, session: Session) -> None:
        self.session = session

    def recommend(self, user_id: uuid.UUID, limit: int) -> list[uuid.UUID]:
        _ = user_id
        statement = select(Track.id).order_by(func.random()).limit(limit)
        track_ids = self.session.scalars(statement).all()
        return list(track_ids)
