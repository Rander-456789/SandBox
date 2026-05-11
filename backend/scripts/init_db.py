from app.db.session import engine, Base
from app.models import user, track, interaction  # важно: импорт моделей

def main():
    Base.metadata.create_all(bind=engine)
    print("DB tables created")

if __name__ == "__main__":
    main()