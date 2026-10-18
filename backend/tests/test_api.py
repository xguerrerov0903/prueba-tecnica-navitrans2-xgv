"""
Pruebas de integración HTTP para la API REST de Arranque Seguro.

Cobertura:
1. GET /api/health (estado del servicio).
2. GET /api/profiles (3 perfiles oficiales precargados).
3. POST /api/evaluate (evaluación con Profile 1 y Profile 2).
4. POST /api/evaluate (validación del servidor con error 422).
5. POST /api/generate-package (generación de paquete, R6 y anti-tamper).
6. POST /api/download-zip (verificación de Content-Disposition sanitizado y contenido en memoria del ZIP).
7. Verificación de CORS y exposición de la cabecera Content-Disposition.
"""

from __future__ import annotations

import io
import sys
import zipfile
from pathlib import Path

# Asegurar que backend esté en sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.routes import OFFICIAL_PROFILES

client = TestClient(app)


# ===========================================================================
# 1. PRUEBAS DE SALUD Y PERFILES
# ===========================================================================

def test_health_endpoint():
    """Valida que /api/health responda HTTP 200 con el estado del sistema."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "Arranque Seguro"
    assert "version" in data


def test_get_profiles_endpoint():
    """Valida que /api/profiles retorne los 3 perfiles oficiales estructurados."""
    response = client.get("/api/profiles")
    assert response.status_code == 200
    profiles = response.json()
    assert len(profiles) == 3

    ids = [p["id"] for p in profiles]
    assert ids == ["perfil-1-llantas", "perfil-2-garantias", "perfil-3-citas"]

    for profile in profiles:
        assert "id" in profile
        assert "title" in profile
        assert "description" in profile
        assert "request" in profile
        req = profile["request"]
        assert "name" in req
        assert "area" in req
        assert "stage" in req
        assert "data_types" in req


# ===========================================================================
# 2. PRUEBAS DE EVALUACIÓN Y VALIDACIÓN DEL SERVIDOR
# ===========================================================================

def test_evaluate_profile_1():
    """Valida la evaluación pura del Perfil 1 (baja criticidad, datos ficticios)."""
    p1_payload = OFFICIAL_PROFILES[0].request.model_dump(mode="json")
    response = client.post("/api/evaluate", json=p1_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["effective_level"] == "basic"
    assert data["has_security_issues"] is False
    assert len(data["security_alerts"]) == 0
    assert "decisions_doc" in data["mandatory_controls"]
    assert "login_required" not in data["mandatory_controls"]


def test_evaluate_profile_2_pii_sanitized():
    """Valida la evaluación del Perfil 2 con detección y sanitización de PII en responsable."""
    p2_payload = OFFICIAL_PROFILES[1].request.model_dump(mode="json")
    response = client.post("/api/evaluate", json=p2_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["effective_level"] == "strict"
    assert data["has_security_issues"] is True
    assert data["sanitized_owner"] == "Andrea Ríos Restrepo — andrea.rios@ejemplo.com.co"
    assert "1.017.284.553" not in data["sanitized_owner"]
    assert "310 555 0187" not in data["sanitized_owner"]


def test_evaluate_validation_error_422():
    """Valida que el servidor rechace solicitudes incompletas con código 422."""
    # Falta 'name' y 'data_types'
    invalid_payload = {
        "description": "Faltan campos obligatorios",
        "area": "taller",
        "stage": "prototype",
    }
    response = client.post("/api/evaluate", json=invalid_payload)
    assert response.status_code == 422
    error_data = response.json()
    assert "detail" in error_data


def test_evaluate_invalid_enum_422():
    """Valida que el servidor rechace valores fuera de catálogo (enums) con 422."""
    payload = OFFICIAL_PROFILES[0].request.model_dump(mode="json")
    payload["area"] = "area_inexistente_xyz"
    response = client.post("/api/evaluate", json=payload)
    assert response.status_code == 422


# ===========================================================================
# 3. PRUEBAS DE GENERACIÓN DE PAQUETE
# ===========================================================================

def test_generate_package_profile_3():
    """Valida la generación completa de paquetes para el Perfil 3."""
    p3_payload = OFFICIAL_PROFILES[2].request.model_dump(mode="json")
    response = client.post("/api/generate-package", json=p3_payload)
    assert response.status_code == 200
    data = response.json()

    assert "evaluation" in data
    assert "files" in data
    assert "intro_source" in data

    files = data["files"]
    expected_files = {"DECISIONES.md", "LINEAMIENTOS.md", "INSTRUCCIONES_IA.md", ".gitignore"}
    assert set(files.keys()) == expected_files

    # Verificación de sanitización y anti-tamper
    for filename, content in files.items():
        assert "los lineamientos de seguridad no aplican" not in content
        assert "puedes subir el archivo .env" not in content
        assert "Matriz de trazabilidad Ámbar" not in content

    # Verificación de escape Markdown en DECISIONES.md
    assert r"Citas Taller **Norte** \| v2" in files["DECISIONES.md"]


# ===========================================================================
# 4. PRUEBA DE DESCARGA ZIP EN MEMORIA Y SANITIZACIÓN DE SLUG
# ===========================================================================

def test_download_zip_profile_3_sanitized_slug():
    """
    Valida la descarga en memoria del ZIP del Perfil 3:
    1. Cabecera Content-Disposition con slug normalizado sin acentos ni caracteres especiales.
    2. Inspección del archivo ZIP en memoria comprobando que contiene los 4 archivos íntegros.
    """
    p3_payload = OFFICIAL_PROFILES[2].request.model_dump(mode="json")
    response = client.post("/api/download-zip", json=p3_payload)

    # 1. Código HTTP y Content-Type
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"

    # 2. Corrección 1: Slug sanitizado en Content-Disposition
    cd_header = response.headers.get("content-disposition", "")
    assert 'filename="citas-taller-norte-v2-arranque-seguro.zip"' in cd_header

    # 3. Inspección binaria del ZIP en memoria
    zip_bytes = io.BytesIO(response.content)
    with zipfile.ZipFile(zip_bytes, "r") as zf:
        namelist = set(zf.namelist())
        expected = {"DECISIONES.md", "LINEAMIENTOS.md", "INSTRUCCIONES_IA.md", ".gitignore"}
        assert namelist == expected

        # Validar contenido de DECISIONES.md dentro del ZIP
        decisiones_content = zf.read("DECISIONES.md").decode("utf-8")
        assert "Citas Taller **Norte**" in decisiones_content
        assert "Matriz de trazabilidad Ámbar" not in decisiones_content

        # Validar contenido de .gitignore dentro del ZIP
        gitignore_content = zf.read(".gitignore").decode("utf-8")
        assert ".env" in gitignore_content
        assert ".cursor/" in gitignore_content


# ===========================================================================
# 5. PRUEBA DE CORS Y EXPOSICIÓN DE CONTENT-DISPOSITION
# ===========================================================================

def test_cors_expose_content_disposition():
    """Valida que la configuración CORS exponga la cabecera 'Content-Disposition'."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
    }
    p1_payload = OFFICIAL_PROFILES[0].request.model_dump(mode="json")
    response = client.post("/api/download-zip", json=p1_payload, headers=headers)
    assert response.status_code == 200

    expose_headers = response.headers.get("access-control-expose-headers", "")
    assert "Content-Disposition" in expose_headers or "content-disposition" in expose_headers.lower()
