from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.interaction import Interaction
from app.models.track import Track
from app.models.user import User
from app.schemas.interactions import InteractionLogRequest, InteractionLogResponse

router = APIRouter()


@router.post("/", response_model=InteractionLogResponse)
def log_interaction(payload: InteractionLogRequest) -> InteractionLogResponse:
    # C3: validate that user_id and track_id exist before logging
    with SessionLocal() as session:
        user_exists = session.get(User, payload.user_id)
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User not found: {payload.user_id}",
            )
        track_exists = session.get(Track, payload.track_id)
        if not track_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Track not found: {payload.track_id}",
            )

        interaction = Interaction(
            user_id=payload.user_id,
            track_id=payload.track_id,
            model_used=payload.model_used,
            interaction_type=payload.interaction_type,
        )
        session.add(interaction)
        session.commit()
        interaction_id = interaction.id  # N4: capture before session closes

    # N4: return interaction id for debugging
    return InteractionLogResponse(interaction_id=interaction_id)
