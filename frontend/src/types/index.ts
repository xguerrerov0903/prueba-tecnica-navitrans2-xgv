/**
 * Tipos de datos sincronizados 1:1 con los modelos de dominio del backend (Pydantic).
 * Archivo fuente: backend/app/domain/models.py
 */

export type Stage = "prototype" | "pilot" | "production";

export type Audience = "own_area" | "multiple_areas" | "external_clients";

export type DataType = "fictional" | "internal" | "personal" | "financial";

export type Exposure = "local" | "internal_network" | "internet";

export type LoginMethod = "none" | "own_accounts" | "microsoft_entra";

export type Integration = "erp" | "email" | "file_storage" | "ai_service" | "none";

export type BackendTech =
  | "python"
  | "typescript"
  | "java"
  | "csharp"
  | "go"
  | "php"
  | "ruby"
  | "rust"
  | "kotlin"
  | "other";

export type Criticality = "low" | "medium" | "high";

export type Area =
  | "taller"
  | "repuestos"
  | "comercial"
  | "flota"
  | "financiera"
  | "talento_humano";

export type EffectiveLevel = "basic" | "standard" | "strict";

export interface ProjectRequest {
  name: string;
  description: string;
  owner: string;
  area: Area;
  stage: Stage;
  audience: Audience;
  data_types: DataType[];
  exposure: Exposure;
  login: LoginMethod;
  integrations: Integration[];
  backend: BackendTech;
  criticality: Criticality;
}

export interface RuleTrace {
  code: string;
  name: string;
  triggered: boolean;
  reason: string;
}

export interface SecurityAlert {
  field: string;
  alert_type: string;
  detail: string;
  snippet: string;
}

export interface Contradiction {
  fields: string[];
  description: string;
  resolution: string;
}

export interface EvaluationResult {
  effective_level: EffectiveLevel;
  mandatory_controls: string[];
  contradictions: Contradiction[];
  rule_traces: RuleTrace[];
  security_alerts: SecurityAlert[];
  has_security_issues: boolean;
  active_integrations: Integration[];
  sanitized_description: string;
  sanitized_owner: string;
}

export interface PackageResponse {
  evaluation: EvaluationResult;
  files: Record<string, string>;
  intro_source: string;
  intro_fallback_reason?: string | null;
}

export interface ProfileItem {
  id: string;
  title: string;
  description: string;
  request: ProjectRequest;
}

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
}
