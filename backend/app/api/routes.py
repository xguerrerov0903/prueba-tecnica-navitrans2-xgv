"""
HTTP REST API endpoints and routing adapters for the "Arranque Seguro" platform.

Endpoints:
- GET /api/health: Service health check and version.
- GET /api/profiles: Official test profiles list for quick-fill.
- POST /api/evaluate: Pure project evaluation against R1-R9 rules.
- POST /api/generate-package: Evaluation and 4-file package generation with AI/fallback intro.
- POST /api/download-zip: Strictly in-memory ZIP package build and download.
"""

from __future__ import annotations

import io
import re
import unicodedata
import zipfile

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from ..domain.models import (
    EvaluationResult,
    HealthResponse,
    PackageResponse,
    ProfileItem,
    ProjectRequest,
)
from ..domain.presets import OFFICIAL_PROFILES
from ..domain.rules_engine import evaluate_project
from ..services.ai_intro_client import generate_project_intro
from ..services.package_generator import generate_package

__all__ = [
    "router",
    "OFFICIAL_PROFILES",
    "HealthResponse",
    "ProfileItem",
    "PackageResponse",
]

router = APIRouter()


# ---------------------------------------------------------------------------
# Transport Helper Functions
# ---------------------------------------------------------------------------

def _sanitize_filename_slug(name: str) -> str:
    """
    Normalizes and sanitizes a project name for safe usage in HTTP
    Content-Disposition headers and filesystem file names.

    Transformations:
    - NFKD decomposition to strip accents (e.g., á -> a, é -> e).
    - Lowercase conversion.
    - Replacement of non-alphanumeric [^a-z0-9] sequences with hyphens.
    - Trimming leading/trailing hyphens.
    """
    normalized = unicodedata.normalize("NFKD", name)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return slug or "proyecto"


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@router.get("/health", response_model=HealthResponse, tags=["sistema"])
def get_health() -> HealthResponse:
    """Verifies operational health and availability of the API."""
    return HealthResponse(
        status="ok",
        app="Arranque Seguro",
        version="1.0.0",
    )


@router.get("/profiles", response_model=list[ProfileItem], tags=["perfiles"])
def get_profiles() -> list[ProfileItem]:
    """Returns the 3 official profiles for 1-click form preloading."""
    return OFFICIAL_PROFILES


@router.post("/evaluate", response_model=EvaluationResult, tags=["evaluaciones"])
def evaluate_endpoint(request: ProjectRequest) -> EvaluationResult:
    """
    Evaluates a project request applying business rules R1 through R9,
    input security scans, contradiction resolution, and effective security level calculation.
    """
    return evaluate_project(request)


@router.post("/generate-package", response_model=PackageResponse, tags=["paquetes"])
async def generate_package_endpoint(request: ProjectRequest) -> PackageResponse:
    """
    Evaluates project, asynchronously retrieves AI intro (with resilient fallback),
    and generates the 4-file package (Markdown and .gitignore).
    """
    evaluation = evaluate_project(request)
    ai_intro = await generate_project_intro(request, evaluation)
    package = generate_package(request, evaluation, ai_intro)

    return PackageResponse(
        evaluation=evaluation,
        files=package.files,
        intro_source=ai_intro.source,
        intro_fallback_reason=ai_intro.fallback_reason,
    )


@router.post("/download-zip", tags=["paquetes"])
async def download_zip_endpoint(request: ProjectRequest) -> StreamingResponse:
    """
    Generates the complete document package strictly in-memory (io.BytesIO)
    and returns it as a ZIP archive with a sanitized Content-Disposition filename.
    """
    evaluation = evaluate_project(request)
    ai_intro = await generate_project_intro(request, evaluation)
    package = generate_package(request, evaluation, ai_intro)

    # In-memory ZIP packaging
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        for filename, content in package.files.items():
            zip_file.writestr(filename, content.encode("utf-8"))

    zip_buffer.seek(0)
    slug = _sanitize_filename_slug(request.name)
    download_filename = f"{slug}-arranque-seguro.zip"

    headers = {
        "Content-Disposition": f'attachment; filename="{download_filename}"',
    }

    return StreamingResponse(
        io.BytesIO(zip_buffer.getvalue()),
        media_type="application/zip",
        headers=headers,
    )
