from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.track import Track
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

    return PlaylistGenerateResponse(tracks=response_tracks)
