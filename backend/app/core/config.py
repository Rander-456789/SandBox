from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "RecSys Music Sandbox"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./recsys_music_sandbox.db"
    # M7: Production CORS origins — comma-separated, overridable via env
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
