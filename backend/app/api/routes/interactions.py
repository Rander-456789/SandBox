from fastapi import APIRouter

from app.db.session import SessionLocal
from app.models.interaction import Interaction
from app.schemas.interactions import InteractionLogRequest, InteractionLogResponse

router = APIRouter()


@router.post("/", response_model=InteractionLogResponse)
def log_interaction(payload: InteractionLogRequest) -> InteractionLogResponse:
    interaction = Interaction(
        user_id=payload.user_id,
        track_id=payload.track_id,
        model_used=payload.model_used,
        interaction_type=payload.interaction_type,
    )

    with SessionLocal() as session:
        session.add(interaction)
        session.commit()

    return InteractionLogResponse()
