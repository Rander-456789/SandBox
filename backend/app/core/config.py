from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RecSys Music Sandbox"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./recsys_music_sandbox.db"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
