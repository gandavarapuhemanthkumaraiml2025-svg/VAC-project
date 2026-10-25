"""
RootWise Backend - Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    app_name: str = "RootWise API"
    app_version: str = "1.0.0"
    app_env: str = "development"
    log_level: str = "INFO"

    # Database
    database_url: str = "sqlite:///./rootwise.db"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Weather
    weather_cache_ttl_seconds: int = 1800
    weather_request_timeout_seconds: int = 10

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
