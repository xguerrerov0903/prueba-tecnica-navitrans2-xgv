"""
Domain models and API response schemas for the "Arranque Seguro" governance platform.

All models use Pydantic v2. Input types use enums for every selectable field
so the API never accepts out-of-range strings. Output types carry enough
information to reconstruct the full audit trail of a rule evaluation.
"""

from __future__ import annotations

from enum import Enum
from typing import Annotated, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Input enums
# ---------------------------------------------------------------------------

class Stage(str, Enum):
    prototype = "prototype"
    pilot = "pilot"
    production = "production"


class Audience(str, Enum):
    own_area = "own_area"
    multiple_areas = "multiple_areas"
    external_clients = "external_clients"


class DataType(str, Enum):
    fictional = "fictional"
    internal = "internal"
    personal = "personal"
    financial = "financial"


class Exposure(str, Enum):
    local = "local"
    internal_network = "internal_network"
    internet = "internet"


class LoginMethod(str, Enum):
    none = "none"
    own_accounts = "own_accounts"
    microsoft_entra = "microsoft_entra"


class Integration(str, Enum):
    erp = "erp"
    email = "email"
    file_storage = "file_storage"
    ai_service = "ai_service"
    none = "none"


class BackendTech(str, Enum):
    # Top 5 primary choices (prominent buttons in frontend)
    python     = "python"
    typescript = "typescript"
    java       = "java"
    csharp     = "csharp"
    go         = "go"
    # 5 secondary choices (dropdown selection)
    php        = "php"
    ruby       = "ruby"
    rust       = "rust"
    kotlin     = "kotlin"
    other      = "other"   # Preserves backward compatibility with existing tests


class Criticality(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Area(str, Enum):
    taller = "taller"
    repuestos = "repuestos"
    comercial = "comercial"
    flota = "flota"
    financiera = "financiera"
    talento_humano = "talento_humano"


# ---------------------------------------------------------------------------
# Output enums
# ---------------------------------------------------------------------------

class EffectiveLevel(str, Enum):
    basic = "basic"
    standard = "standard"
    strict = "strict"


# ---------------------------------------------------------------------------
# Input model
# ---------------------------------------------------------------------------

class ProjectRequest(BaseModel):
    """All the answers a developer fills in the guided form."""

    name: Annotated[str, Field(min_length=1, max_length=120)]
    description: Annotated[str, Field(min_length=1, max_length=1000)]
    owner: Annotated[str, Field(min_length=1, max_length=200)]
    area: Area
    stage: Stage
    audience: Audience
    data_types: Annotated[list[DataType], Field(min_length=1)]
    exposure: Exposure
    login: LoginMethod
    integrations: Annotated[list[Integration], Field(min_length=1)]
    backend: BackendTech
    criticality: Criticality

    @field_validator("name", "description", "owner", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


# ---------------------------------------------------------------------------
# Output sub-models
# ---------------------------------------------------------------------------

class RuleTrace(BaseModel):
    """Records whether a business rule fired and the reason why."""

    code: str          # "R1" … "R9"
    name: str          # Short human-readable label
    triggered: bool
    reason: str        # One sentence explaining activation or skip


class SecurityAlert(BaseModel):
    """A single security finding in a free-text field."""

    field: str         # Which field triggered the alert
    alert_type: str    # "secret" | "injection" | "pii"
    detail: str        # Human-readable description of the finding
    snippet: str       # Obfuscated excerpt (first 6 chars + "***")


class Contradiction(BaseModel):
    """Two or more field values that conflict with each other."""

    fields: list[str]  # Names of the conflicting fields
    description: str   # What the conflict is
    resolution: str    # How the engine resolved it automatically


# ---------------------------------------------------------------------------
# Output model
# ---------------------------------------------------------------------------

class EvaluationResult(BaseModel):
    """Full result of evaluating a ProjectRequest against all business rules."""

    effective_level: EffectiveLevel
    mandatory_controls: list[str]
    contradictions: list[Contradiction]
    rule_traces: list[RuleTrace]
    security_alerts: list[SecurityAlert]
    has_security_issues: bool              # True if any alert was raised
    active_integrations: list[Integration] # Only integrations actually chosen (R9)
    sanitized_description: str             # description with injection sentences removed
    sanitized_owner: str                   # owner reduced to name + corporate email


# ---------------------------------------------------------------------------
# API Response Schemas
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    """Operational health check payload."""

    status: str
    app: str
    version: str


class ProfileItem(BaseModel):
    """Official preloaded evaluation profile item for quick selection."""

    id: str
    title: str
    description: str
    request: ProjectRequest


class PackageResponse(BaseModel):
    """Full generation payload including evaluation, Markdown files, and AI intro metadata."""

    evaluation: EvaluationResult
    files: dict[str, str]
    intro_source: str
    intro_fallback_reason: Optional[str] = None
