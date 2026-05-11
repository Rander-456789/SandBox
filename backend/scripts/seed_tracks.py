import csv
import sys
from pathlib import Path

from sqlalchemy.dialects.postgresql import insert

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import SessionLocal
from app.models.track import Track

BATCH_SIZE = 1000
CSV_PATH = PROJECT_ROOT / "Last.fm_data.csv"


def flush_batch(rows: list[dict[str, str]]) -> int:
    if not rows:
        return 0

    statement = insert(Track).values(rows)
    statement = statement.on_conflict_do_nothing(
        index_elements=["artist_name", "track_name"],
    )

    with SessionLocal() as session:
        result = session.execute(statement)
        session.commit()

    return result.rowcount or 0


def main() -> None:
    total_inserted = 0
    batch: list[dict[str, str]] = []

    with CSV_PATH.open(mode="r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)

        for row in reader:
            artist_name = (row.get("Artist") or "").strip()
            track_name = (row.get("Track") or "").strip()

            if not artist_name or not track_name:
                continue

            batch.append({"artist_name": artist_name, "track_name": track_name})

            if len(batch) >= BATCH_SIZE:
                total_inserted += flush_batch(batch)
                batch.clear()

    if batch:
        total_inserted += flush_batch(batch)

    print(f"Inserted tracks: {total_inserted}")


if __name__ == "__main__":
    main()
