from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.track import Track
from app.models.user import User
from app.recommenders.registry import RECOMMENDER_REGISTRY
from app.schemas.playlist import (
    PlaylistGenerateRequest,
    PlaylistGenerateResponse,
    PlaylistTrackResponse,
)

router = APIRouter()


@router.post("/generate", response_model=PlaylistGenerateResponse)
def generate_playlist(payload: PlaylistGenerateRequest) -> PlaylistGenerateResponse:
    recommender_factory = RECOMMENDER_REGISTRY.get(payload.model)
    if recommender_factory is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown model: {payload.model}",
        )

    with SessionLocal() as session:
        # C4: validate user exists
        user = session.get(User, payload.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User not found: {payload.user_id}",
            )

        recommender = recommender_factory(session)
        track_ids = recommender.recommend(user_id=payload.user_id, limit=payload.limit)
        if not track_ids:
            return PlaylistGenerateResponse(tracks=[])

        tracks = session.scalars(select(Track).where(Track.id.in_(track_ids))).all()
        tracks_by_id = {track.id: track for track in tracks}

        response_tracks = [
            PlaylistTrackResponse(
                id=track_id,
                artist_name=tracks_by_id[track_id].artist_name,
                track_name=tracks_by_id[track_id].track_name,
            )
            for track_id in track_ids
            if track_id in tracks_by_id
        ]

        # M8: warn if some track_ids from recommender were not found in DB
        if len(response_tracks) < len(track_ids):
            missing = set(str(tid) for tid in track_ids if tid not in tracks_by_id)
            # Log rather than fail — remaining tracks are still valid
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(
                "Recommender returned %d ids but only %d found in DB. Missing: %s",
                len(track_ids), len(response_tracks), missing,
            )

    return PlaylistGenerateResponse(tracks=response_tracks)
