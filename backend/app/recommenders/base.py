import uuid
from abc import ABC, abstractmethod


class BaseRecommender(ABC):
    @abstractmethod
    def recommend(self, user_id: uuid.UUID, limit: int) -> list[uuid.UUID]:
        raise NotImplementedError
