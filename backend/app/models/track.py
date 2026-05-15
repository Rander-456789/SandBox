import uuid

from sqlalchemy import String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Track(Base):
    __tablename__ = "tracks"
    __table_args__ = (
        UniqueConstraint("artist_name", "track_name", name="uq_tracks_artist_track"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artist_name: Mapped[str] = mapped_column(String(255), nullable=False)
    track_name: Mapped[str] = mapped_column(String(255), nullable=False)
