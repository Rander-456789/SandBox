"""
GET /youtube/search — поиск YouTube videoId по треку.

Контракт:
    Query params: artist, track
    Response: { "videoId": "xxxxx" } | { "videoId": null }

YouTube — runtime/playback concern only.
Recommender layer НЕ знает про этот endpoint.
"""

from __future__ import annotations

from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.services.youtube_search import search_youtube

router = APIRouter()


class YouTubeSearchResponse(BaseModel):
    videoId: str | None


@router.get(
    "/search",
    response_model=YouTubeSearchResponse,
    summary="Search YouTube for a track's videoId",
)
def youtube_search(
    artist: str = Query(..., description="Исполнитель", min_length=1),
    track: str = Query(..., description="Название трека", min_length=1),
) -> YouTubeSearchResponse:
    """
    Поиск YouTube videoId по artist_name + track_name.

    Использует поисковый запрос:
        "{artist} {track} official audio"

    Возвращает videoId первого результата или null.
    """
    video_id = search_youtube(artist, track)
    return YouTubeSearchResponse(videoId=video_id)
