"""
Punto de entrada principal para el backend de Arranque Seguro.

Configura la aplicación FastAPI, políticas CORS permisivas para desarrollo local
con exposición de la cabecera 'Content-Disposition' y registro del enrutador de la API.
"""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from .api.routes import router as api_router

# Carga de variables de entorno desde .env si existe en la raíz o backend
try:
    from dotenv import load_dotenv
    root_env = Path(__file__).resolve().parent.parent.parent / ".env"
    backend_env = Path(__file__).resolve().parent.parent / ".env"
    if root_env.exists():
        load_dotenv(root_env)
    elif backend_env.exists():
        load_dotenv(backend_env)
except ImportError:
    pass

app = FastAPI(
    title="Arranque Seguro API",
    description=(
        "API REST para la evaluación automatizada de prototipos de software y generación "
        "de lineamientos de seguridad, arquitectura e instrucciones para asistentes de IA en Navitrans."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# Configuración de CORS
# ---------------------------------------------------------------------------
# Permitir orígenes de desarrollo típicos de Vite, React y Next.js
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # CRÍTICO: Exponer Content-Disposition para que fetch en frontend pueda leer el filename del ZIP
    expose_headers=["Content-Disposition"],
)

# ---------------------------------------------------------------------------
# Registro de Rutas
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix="/api")


@app.get("/", include_in_schema=False)
def root():
    """Redirige automáticamente la raíz a la documentación interactiva Swagger UI."""
    return RedirectResponse(url="/docs")
