from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_USERNAME: str = "postgres"
    DATABASE_PASSWORD: str = "docker"
    DATABASE_NAME: str = "innovationhub"
    DATABASE_SSL: bool = False

    # JWT
    JWT_SECRET: str = "change-me"
    JWT_EXPIRATION_MINUTES: int = 15
    JWT_REFRESH_SECRET: str = "change-me-refresh"
    JWT_REFRESH_EXPIRATION_DAYS: int = 7

    # Default password
    DEFAULT_PASSWORD: str = "ih123"

    # CORS
    CORS_ORIGIN: str = "http://localhost:3001"

    # Mail
    MAIL_HOST: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USER: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""

    @property
    def database_url(self) -> str:
        scheme = "postgresql+asyncpg"
        return (
            f"{scheme}://{self.DATABASE_USERNAME}:{self.DATABASE_PASSWORD}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )

    @property
    def database_url_sync(self) -> str:
        """URL síncrona para uso com Alembic."""
        return (
            f"postgresql://{self.DATABASE_USERNAME}:{self.DATABASE_PASSWORD}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGIN.split(",") if origin.strip()]


settings = Settings()
