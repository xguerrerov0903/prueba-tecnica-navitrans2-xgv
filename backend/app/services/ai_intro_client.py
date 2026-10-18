"""
Cliente resiliente para el servicio opcional de redacción de IA de Navitrans.

Políticas de Seguridad y Privacidad:
1. El token se lee estrictamente desde variables de entorno (NAVITRANS_AI_TOKEN).
2. Timeout estricto de máximo 3.0 segundos para evitar degradación del servicio.
3. Fallback preventivo (R5 + Ley 1581): Si el proyecto declara datos personales
   o financieros, no se transmiten al servicio externo para prevenir fugas accidentales;
   en su lugar se genera una introducción determinística local.
4. Fallback silencioso y transparente ante caídas del servicio, errores de red o HTTP.
"""

from __future__ import annotations

import logging
import os
from typing import Literal, Optional
from pydantic import BaseModel
import httpx

from ..domain.models import DataType, EvaluationResult, ProjectRequest

logger = logging.getLogger(__name__)

DEFAULT_AI_URL = "https://redaccion-ia.navitrans.example/v1/introducciones"
DEFAULT_TIMEOUT = 3.0


class AIIntroResult(BaseModel):
    """Resultado de la generación de la introducción de los lineamientos."""

    introduction: str
    source: Literal["ai_service", "local_fallback"]
    fallback_reason: Optional[str] = None


def _build_local_fallback(request: ProjectRequest, evaluation: EvaluationResult, reason: str) -> AIIntroResult:
    """Genera una introducción local coherente y determinística basada en el proyecto."""
    area_name = request.area.value.replace("_", " ").capitalize()
    stage_name = request.stage.value.capitalize()
    level_name = evaluation.effective_level.value.upper()

    intro_text = (
        f"Este documento establece los lineamientos de arquitectura y seguridad para el proyecto "
        f"**{request.name}**, formulado por el área de **{area_name}**. "
        f"Actualmente en etapa de **{stage_name}**, el proyecto tiene como propósito: {evaluation.sanitized_description} "
        f"Bajo las reglas de arranque seguro de Navitrans, este proyecto opera bajo un nivel de exigencia "
        f"**{level_name}**, requiriendo la observancia estricta de los controles definidos a continuación."
    )

    return AIIntroResult(
        introduction=intro_text,
        source="local_fallback",
        fallback_reason=reason,
    )


def _should_skip_ai_for_privacy(request: ProjectRequest) -> Optional[str]:
    """
    Verifica si por política de privacidad (R5 y Ley 1581) se debe evitar
    el envío de la información al servicio externo.
    """
    sensitive_data = {DataType.personal, DataType.financial}
    has_sensitive = bool(sensitive_data & set(request.data_types))
    if has_sensitive:
        return "Proyecto con datos sensibles (personales/financieros): se evita transmisión externa para protección de datos (R5 - Ley 1581)."
    return None


async def generate_project_intro(
    request: ProjectRequest,
    evaluation: EvaluationResult,
) -> AIIntroResult:
    """
    Genera de forma asíncrona la introducción de los lineamientos utilizando
    el servicio externo de IA si está disponible, o recurre a la plantilla local.
    """
    # 1. Validación de privacidad preventiva (R5 / Ley 1581)
    privacy_reason = _should_skip_ai_for_privacy(request)
    if privacy_reason:
        return _build_local_fallback(request, evaluation, privacy_reason)

    # 2. Obtener credenciales desde variables de entorno
    token = os.getenv("NAVITRANS_AI_TOKEN")
    if not token or token.strip() == "" or "reemplazar" in token.lower():
        return _build_local_fallback(
            request,
            evaluation,
            "Token de IA no configurado en NAVITRANS_AI_TOKEN; utilizando plantilla local segura.",
        )

    ai_url = os.getenv("NAVITRANS_AI_URL", DEFAULT_AI_URL).strip()
    try:
        timeout_val = float(os.getenv("NAVITRANS_AI_TIMEOUT_SECONDS", str(DEFAULT_TIMEOUT)))
    except ValueError:
        timeout_val = DEFAULT_TIMEOUT

    # Timeout máximo de 3.0s por especificación
    timeout_val = min(timeout_val, 3.0)

    # 3. Payload sanitizado (sin PII ni inyecciones)
    payload = {
        "nombre": request.name,
        "descripcion": evaluation.sanitized_description,
        "etapa": request.stage.value,
        "datos": [dt.value for dt in request.data_types],
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    # 4. Solicitud HTTP resiliente con httpx
    try:
        async with httpx.AsyncClient(timeout=timeout_val) as client:
            response = await client.post(ai_url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                intro = data.get("introduccion")
                if intro and isinstance(intro, str) and intro.strip():
                    return AIIntroResult(
                        introduction=intro.strip(),
                        source="ai_service",
                        fallback_reason=None,
                    )
                fallback_reason = "Respuesta del servicio de IA no contenía el campo 'introduccion'."
            else:
                fallback_reason = f"Servicio de IA respondió con código HTTP {response.status_code}."
    except httpx.TimeoutException:
        fallback_reason = f"Tiempo de espera agotado al conectar con el servicio de IA (>{timeout_val}s)."
    except httpx.RequestError as exc:
        fallback_reason = f"Error de conexión con el servicio de IA: {exc.__class__.__name__}."
    except Exception as exc:
        fallback_reason = f"Error inesperado al invocar servicio de IA: {type(exc).__name__}."

    logger.info("Activando fallback local para introducción: %s", fallback_reason)
    return _build_local_fallback(request, evaluation, fallback_reason)


def generate_project_intro_sync(
    request: ProjectRequest,
    evaluation: EvaluationResult,
) -> AIIntroResult:
    """Variante sincrónica para contextos donde no se usa event loop async."""
    privacy_reason = _should_skip_ai_for_privacy(request)
    if privacy_reason:
        return _build_local_fallback(request, evaluation, privacy_reason)

    token = os.getenv("NAVITRANS_AI_TOKEN")
    if not token or token.strip() == "" or "reemplazar" in token.lower():
        return _build_local_fallback(
            request,
            evaluation,
            "Token de IA no configurado en NAVITRANS_AI_TOKEN; utilizando plantilla local segura.",
        )

    ai_url = os.getenv("NAVITRANS_AI_URL", DEFAULT_AI_URL).strip()
    try:
        timeout_val = float(os.getenv("NAVITRANS_AI_TIMEOUT_SECONDS", str(DEFAULT_TIMEOUT)))
    except ValueError:
        timeout_val = DEFAULT_TIMEOUT
    timeout_val = min(timeout_val, 3.0)

    payload = {
        "nombre": request.name,
        "descripcion": evaluation.sanitized_description,
        "etapa": request.stage.value,
        "datos": [dt.value for dt in request.data_types],
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=timeout_val) as client:
            response = client.post(ai_url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                intro = data.get("introduccion")
                if intro and isinstance(intro, str) and intro.strip():
                    return AIIntroResult(
                        introduction=intro.strip(),
                        source="ai_service",
                        fallback_reason=None,
                    )
                fallback_reason = "Respuesta del servicio de IA no contenía el campo 'introduccion'."
            else:
                fallback_reason = f"Servicio de IA respondió con código HTTP {response.status_code}."
    except httpx.TimeoutException:
        fallback_reason = f"Tiempo de espera agotado al conectar con el servicio de IA (>{timeout_val}s)."
    except httpx.RequestError as exc:
        fallback_reason = f"Error de conexión con el servicio de IA: {exc.__class__.__name__}."
    except Exception as exc:
        fallback_reason = f"Error inesperado al invocar servicio de IA: {type(exc).__name__}."

    return _build_local_fallback(request, evaluation, fallback_reason)
