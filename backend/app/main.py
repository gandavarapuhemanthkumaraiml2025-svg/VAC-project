"""
RootWise FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.db import init_db, get_db, SessionLocal
from app.api.advisory import router as advisory_router
from app.api.plants import router as plants_router
from app.api.weather import router as weather_router
from app.api.observations import router as observations_router
from app.api.sources import sources_router, dataset_router, evaluation_router
from app.schemas.schemas import HealthResponse
from app.services.seed_service import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and seed initial data."""
    logger.info("Starting RootWise API v%s", settings.app_version)
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    logger.info("RootWise API shutting down.")


app = FastAPI(
    title="RootWise API",
    description="AI-based plant watering advisory backend. "
                "Combines plant profiles, soil observations, and weather data "
                "to produce transparent, source-backed watering recommendations.",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(plants_router)
app.include_router(weather_router)
app.include_router(advisory_router)
app.include_router(observations_router)
app.include_router(sources_router)
app.include_router(dataset_router)
app.include_router(evaluation_router)


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health_check():
    """Backend health check."""
    db_status = "ok"
    try:
        db = SessionLocal()
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db.close()
    except Exception:
        db_status = "error"

    return HealthResponse(
        status="ok",
        version=settings.app_version,
        database=db_status,
        weather_provider="open-meteo (free, no key required)",
        timestamp=datetime.now(timezone.utc),
    )


@app.get("/", include_in_schema=False)
def root():
    return {"message": "RootWise API is running. Visit /api/docs for documentation."}
