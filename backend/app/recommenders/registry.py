from collections.abc import Callable

from sqlalchemy.orm import Session

from app.recommenders.base import BaseRecommender
from app.recommenders.random import RandomRecommender

RecommenderFactory = Callable[[Session], BaseRecommender]

RECOMMENDER_REGISTRY: dict[str, RecommenderFactory] = {
    "random": RandomRecommender,
}
