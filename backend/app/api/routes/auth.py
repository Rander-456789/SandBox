import secrets

from fastapi import APIRouter

from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.auth import GuestAuthResponse

router = APIRouter()


@router.post("/guest", response_model=GuestAuthResponse)
def create_guest_user() -> GuestAuthResponse:
    username = f"guest_{secrets.token_hex(3)}"
    user = User(username=username)

    with SessionLocal() as session:
        session.add(user)
        session.commit()
        session.refresh(user)

    return GuestAuthResponse(user_id=user.id)
