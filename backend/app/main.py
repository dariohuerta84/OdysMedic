from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse

from app.config import settings
from app.db.session import ensure_db_ready, get_storage_status
from app.api.routes_auth import router as auth_router
from app.api.routes_specialties import router as specialties_router
from app.api.routes_cases import router as cases_router
from app.api.routes_evaluation import router as evaluation_router
from app.api.routes_leveling import router as leveling_router
from app.api.routes_references import router as references_router


EDITORIAL_SWAGGER_CSS = """
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap" rel="stylesheet" />
<style>
  :root { color-scheme: light; }
  body { background: #FAF9F6 !important; color: #0D1F26 !important; font-family: 'Inter', system-ui, sans-serif !important; }
  .swagger-ui .topbar { background: #0D1F26 !important; border-bottom: 2px solid #0E6F65; padding: 12px 0; }
  .swagger-ui .topbar .download-url-wrapper input[type=text] { border: 1px solid #3D525A; border-radius: 4px; }
  .swagger-ui .info .title { font-family: 'Source Serif 4', Georgia, serif !important; color: #0D1F26 !important; font-weight: 700; }
  .swagger-ui .info p, .swagger-ui .opblock-description-wrapper p { color: #3D525A !important; }
  .swagger-ui .opblock { border-radius: 4px !important; box-shadow: none !important; border: 1px solid #DEDBD2 !important; background: #FFFFFF !important; }
  .swagger-ui .opblock-tag { font-family: 'Source Serif 4', Georgia, serif !important; color: #0D1F26 !important; border-bottom: 1px solid #DEDBD2 !important; }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #0E6F65 !important; border-radius: 3px; font-family: 'JetBrains Mono', monospace; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #0D1F26 !important; border-radius: 3px; font-family: 'JetBrains Mono', monospace; }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method, .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #9A6B1F !important; border-radius: 3px; font-family: 'JetBrains Mono', monospace; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #A6262E !important; border-radius: 3px; font-family: 'JetBrains Mono', monospace; }
  .swagger-ui .opblock-summary-path { font-family: 'JetBrains Mono', monospace !important; color: #0D1F26 !important; }
  .swagger-ui .btn.execute { background-color: #0E6F65 !important; border-color: #0E6F65 !important; border-radius: 4px !important; }
  .swagger-ui .btn.authorize { color: #0E6F65 !important; border-color: #0E6F65 !important; border-radius: 4px !important; }
  .swagger-ui code, .swagger-ui pre { font-family: 'JetBrains Mono', monospace !important; }
</style>
"""


def render_editorial_portal_html() -> str:
    storage = get_storage_status()
    storage_mode = str(storage["storage_mode"])
    persistent_label = "Persistente" if storage["persistent"] else "Efimero (/tmp Serverless)"
    persistence_color = "#0E6F65" if storage["persistent"] else "#9A6B1F"
    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OdyssMedic API · Motor Clinico OCRI-HLR</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap" rel="stylesheet" />
  <style>
    * {{ box-sizing: border-box; }}
    body {{ margin: 0; background: #FAF9F6; color: #0D1F26; font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; }}
    .wrap {{ max-width: 960px; margin: 0 auto; padding: 48px 24px 64px; }}
    .kicker {{ font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #0E6F65; margin: 0 0 12px; }}
    h1 {{ font-family: 'Source Serif 4', Georgia, serif; font-size: 38px; line-height: 1.15; margin: 0 0 14px; font-weight: 700; }}
    .lead {{ font-size: 16px; color: #3D525A; max-width: 68ch; margin: 0 0 28px; }}
    .rule {{ border: 0; border-top: 1px solid #DEDBD2; margin: 28px 0; }}
    .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0; border-top: 1px solid #DEDBD2; border-bottom: 1px solid #DEDBD2; }}
    .metric {{ padding: 18px 16px; border-right: 1px solid #DEDBD2; }}
    .metric:last-child {{ border-right: 0; }}
    .metric-label {{ font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #3D525A; display: block; margin-bottom: 6px; }}
    .metric-val {{ font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 500; color: #0D1F26; }}
    .links {{ display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }}
    a.btn {{ display: inline-block; padding: 11px 18px; text-decoration: none; font-size: 14px; font-weight: 500; border: 1px solid #0E6F65; transition: background 0.15s ease; }}
    a.btn-primary {{ background: #0E6F65; color: #FAF9F6; }}
    a.btn-primary:hover {{ background: #0A564E; }}
    a.btn-secondary {{ background: transparent; color: #0D1F26; border-color: #DEDBD2; }}
    a.btn-secondary:hover {{ border-color: #0E6F65; color: #0E6F65; }}
    table {{ width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }}
    th, td {{ text-align: left; padding: 12px 10px; border-bottom: 1px solid #DEDBD2; }}
    th {{ font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #3D525A; }}
    code {{ font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #0E6F65; }}
  </style>
</head>
<body>
  <main class="wrap">
    <p class="kicker">OdyssMedic · Servicio Clinico Adaptativo · v{settings.app_version}</p>
    <h1>API del Motor OCRI-HLR y Ruta Clinica Progresiva</h1>
    <p class="lead">Servicio FastAPI + SQLAlchemy 2.0 para simulacion clinica en 3 estaciones, diagnostico de 4 brechas cognitivas, memoria adaptativa Half-Life Regression (Settles &amp; Meeder, 2016) y dificultad optima IRT/Birdbrain.</p>

    <div class="metrics">
      <div class="metric">
        <span class="metric-label">Estado del servicio</span>
        <span class="metric-val" style="color:#0E6F65;">HEALTHY</span>
      </div>
      <div class="metric">
        <span class="metric-label">Modo de almacenamiento</span>
        <span class="metric-val" style="color:{persistence_color};">{storage_mode}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Persistencia</span>
        <span class="metric-val">{persistent_label}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Referencias clinicas</span>
        <span class="metric-val">57 fuentes verificadas</span>
      </div>
    </div>

    <div class="links">
      <a class="btn btn-primary" href="/docs">Explorar Documentacion Swagger</a>
      <a class="btn btn-secondary" href="/redoc">Abrir ReDoc</a>
      <a class="btn btn-secondary" href="/api/v1/health">JSON Healthcheck</a>
    </div>

    <hr class="rule" />
    <h2 style="font-family:'Source Serif 4',Georgia,serif;font-size:22px;margin:0 0 8px;">Endpoints Principales</h2>
    <table>
      <thead><tr><th>Metodo</th><th>Ruta</th><th>Proposito</th></tr></thead>
      <tbody>
        <tr><td><code>POST</code></td><td><code>/api/v1/auth/register</code></td><td>Registro persistente con correo normalizado y calibracion inicial HLR.</td></tr>
        <tr><td><code>GET</code></td><td><code>/api/v1/leveling/learning-path</code></td><td>Ruta Clinica Progresiva (5 unidades x 4 nodos) con vida media h y recuerdo HLR.</td></tr>
        <tr><td><code>GET</code></td><td><code>/api/v1/leveling/dashboard</code></td><td>Radar OCRI, telemetria HLR, ruta progresiva y cola espaciada D7/D21.</td></tr>
        <tr><td><code>POST</code></td><td><code>/api/v1/leveling/simulate-days</code></td><td>Simulador longitudinal (+1d, +7d, +21d, 14d de inactividad y reset Dia 0).</td></tr>
        <tr><td><code>GET</code></td><td><code>/api/v1/references/books</code></td><td>Biblioteca clinica abierta con 27 guias internacionales y listas semiologicas.</td></tr>
      </tbody>
    </table>
  </main>
</body>
</html>"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializacion de base de datos relacional y siembra de datos canonicos
    ensure_db_ready(force=True)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "API del Motor Clinico Adaptativo OCRI-HLR y Evaluador Retrospectivo de OdyssMedic "
        "(UPCH - Proyectos de Ingenieria 2 / BioIncubadora Cayetano 2026)."
    ),
    docs_url=None,
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configuracion de CORS para integracion con Frontend (Vite SPA / Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
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


@app.get("/docs", include_in_schema=False)
def custom_swagger_ui():
    response = get_swagger_ui_html(
        openapi_url=app.openapi_url or "/openapi.json",
        title=f"{settings.app_name} · Documentacion Editorial",
    )
    html_body = response.body.decode("utf-8").replace(
        "</head>",
        f"{EDITORIAL_SWAGGER_CSS}\n</head>",
    )
    return HTMLResponse(content=html_body, status_code=200)


@app.get("/portal", include_in_schema=False, response_class=HTMLResponse)
def editorial_portal():
    return HTMLResponse(content=render_editorial_portal_html(), status_code=200)


@app.get("/health", tags=["Salud del Sistema"])
@app.get("/api/health", tags=["Salud del Sistema"])
@app.get("/api/v1/health", tags=["Salud del Sistema"])
def health_check():
    storage = get_storage_status()
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "storage_mode": storage["storage_mode"],
        "persistent": storage["persistent"],
    }


@app.get("/", tags=["Root"])
def root(request: Request):
    accept = (request.headers.get("accept") or "").lower()
    wants_html = "text/html" in accept and (
        "application/json" not in accept
        or accept.index("text/html") < accept.index("application/json")
    )
    if wants_html:
        return HTMLResponse(content=render_editorial_portal_html(), status_code=200)
    return {
        "message": "Bienvenido a la API de OdyssMedic",
        "docs": "/docs",
        "health": "/health",
        "portal": "/portal",
    }
