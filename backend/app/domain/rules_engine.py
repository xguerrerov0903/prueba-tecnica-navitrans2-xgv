"""
Rules engine for the Navitrans prototype evaluation tool.

Public API
----------
    evaluate_project(request: ProjectRequest) -> EvaluationResult

All helpers are pure functions (no I/O, no side effects).
Evaluation order: security inputs → contradictions → rules R1–R9 → effective level.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from .models import (
    Audience,
    Contradiction,
    Criticality,
    DataType,
    EffectiveLevel,
    Exposure,
    Integration,
    LoginMethod,
    ProjectRequest,
    EvaluationResult,
    RuleTrace,
    SecurityAlert,
    Stage,
)

# ---------------------------------------------------------------------------
# Internal helpers – de-duplication
# ---------------------------------------------------------------------------

@dataclass
class _MatchedSpan:
    """Tracks which character ranges have already triggered an alert."""
    ranges: list[tuple[int, int]] = field(default_factory=list)

    def overlaps(self, start: int, end: int) -> bool:
        return any(s <= start < e or s < end <= e for s, e in self.ranges)

    def add(self, start: int, end: int) -> None:
        self.ranges.append((start, end))


def _obfuscate(text: str) -> str:
    """Return first 6 chars + *** so the snippet is not itself a secret."""
    return text[:6] + "***"


# ---------------------------------------------------------------------------
# 6a. Secret detection
# ---------------------------------------------------------------------------

# Ordered by specificity: specific patterns first, entropy heuristic last.
# Each entry: (pattern, label).  The entropy pattern uses lookaheads to
# require at least one letter AND one digit, avoiding false positives with
# long Spanish words or pure digit strings.
_SECRET_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"nvt_test_[A-Za-z0-9]+"), "Navitrans test token"),
    (re.compile(r"ghp_[A-Za-z0-9]{20,}"), "GitHub PAT"),
    (re.compile(r"sk-[A-Za-z0-9]{20,}"), "OpenAI-style API key"),
    (re.compile(r"Bearer\s+\S{8,}"), "Bearer token in header"),
    (re.compile(r"PASSWORD\s*=\s*\S+", re.IGNORECASE), "Hardcoded password"),
    (re.compile(r"API_KEY\s*=\s*\S+", re.IGNORECASE), "Hardcoded API key"),
    (re.compile(r"TOKEN\s*=\s*\S+", re.IGNORECASE), "Hardcoded token"),
    # High-entropy heuristic: ≥20 chars, mixed letters AND digits (no spaces).
    # Lookaheads ensure at least one letter and at least one digit are present.
    (re.compile(r"(?=[^\s]*[A-Za-z])(?=[^\s]*\d)[A-Za-z0-9_\-]{20,}"), "High-entropy string"),
]


def _find_secrets(field_name: str, text: str) -> list[SecurityAlert]:
    alerts: list[SecurityAlert] = []
    seen = _MatchedSpan()

    for pattern, label in _SECRET_PATTERNS:
        for m in pattern.finditer(text):
            if seen.overlaps(m.start(), m.end()):
                # Already covered by a more specific pattern – skip to avoid dupe.
                continue
            seen.add(m.start(), m.end())
            alerts.append(SecurityAlert(
                field=field_name,
                alert_type="secret",
                detail=f"{label} detectado",
                snippet=_obfuscate(m.group()),
            ))

    return alerts


# ---------------------------------------------------------------------------
# 6b. Injection detection + sanitization of description
# ---------------------------------------------------------------------------

# Patterns that indicate an attempt to override security rules.
# Each is a compiled pattern; we search within individual sentences.
_INJECTION_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"nota para el asistente", re.IGNORECASE),
    re.compile(r"no\s+aplican.*lineamientos", re.IGNORECASE | re.DOTALL),
    re.compile(r"no\s+es\s+necesario.*\.gitignore", re.IGNORECASE | re.DOTALL),
    re.compile(r"subir.*\.env", re.IGNORECASE | re.DOTALL),
    re.compile(r"upload.*\.env", re.IGNORECASE | re.DOTALL),
    re.compile(r"ignorar.*seguridad", re.IGNORECASE | re.DOTALL),
    re.compile(r"ignore.*security", re.IGNORECASE | re.DOTALL),
    re.compile(r"desactivar.*reglas", re.IGNORECASE | re.DOTALL),
    re.compile(r"bypass", re.IGNORECASE),
    re.compile(r"ignore.*rules", re.IGNORECASE | re.DOTALL),
]


def _sanitize_description(description: str) -> tuple[str, list[SecurityAlert]]:
    """
    Split description into sentences, remove any that contain an injection
    pattern, and return the clean text alongside the alerts raised.
    """
    # Split on '. ' or newline boundaries, keeping the delimiter attached.
    sentences = re.split(r"(?<=\.)\s+|\n", description)
    clean_sentences: list[str] = []
    alerts: list[SecurityAlert] = []

    for sentence in sentences:
        injected = False
        for pattern in _INJECTION_PATTERNS:
            if pattern.search(sentence):
                snippet = sentence[:40] + ("..." if len(sentence) > 40 else "")
                alerts.append(SecurityAlert(
                    field="description",
                    alert_type="injection",
                    detail="Instrucción de evasión de seguridad detectada y eliminada",
                    snippet=snippet,
                ))
                injected = True
                break  # One alert per sentence is enough
        if not injected:
            clean_sentences.append(sentence)

    sanitized = " ".join(s.strip() for s in clean_sentences if s.strip())
    return sanitized, alerts


# ---------------------------------------------------------------------------
# 6c. PII detection + sanitization of owner
# ---------------------------------------------------------------------------

_CC_PATTERN = re.compile(r"C\.?C\.?\s*[\d\.]{5,}", re.IGNORECASE)
_CELULAR_PATTERN = re.compile(r"3\d{2}[\s\-]?\d{3}[\s\-]?\d{4}")
_EMAIL_PATTERN = re.compile(r"\S+@\S+")


def _sanitize_owner(owner: str) -> tuple[str, list[SecurityAlert]]:
    """
    If CC or phone number are present in the owner field, raise a PII alert
    and return a sanitized version containing only name + corporate email.
    """
    alerts: list[SecurityAlert] = []
    has_pii = bool(_CC_PATTERN.search(owner) or _CELULAR_PATTERN.search(owner))

    if not has_pii:
        return owner, alerts

    alerts.append(SecurityAlert(
        field="owner",
        alert_type="pii",
        detail="Cédula y/o celular personal detectados en el campo responsable; se minimizan a nombre y correo (R2 – Ley 1581)",
        snippet=_obfuscate(owner),
    ))

    # Extract email if present
    email_match = _EMAIL_PATTERN.search(owner)
    email_part = email_match.group() if email_match else ""

    # Name heuristic: text before the first ' — ' or ' - ' separator
    name_part = re.split(r"\s*[—\-]\s*", owner)[0].strip()

    if email_part:
        sanitized = f"{name_part} — {email_part}"
    else:
        sanitized = name_part

    return sanitized, alerts


# ---------------------------------------------------------------------------
# Security input checker (combines 6a, 6b, 6c)
# ---------------------------------------------------------------------------

def _check_security_inputs(
    req: ProjectRequest,
) -> tuple[list[SecurityAlert], str, str]:
    """
    Analyse all free-text fields for secrets, injections, and PII.

    Returns:
        alerts              – all findings
        sanitized_desc      – description with injection sentences removed
        sanitized_owner     – owner with CC/phone stripped out
    """
    alerts: list[SecurityAlert] = []

    # Secrets in name and owner (injection patterns don't apply there)
    alerts.extend(_find_secrets("name", req.name))

    # Description: secrets first, then injection sanitization
    alerts.extend(_find_secrets("description", req.description))
    sanitized_desc, inj_alerts = _sanitize_description(req.description)
    alerts.extend(inj_alerts)

    # Owner: secrets + PII
    alerts.extend(_find_secrets("owner", req.owner))
    sanitized_owner, pii_alerts = _sanitize_owner(req.owner)
    alerts.extend(pii_alerts)

    return alerts, sanitized_desc, sanitized_owner


# ---------------------------------------------------------------------------
# Contradiction detection
# ---------------------------------------------------------------------------

_SENSITIVE_DATA = {DataType.personal, DataType.financial}


def _detect_contradictions(req: ProjectRequest) -> list[Contradiction]:
    contradictions: list[Contradiction] = []
    sensitive = bool(_SENSITIVE_DATA & set(req.data_types))

    # C1 – Prototype exposed to internet
    if req.stage == Stage.prototype and req.exposure == Exposure.internet:
        contradictions.append(Contradiction(
            fields=["stage", "exposure"],
            description="Un prototipo no debería estar expuesto a Internet sin controles de producción.",
            resolution="Se eleva el nivel de exigencia a 'strict' y se activan todos los controles de R3.",
        ))

    # C2 – Sensitive data without login (Universal: Ley 1581 / Seguridad)
    if sensitive and req.login == LoginMethod.none:
        contradictions.append(Contradiction(
            fields=["data_types", "login"],
            description=(
                "El proyecto maneja datos personales o financieros sin inicio de sesión. "
                "Por mandato de la Ley 1581 de 2012 y directivas de seguridad corporativa, ningún entorno "
                "que procese datos sensibles puede operar sin autenticación y control de acceso, "
                "incluso si se encuentra en red local o en etapa de prototipo."
            ),
            resolution=(
                "Se fuerza inicio de sesión (login_required) y control de acceso como controles obligatorios. "
                "El nivel mínimo de seguridad se eleva a 'standard'."
            ),
        ))

    # C3 – High criticality without login
    if req.criticality == Criticality.high and req.login == LoginMethod.none:
        contradictions.append(Contradiction(
            fields=["criticality", "login"],
            description="Un proyecto de criticidad alta no puede operar sin inicio de sesión (R7).",
            resolution="Se fuerza inicio de sesión como control obligatorio.",
        ))

    # C4 – Internet exposure, no login, non-fictional data
    if (
        req.exposure == Exposure.internet
        and req.login == LoginMethod.none
        and any(d != DataType.fictional for d in req.data_types)
    ):
        contradictions.append(Contradiction(
            fields=["exposure", "login"],
            description="Proyecto expuesto a Internet sin inicio de sesión manejando datos no ficticios (R3).",
            resolution="Se agrega inicio de sesión como control obligatorio.",
        ))

    # C5 – Prototype with real data
    if req.stage == Stage.prototype and sensitive:
        contradictions.append(Contradiction(
            fields=["stage", "data_types"],
            description="Un prototipo debería usar datos ficticios, no personales o financieros.",
            resolution="Se emite advertencia; el desarrollador debe reemplazar datos reales por ficticios.",
        ))

    # C6 – Internet + datos sensibles + criticidad < high (Gobernanza crítica: ISO 27001 / Ley 1581)
    if (
        req.exposure == Exposure.internet
        and sensitive
        and req.criticality != Criticality.high
    ):
        contradictions.append(Contradiction(
            fields=["exposure", "data_types", "criticality"],
            description=(
                "El sistema procesa datos personales o financieros y está expuesto a Internet, "
                f"pero la criticidad declarada es '{req.criticality.value}'. "
                "Según ISO 27001 y la Ley 1581 de 2012, esta combinación exige clasificación "
                "obligatoria como Criticidad Alta."
            ),
            resolution=(
                "Se eleva automáticamente la criticidad efectiva a 'high' y el nivel de seguridad "
                "a 'strict'. Se activan todos los controles de R3 y R7 (RTO/RPO, respaldo, login)."
            ),
        ))

    # C7 – Internet + cualquier dato sin sensible + criticality == low (Superficie de ataque pública)
    if (
        req.exposure == Exposure.internet
        and not sensitive
        and req.criticality == Criticality.low
    ):
        contradictions.append(Contradiction(
            fields=["exposure", "criticality"],
            description=(
                "El sistema está expuesto a Internet con criticidad declarada 'Baja'. "
                "Ningún sistema con superficie de ataque pública puede tener criticidad baja "
                "independientemente del tipo de dato (Gobernanza TI Navitrans)."
            ),
            resolution=(
                "Se eleva el nivel efectivo mínimo a 'standard'. "
                "Reclasifica la criticidad como 'Media' o 'Alta' según el impacto operativo real."
            ),
        ))

    return contradictions


# ---------------------------------------------------------------------------
# Effective level calculation
# ---------------------------------------------------------------------------

def _effective_level(req: ProjectRequest, contradictions: list[Contradiction]) -> EffectiveLevel:
    """
    Compute the security level. Rule: strict > standard > basic.
    The level only ever goes up, never down.
    """
    level = EffectiveLevel.basic  # starting point

    sensitive = bool(_SENSITIVE_DATA & set(req.data_types))

    # Sensitive data (personal or financial) mandates at least standard level
    if sensitive:
        level = EffectiveLevel.standard

    # Anything not explicitly local or internal → at least standard
    if req.exposure not in (Exposure.local, Exposure.internal_network):
        level = EffectiveLevel.standard

    # R3: internet → strict
    if req.exposure == Exposure.internet:
        level = EffectiveLevel.strict

    # R7: high criticality → strict
    if req.criticality == Criticality.high:
        level = EffectiveLevel.strict

    # C1 contradiction also pushes to strict
    if any("stage" in c.fields and "exposure" in c.fields for c in contradictions):
        level = EffectiveLevel.strict

    # C6: internet + datos sensibles + criticidad < high → siempre strict
    if any(
        "criticality" in c.fields and "exposure" in c.fields and "data_types" in c.fields
        for c in contradictions
    ):
        level = EffectiveLevel.strict

    # C7: internet + criticality low (sin datos sensibles) → mínimo standard
    if any(
        "exposure" in c.fields
        and "criticality" in c.fields
        and "data_types" not in c.fields
        for c in contradictions
    ):
        if level == EffectiveLevel.basic:
            level = EffectiveLevel.standard

    return level


# ---------------------------------------------------------------------------
# Individual rule applicators (R1 – R9)
# ---------------------------------------------------------------------------

def _apply_r1(req: ProjectRequest) -> tuple[RuleTrace, list[str]]:
    controls = ["decisions_doc", "security_guidelines", "ai_instructions"]
    return (
        RuleTrace(code="R1", name="Paquete base", triggered=True,
                  reason="Siempre activo: todo proyecto recibe el paquete base de documentos."),
        controls,
    )


def _apply_r2(req: ProjectRequest) -> tuple[RuleTrace, list[str]]:
    sensitive = bool(_SENSITIVE_DATA & set(req.data_types))
    if sensitive:
        return (
            RuleTrace(code="R2", name="Tratamiento de datos personales", triggered=True,
                      reason="El proyecto declara datos personales o financieros (Ley 1581 de 2012)."),
            ["data_treatment_section"],
        )
    return (
        RuleTrace(code="R2", name="Tratamiento de datos personales", triggered=False,
                  reason="No se declararon datos personales ni financieros."),
        [],
    )


def _apply_r3(req: ProjectRequest) -> tuple[RuleTrace, list[str]]:
    if req.exposure == Exposure.internet:
        controls = [
            "server_side_permissions",
            "https",
            "input_validation",
            "safe_error_messages",
            "no_secrets_in_code",
        ]
        # Login is mandatory unless all data is fictional (edge case)
        if any(d != DataType.fictional for d in req.data_types):
            controls.append("login_required")
        return (
            RuleTrace(code="R3", name="Controles mínimos para Internet", triggered=True,
                      reason="El proyecto se expone a Internet (Seguridad de la información)."),
            controls,
        )
    return (
        RuleTrace(code="R3", name="Controles mínimos para Internet", triggered=False,
                  reason="El proyecto no se expone a Internet."),
        [],
    )


def _apply_r4(req: ProjectRequest) -> tuple[RuleTrace, list[str]]:
    sensitive = bool(_SENSITIVE_DATA & set(req.data_types))
    if req.exposure != Exposure.internal_network:
        return (
            RuleTrace(code="R4", name="Red interna – riesgo bajo", triggered=False,
                      reason="El proyecto no está restringido a la red interna."),
            [],
        )
    if sensitive:
        # R2 overrides R4: must add access control
        return (
            RuleTrace(code="R4", name="Red interna – riesgo bajo", triggered=True,
                      reason=(
                          "Aplica R4 (red interna), pero R2 eleva el nivel a 'standard' "
                          "por datos personales/financieros. Se requiere control de acceso."
                      )),
            ["access_control"],
        )
    return (
        RuleTrace(code="R4", name="Red interna – riesgo bajo", triggered=True,
                  reason="Red interna sin datos sensibles: se omiten controles de acceso y checklist (Infraestructura 2024)."),
        [],
    )


def _apply_r5(req: ProjectRequest) -> tuple[RuleTrace, list[str]]:
    if Integration.ai_service in req.integrations:
        return (
            RuleTrace(code="R5", name="Integración con servicio de IA", triggered=True,
                      reason="El proyecto integra un servicio de IA (Seguridad de la información)."),
            ["ai_key_server_only", "anonymize_before_ai"],
        )
    return (
        RuleTrace(code="R5", name="Integración con servicio de IA", triggered=False,
                  reason="No se declaró integración con servicio de IA."),
        [],
    )


def _apply_r6(req: ProjectRequest) -> tuple[RuleTrace, list[str]]:
    return (
        RuleTrace(code="R6", name="Nombre y descripción en todos los documentos", triggered=True,
                  reason="Siempre activo: nombre y descripción se propagan a todos los documentos del paquete."),
        ["propagate_name_description"],
    )


def _apply_r7(req: ProjectRequest) -> tuple[RuleTrace, list[str]]:
    if req.criticality == Criticality.high:
        return (
            RuleTrace(code="R7", name="Criticidad alta", triggered=True,
                      reason="Criticidad alta: exige RTO/RPO, respaldo y login obligatorio (Área de desarrollo)."),
            ["rto_rpo_definition", "backup_before_pilot", "login_required"],
        )
    return (
        RuleTrace(code="R7", name="Criticidad alta", triggered=False,
                  reason=f"Criticidad declarada es '{req.criticality.value}', no 'high'."),
        [],
    )


def _apply_r8(req: ProjectRequest) -> tuple[RuleTrace, list[str]]:
    return (
        RuleTrace(code="R8", name="Reglas .gitignore para asistente de IA", triggered=True,
                  reason="Siempre activo: el paquete incluye .gitignore con exclusiones de secretos y configs personales."),
        ["gitignore_env", "gitignore_ai_configs"],
    )


def _apply_r9(req: ProjectRequest) -> tuple[RuleTrace, list[Integration]]:
    active = [i for i in req.integrations if i != Integration.none]
    if active:
        return (
            RuleTrace(code="R9", name="Solo secciones relevantes", triggered=True,
                      reason=f"Se generarán secciones solo para: {', '.join(i.value for i in active)}."),
            active,
        )
    return (
        RuleTrace(code="R9", name="Solo secciones relevantes", triggered=True,
                  reason="Sin integraciones seleccionadas: no se generan secciones de integración."),
        [],
    )


# ---------------------------------------------------------------------------
# Rule orchestrator
# ---------------------------------------------------------------------------

def _apply_rules(
    req: ProjectRequest,
    contradictions: list[Contradiction],
) -> tuple[list[RuleTrace], list[str], list[Integration]]:
    """
    Run R1–R9 in order, collect traces, mandatory controls, and active integrations.
    Controls are deduplicated while preserving insertion order.
    """
    traces: list[RuleTrace] = []
    controls: list[str] = []

    def _add(rule_trace: RuleTrace, rule_controls: list[str]) -> None:
        traces.append(rule_trace)
        for c in rule_controls:
            if c not in controls:
                controls.append(c)

    trace_r1, c_r1 = _apply_r1(req)
    _add(trace_r1, c_r1)

    trace_r2, c_r2 = _apply_r2(req)
    _add(trace_r2, c_r2)

    trace_r3, c_r3 = _apply_r3(req)
    _add(trace_r3, c_r3)

    trace_r4, c_r4 = _apply_r4(req)
    _add(trace_r4, c_r4)

    trace_r5, c_r5 = _apply_r5(req)
    _add(trace_r5, c_r5)

    trace_r6, c_r6 = _apply_r6(req)
    _add(trace_r6, c_r6)

    trace_r7, c_r7 = _apply_r7(req)
    _add(trace_r7, c_r7)

    trace_r8, c_r8 = _apply_r8(req)
    _add(trace_r8, c_r8)

    trace_r9, active_integrations = _apply_r9(req)
    traces.append(trace_r9)

    # Contradictions C2/C3/C4 may force login even if no rule did so directly
    _SENSITIVE_DATA_SET = {DataType.personal, DataType.financial}
    sensitive = bool(_SENSITIVE_DATA_SET & set(req.data_types))
    needs_login = (
        req.criticality == Criticality.high
        or req.exposure == Exposure.internet
        or (sensitive and req.login == LoginMethod.none)
    )
    if needs_login and "login_required" not in controls:
        controls.append("login_required")

    if sensitive and "access_control" not in controls:
        controls.append("access_control")

    # C6 activa: forzar controles de R7 aunque criticality != high (inmutabilidad de req preservada)
    c6_active = any(
        "criticality" in c.fields and "exposure" in c.fields and "data_types" in c.fields
        for c in contradictions
    )
    if c6_active:
        for ctrl in ["rto_rpo_definition", "backup_before_pilot", "login_required"]:
            if ctrl not in controls:
                controls.append(ctrl)

    return traces, controls, active_integrations


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate_project(request: ProjectRequest) -> EvaluationResult:
    """
    Pure function. Evaluates a project request against all business rules
    and returns a complete, auditable result.

    Evaluation order:
        1. Security input analysis (secrets, injection, PII)
        2. Contradiction detection
        3. Rule application R1–R9
        4. Effective level calculation
    """
    # Step 1 – security
    alerts, sanitized_desc, sanitized_owner = _check_security_inputs(request)

    # Step 2 – contradictions
    contradictions = _detect_contradictions(request)

    # Step 3 – rules
    traces, controls, active_integrations = _apply_rules(request, contradictions)

    # Step 4 – effective level
    level = _effective_level(request, contradictions)

    return EvaluationResult(
        effective_level=level,
        mandatory_controls=controls,
        contradictions=contradictions,
        rule_traces=traces,
        security_alerts=alerts,
        has_security_issues=bool(alerts),
        active_integrations=active_integrations,
        sanitized_description=sanitized_desc,
        sanitized_owner=sanitized_owner,
    )
