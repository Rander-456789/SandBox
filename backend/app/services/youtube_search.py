"""
YouTube Search Service

Легковесный сервис поиска YouTube videoId по artist_name + track_name.
Использует yt-dlp с ytsearch: префиксом — без API-ключа, без OAuth.

Контракт:
    search(artist_name, track_name) → videoId | None
"""

from __future__ import annotations

import logging
from typing import Optional

import yt_dlp

logger = logging.getLogger(__name__)


class YouTubeSearchService:
    """
    Stateless YouTube search через yt-dlp.

    Поисковый запрос: "{artist_name} {track_name} official audio"
    Возвращает первый результат либо None.
    """

    @staticmethod
    def _build_query(artist: str, track: str) -> str:
        return f"{artist} {track} official audio"

    @staticmethod
    def search(artist: str, track: str) -> Optional[str]:
        """
        Поиск YouTube videoId.

        Args:
            artist: имя исполнителя
            track: название трека

        Returns:
            videoId (str) если найден, иначе None
        """
        query = YouTubeSearchService._build_query(artist, track)
        ydl_opts: dict = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": True,
            "default_search": "ytsearch",
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(
                    f"ytsearch1:{query}",
                    download=False,
                )
                if info is None:
                    logger.warning("yt-dlp returned None for query: %s", query)
                    return None

                entries = info.get("entries", [])
                if not entries:
                    logger.info("No YouTube results for query: %s", query)
                    return None

                video_id: str = entries[0]["id"]
                logger.debug("Found videoId=%s for query=%s", video_id, query)
                return video_id

        except yt_dlp.utils.DownloadError as exc:
            logger.warning("yt-dlp DownloadError for query='%s': %s", query, exc)
            return None
        except Exception:
            logger.exception("Unexpected error during YouTube search for query='%s'", query)
            return None


# ── Module-level convenience function ──────────────────────────────────


def search_youtube(artist: str, track: str) -> Optional[str]:
    """Convenience wrapper for YouTubeSearchService.search()."""
    return YouTubeSearchService.search(artist, track)
