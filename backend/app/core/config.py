from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RecSys Music Sandbox"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/recsys_music_sandbox"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
