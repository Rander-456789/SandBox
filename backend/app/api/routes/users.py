from fastapi import APIRouter
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.users import UserItem

router = APIRouter()


@router.get("/", response_model=list[UserItem])
def list_users() -> list[UserItem]:
    """Возвращает список ВСЕХ существующих пользователей из таблицы users.

    Никаких mock-данных, никаких hardcoded значений.
    Только реальные записи из БД.
    """
    with SessionLocal() as session:
        stmt = select(User).order_by(User.created_at.desc())
        users = session.execute(stmt).scalars().all()
        return [UserItem(id=str(u.id), username=u.username) for u in users]
