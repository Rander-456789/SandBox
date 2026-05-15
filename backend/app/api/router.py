from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.interactions import router as interactions_router
from app.api.routes.playlist import router as playlist_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(playlist_router, prefix="/playlist", tags=["playlist"])
router.include_router(interactions_router, prefix="/interactions", tags=["interactions"])


@router.get("/health")
def health_check() -> dict[str, str]:
    # N5: also verify DB connectivity
    from app.db.session import SessionLocal
    try:
        with SessionLocal() as session:
            session.execute(session.bind.dialect.do_ping(None))
    except Exception:
        return {"status": "degraded", "db": "unreachable"}
    return {"status": "ok"}
