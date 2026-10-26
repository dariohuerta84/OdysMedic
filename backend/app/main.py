from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes_specialties import router as specialties_router
from app.api.routes_cases import router as cases_router
from app.api.routes_evaluation import router as evaluation_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "API del Motor Clínico Adaptativo y Evaluador Retrospectivo de OdyssMedic "
        "(UPCH - Proyectos de Ingeniería 2 / BioIncubadora Cayetano 2026)."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuración de CORS para integración con Frontend (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montaje de routers con prefijo de versionamiento
app.include_router(specialties_router, prefix=settings.api_prefix)
app.include_router(cases_router, prefix=settings.api_prefix)
app.include_router(evaluation_router, prefix=settings.api_prefix)

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
