from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.session import init_db, SessionLocal
from app.db.seeder import seed_initial_data
from app.api.routes_auth import router as auth_router
from app.api.routes_specialties import router as specialties_router
from app.api.routes_cases import router as cases_router
from app.api.routes_evaluation import router as evaluation_router
from app.api.routes_leveling import router as leveling_router
from app.api.routes_references import router as references_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializacion de base de datos relacional y siembra de datos canonicos
    init_db()
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "API del Motor Clinico Adaptativo y Evaluador Retrospectivo de OdyssMedic "
        "(UPCH - Proyectos de Ingenieria 2 / BioIncubadora Cayetano 2026)."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configuracion de CORS para integracion con Frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montaje de routers con prefijo de versionamiento
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(specialties_router, prefix=settings.api_prefix)
app.include_router(cases_router, prefix=settings.api_prefix)
app.include_router(evaluation_router, prefix=settings.api_prefix)
app.include_router(leveling_router, prefix=settings.api_prefix)
app.include_router(references_router, prefix=settings.api_prefix)


@app.get("/health", tags=["Salud del Sistema"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Bienvenido a la API de OdyssMedic",
        "docs": "/docs",
        "health": "/health",
    }
