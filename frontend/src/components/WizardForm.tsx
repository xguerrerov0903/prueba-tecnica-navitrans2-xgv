import React, { useState } from "react";
import {
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Wand2,
  FileCheck2,
  Info,
  CheckCircle,
} from "lucide-react";
import {
  Area,
  Audience,
  BackendTech,
  Criticality,
  DataType,
  Exposure,
  Integration,
  LoginMethod,
  ProjectRequest,
  Stage,
} from "../types";

interface WizardFormProps {
  initialData: ProjectRequest;
  isOfficialProfile: boolean;
  activeProfileName: string | null;
  onSubmit: (data: ProjectRequest) => void;
  isLoading: boolean;
  onFieldChange: () => void;
}

export const WizardForm: React.FC<WizardFormProps> = ({
  initialData,
  isOfficialProfile,
  activeProfileName,
  onSubmit,
  isLoading,
  onFieldChange,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<ProjectRequest>(initialData);

  // Sincronizar formData cuando initialData cambia (por selección de perfil)
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleTextChange = (field: keyof ProjectRequest, value: string) => {
    onFieldChange();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSingleSelect = <K extends keyof ProjectRequest>(
    field: K,
    value: ProjectRequest[K]
  ) => {
    onFieldChange();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDataType = (type: DataType) => {
    onFieldChange();
    setFormData((prev) => {
      const exists = prev.data_types.includes(type);
      let updated: DataType[];
      if (exists) {
        updated = prev.data_types.filter((t) => t !== type);
        if (updated.length === 0) updated = ["fictional"];
      } else {
        updated = [...prev.data_types, type];
      }

      // Si se activan datos personales o financieros y el login estaba en 'none' (modo manual), auto-cambiar a Entra ID
      const hasSensitive = updated.includes("personal") || updated.includes("financial");
      let nextLogin = prev.login;
      if (!isOfficialProfile && hasSensitive && prev.login === "none") {
        nextLogin = "microsoft_entra";
      }

      return { ...prev, data_types: updated, login: nextLogin };
    });
  };

  const toggleIntegration = (item: Integration) => {
    onFieldChange();
    setFormData((prev) => {
      if (item === "none") {
        return { ...prev, integrations: ["none"] };
      }
      const withoutNone = prev.integrations.filter((i) => i !== "none");
      const exists = withoutNone.includes(item);
      let updated: Integration[];
      if (exists) {
        updated = withoutNone.filter((i) => i !== item);
        if (updated.length === 0) updated = ["none"];
      } else {
        updated = [...withoutNone, item];
      }
      return { ...prev, integrations: updated };
    });
  };

  // =========================================================================
  // Validación de Bloqueo Preventivo en el Cliente (Modo Manual)
  // =========================================================================
  interface BlockerIssue {
    id: string;
    message: string;
    autofixLabel: string;
    applyFix: () => void;
  }

  const getClientBlockers = (): BlockerIssue[] => {
    if (isOfficialProfile) return [];

    const issues: BlockerIssue[] = [];

    // Regla 1: Internet o clientes externos sin login (R3)
    const isExposed = formData.exposure === "internet" || formData.audience === "external_clients";
    if (isExposed && formData.login === "none") {
      issues.push({
        id: "internet-login",
        message: "Proyecto expuesto a Internet o para clientes externos no puede operar sin inicio de sesión (R3).",
        autofixLabel: "Habilitar Microsoft Entra ID",
        applyFix: () => {
          handleSingleSelect("login", "microsoft_entra");
        },
      });
    }

    // Regla 2: Criticidad alta sin login (R7)
    if (formData.criticality === "high" && formData.login === "none") {
      issues.push({
        id: "high-crit-login",
        message: "Un proyecto de criticidad alta exige inicio de sesión obligatorio por directiva de seguridad (R7).",
        autofixLabel: "Habilitar Microsoft Entra ID",
        applyFix: () => {
          handleSingleSelect("login", "microsoft_entra");
        },
      });
    }

    // Regla 3: Datos personales o financieros sin login (Universal: R2 / C2)
    const hasSensitiveData =
      formData.data_types.includes("personal") || formData.data_types.includes("financial");
    if (hasSensitiveData && formData.login === "none") {
      issues.push({
        id: "sensitive-login",
        message: "Procesar datos personales o financieros exige inicio de sesión obligatorio sin importar el entorno o etapa (Ley 1581 / Seguridad TI).",
        autofixLabel: "Habilitar Microsoft Entra ID",
        applyFix: () => {
          handleSingleSelect("login", "microsoft_entra");
        },
      });
    }

    // Regla 4: Infracción Ley 1581 en Responsable (Cédula o Celular)
    const ccPattern = /C\.?C\.?\s*[\d\.]{5,}/i;
    const phonePattern = /3\d{2}[\s\-]?\d{3}[\s\-]?\d{4}/;
    if (ccPattern.test(formData.owner) || phonePattern.test(formData.owner)) {
      issues.push({
        id: "pii-owner",
        message: "El campo Responsable contiene cédula o teléfono personal en contravía de la Ley 1581 (minimización de datos).",
        autofixLabel: "Usar 'Equipo de Desarrollo'",
        applyFix: () => {
          handleTextChange("owner", "Equipo de Desarrollo");
        },
      });
    }

    return issues;
  };

  const clientBlockers = getClientBlockers();
  const isBlocked = clientBlockers.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked && !isOfficialProfile) return;
    onSubmit(formData);
  };

  const hasSensitiveDataSelected =
    formData.data_types.includes("personal") || formData.data_types.includes("financial");

  // CASO A: Internet + datos sensibles → SIEMPRE criticidad Alta (aplica incluso en modo perfil oficial)
  const mustBeHighCriticality =
    hasSensitiveDataSelected && formData.exposure === "internet";

  // CASO B: Internet + cualquier dato sin sensible → criticidad mínima Media
  const mustBeAtLeastMediumCriticality =
    formData.exposure === "internet" && !hasSensitiveDataSelected;

  // Auto-corrección CASO A: forzar "high" si internet + datos sensibles
  React.useEffect(() => {
    if (mustBeHighCriticality && formData.criticality !== "high") {
      setFormData((prev) => ({ ...prev, criticality: "high" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustBeHighCriticality]);

  // Auto-corrección CASO B: elevar de "low" a "medium" si internet sin datos sensibles
  React.useEffect(() => {
    if (mustBeAtLeastMediumCriticality && formData.criticality === "low") {
      setFormData((prev) => ({ ...prev, criticality: "medium" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustBeAtLeastMediumCriticality]);

  return (
    <div className="wizard-container">
      {/* Banner de Modo Demostración */}
      {isOfficialProfile && (
        <div className="demo-mode-alert">
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-primary)" }}>
              <CheckCircle size={16} color="var(--color-primary)" />
              <span>Modo Demostración Activo: {activeProfileName}</span>
            </div>
            <div className="demo-mode-text">
              Este perfil oficial contiene configuraciones deliberadas de <code>docs/datos-de-prueba.md</code> para probar la sanitización y el motor. Puedes enviarlo directamente desde cualquier paso.
            </div>
          </div>
          <button
            type="button"
            className="demo-direct-btn"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Evaluando..." : "Evaluar Perfil de Prueba en el Motor"}
          </button>
        </div>
      )}

      {/* Navegación Libre de Pasos */}
      <div className="wizard-steps-nav">
        <button
          type="button"
          className={`step-nav-item ${currentStep === 1 ? "active" : ""}`}
          onClick={() => setCurrentStep(1)}
        >
          <div className="step-circle">1</div>
          <div className="step-nav-info">
            <span className="step-label">Paso 1</span>
            <span className="step-title">Identificación y Alcance</span>
          </div>
        </button>

        <button
          type="button"
          className={`step-nav-item ${currentStep === 2 ? "active" : ""}`}
          onClick={() => setCurrentStep(2)}
        >
          <div className="step-circle">2</div>
          <div className="step-nav-info">
            <span className="step-label">Paso 2</span>
            <span className="step-title">Datos, Exposición y Login</span>
          </div>
        </button>

        <button
          type="button"
          className={`step-nav-item ${currentStep === 3 ? "active" : ""}`}
          onClick={() => setCurrentStep(3)}
        >
          <div className="step-circle">3</div>
          <div className="step-nav-info">
            <span className="step-label">Paso 3</span>
            <span className="step-title">Integraciones y Arquitectura</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {/* ===================================================================
            PASO 1: IDENTIFICACIÓN Y ALCANCE
            =================================================================== */}
        {currentStep === 1 && (
          <div className="step-content">
            <div className="form-group">
              <label className="form-label" htmlFor="project-name">
                <span>Nombre del Proyecto *</span>
                <span className="form-hint">Máx. 120 caracteres</span>
              </label>
              <input
                id="project-name"
                className="form-input"
                type="text"
                placeholder="Ej. Inventario de llantas"
                value={formData.name}
                onChange={(e) => handleTextChange("name", e.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="project-desc">
                <span>Qué problema resuelve (Descripción) *</span>
                <span className="form-hint">{formData.description.length}/1000</span>
              </label>
              <textarea
                id="project-desc"
                className="form-textarea"
                placeholder="Describe el objetivo y la necesidad operativa que aborda este desarrollo..."
                value={formData.description}
                onChange={(e) => handleTextChange("description", e.target.value)}
                maxLength={1000}
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="project-owner">
                <span>Responsable o Equipo Solicitante *</span>
                <span className="form-hint">Privacidad Ley 1581</span>
              </label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                {["Equipo de Desarrollo", "Líder Funcional del Área", "Arquitectura / TI"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleTextChange("owner", role)}
                    style={{
                      fontSize: "0.775rem",
                      fontWeight: 600,
                      padding: "0.3rem 0.65rem",
                      borderRadius: "var(--radius-sm)",
                      background: formData.owner === role ? "var(--color-primary-subtle)" : "#ffffff",
                      border: formData.owner === role ? "1px solid var(--color-primary)" : "1px solid var(--border-light)",
                      color: formData.owner === role ? "var(--color-primary)" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    + {role}
                  </button>
                ))}
              </div>
              <input
                id="project-owner"
                className="form-input"
                type="text"
                placeholder="Ej. Equipo de desarrollo"
                value={formData.owner}
                onChange={(e) => handleTextChange("owner", e.target.value)}
                required
              />
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.45rem", fontSize: "0.775rem", color: "var(--text-secondary)" }}>
                <Info size={14} color="var(--color-primary)" />
                <span>Por Ley 1581 (minimización de datos), registra el rol o equipo responsable. Evita ingresar cédulas o teléfonos personales.</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Área Solicitante *</span>
                <span className="form-hint">Selector oficial de negocio</span>
              </label>
              <div className="chips-grid">
                {[
                  { value: "taller", label: "Taller" },
                  { value: "repuestos", label: "Repuestos" },
                  { value: "comercial", label: "Comercial" },
                  { value: "flota", label: "Flota" },
                  { value: "financiera", label: "Financiera" },
                  { value: "talento_humano", label: "Talento Humano" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip-btn ${formData.area === item.value ? "selected" : ""}`}
                    onClick={() => handleSingleSelect("area", item.value as Area)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Etapa del Proyecto *</span>
                <span className="form-hint">Alcance operativo actual</span>
              </label>
              <div className="chips-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { value: "prototype", label: "Prototipo" },
                  { value: "pilot", label: "Piloto" },
                  { value: "production", label: "Producción" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip-btn ${formData.stage === item.value ? "selected" : ""}`}
                    onClick={() => handleSingleSelect("stage", item.value as Stage)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            PASO 2: DATOS, EXPOSICIÓN Y ACCESOS
            =================================================================== */}
        {currentStep === 2 && (
          <div className="step-content">
            <div className="form-group">
              <label className="form-label">
                <span>Audiencia *</span>
                <span className="form-hint">Usuarios autorizados</span>
              </label>
              <div className="chips-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { value: "own_area", label: "Mi área" },
                  { value: "multiple_areas", label: "Varias áreas" },
                  { value: "external_clients", label: "Clientes externos" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip-btn ${formData.audience === item.value ? "selected" : ""}`}
                    onClick={() => handleSingleSelect("audience", item.value as Audience)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Tipo de Datos (Varias) *</span>
                <span className="form-hint">Selecciona los que correspondan</span>
              </label>
              {/* CORRECCIÓN 1: Etiquetas limpias oficiales sin texto normativo incrustado */}
              <div className="chips-grid">
                {[
                  { value: "fictional", label: "Ficticios" },
                  { value: "internal", label: "Internos" },
                  { value: "personal", label: "Personales" },
                  { value: "financial", label: "Financieros" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip-btn ${formData.data_types.includes(item.value as DataType) ? "selected" : ""}`}
                    onClick={() => toggleDataType(item.value as DataType)}
                  >
                    {formData.data_types.includes(item.value as DataType) ? "✓ " : ""}{item.label}
                  </button>
                ))}
              </div>

              {/* CORRECCIÓN 1.2: Nota normativa sutil condicional */}
              {hasSensitiveDataSelected && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.55rem", fontSize: "0.775rem", color: "var(--status-warning)" }}>
                  <Info size={14} />
                  <span>Nota normativa: Al procesar datos personales o financieros se activarán las salvaguardas de la Ley 1581 de 2012.</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Exposición *</span>
                <span className="form-hint">Perímetro de red</span>
              </label>
              <div className="chips-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { value: "local", label: "Solo equipo local" },
                  { value: "internal_network", label: "Red interna" },
                  { value: "internet", label: "Internet" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip-btn ${formData.exposure === item.value ? "selected" : ""}`}
                    onClick={() => handleSingleSelect("exposure", item.value as Exposure)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Inicio de Sesión *</span>
                <span className="form-hint">Control de acceso</span>
              </label>
              <div className="chips-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { value: "none", label: "Sin inicio de sesión" },
                  { value: "own_accounts", label: "Cuentas propias" },
                  { value: "microsoft_entra", label: "Microsoft Entra ID" },
                ].map((item) => {
                  const isNoneDisabled = !isOfficialProfile && hasSensitiveDataSelected && item.value === "none";
                  return (
                    <button
                      key={item.value}
                      type="button"
                      disabled={isNoneDisabled}
                      className={`chip-btn ${formData.login === item.value ? "selected" : ""}`}
                      style={
                        isNoneDisabled
                          ? { opacity: 0.45, cursor: "not-allowed", textDecoration: "line-through", background: "#f1f5f9" }
                          : {}
                      }
                      title={
                        isNoneDisabled
                          ? "Bloqueado: Al procesar datos personales o financieros se exige inicio de sesión obligatorio."
                          : ""
                      }
                      onClick={() => !isNoneDisabled && handleSingleSelect("login", item.value as LoginMethod)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              {hasSensitiveDataSelected && !isOfficialProfile && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.55rem", fontSize: "0.775rem", color: "var(--color-accent)" }}>
                  <Info size={14} />
                  <span>Seguridad obligatoria: Al procesar datos personales o financieros, la opción 'Sin inicio de sesión' queda deshabilitada por Ley 1581.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            PASO 3: INTEGRACIONES Y ARQUITECTURA
            =================================================================== */}
        {currentStep === 3 && (
          <div className="step-content">
            <div className="form-group">
              <label className="form-label">
                <span>Integraciones (Varias) *</span>
                <span className="form-hint">R9: Solo se generan lineamientos para lo seleccionado</span>
              </label>
              <div className="chips-grid">
                {[
                  { value: "erp", label: "ERP" },
                  { value: "email", label: "Correo" },
                  { value: "file_storage", label: "Almacenamiento de archivos" },
                  { value: "ai_service", label: "Servicio de IA" },
                  { value: "none", label: "Ninguna" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`chip-btn ${formData.integrations.includes(item.value as Integration) ? "selected" : ""}`}
                    onClick={() => toggleIntegration(item.value as Integration)}
                  >
                    {formData.integrations.includes(item.value as Integration) ? "✓ " : ""}{item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Tecnología del Backend *</span>
                <span className="form-hint">Determina las reglas de .gitignore (R8)</span>
              </label>
              {/* Tecnologías primarias: Top 5 + botón "Otra..." */}
              {(() => {
                const SECONDARY_TECHS = ["php", "ruby", "rust", "kotlin", "other"] as BackendTech[];
                const showOtherDropdown = SECONDARY_TECHS.includes(formData.backend as BackendTech);
                return (
                  <>
                    <div className="chips-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                      {[
                        { value: "python",     label: "Python" },
                        { value: "typescript", label: "TypeScript / Node.js" },
                        { value: "java",       label: "Java" },
                        { value: "csharp",     label: "C# / .NET" },
                        { value: "go",         label: "Go" },
                        { value: "__other__",  label: "Otra..." },
                      ].map((item) => {
                        const isOtherBtn = item.value === "__other__";
                        const isSelected = isOtherBtn
                          ? showOtherDropdown
                          : formData.backend === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            id={`backend-btn-${item.value}`}
                            className={`chip-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              if (isOtherBtn) {
                                if (!showOtherDropdown) handleSingleSelect("backend", "other" as BackendTech);
                              } else {
                                handleSingleSelect("backend", item.value as BackendTech);
                              }
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Menú desplegable — solo visible cuando el valor actual es secundario */}
                    {showOtherDropdown && (
                      <select
                        id="backend-other-select"
                        className="form-input"
                        style={{ marginTop: "0.75rem" }}
                        value={formData.backend}
                        onChange={(e) => handleSingleSelect("backend", e.target.value as BackendTech)}
                      >
                        <option value="php">PHP (Laravel / Symfony)</option>
                        <option value="ruby">Ruby (Ruby on Rails)</option>
                        <option value="rust">Rust (Actix / Axum)</option>
                        <option value="kotlin">Kotlin (Ktor / Spring)</option>
                        <option value="other">Otro stack / Genérico</option>
                      </select>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Criticidad *</span>
                <span className="form-hint">R7: Criticidad alta exige RTO/RPO y respaldo</span>
              </label>
              <div className="chips-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { value: "low",    label: "Baja" },
                  { value: "medium", label: "Media" },
                  { value: "high",   label: "Alta" },
                ].map((item) => {
                  // CASO A: internet + sensible → bloquear Baja y Media
                  const isDisabledCaseA = mustBeHighCriticality && (item.value === "low" || item.value === "medium");
                  // CASO B: internet sin sensible → bloquear solo Baja
                  const isDisabledCaseB = mustBeAtLeastMediumCriticality && item.value === "low";
                  const isDisabledByCriticality = isDisabledCaseA || isDisabledCaseB;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      disabled={isDisabledByCriticality}
                      className={`chip-btn ${formData.criticality === item.value ? "selected" : ""}`}
                      style={
                        isDisabledByCriticality
                          ? { opacity: 0.45, cursor: "not-allowed", textDecoration: "line-through", background: "#f1f5f9" }
                          : {}
                      }
                      title={
                        isDisabledCaseA
                          ? "Bloqueado: Los sistemas con datos personales o financieros expuestos a Internet deben clasificarse obligatoriamente como Criticidad Alta (Ley 1581 / ISO 27001)."
                          : isDisabledCaseB
                          ? "Bloqueado: Ningún sistema expuesto a Internet puede tener Criticidad Baja (Gobernanza TI Navitrans)."
                          : ""
                      }
                      onClick={() => !isDisabledByCriticality && handleSingleSelect("criticality", item.value as Criticality)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              {/* Nota CASO A */}
              {mustBeHighCriticality && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", marginTop: "0.55rem", fontSize: "0.775rem", color: "var(--color-accent)", lineHeight: "1.4" }}>
                  <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span>
                    <strong>Nota de Gobernanza TI:</strong> Los sistemas con exposición a Internet que
                    procesan datos personales o financieros deben ser clasificados obligatoriamente con
                    Criticidad Alta por cumplimiento de la Ley 1581 (ISO 27001 / NIST).
                  </span>
                </div>
              )}
              {/* Nota CASO B */}
              {mustBeAtLeastMediumCriticality && !mustBeHighCriticality && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", marginTop: "0.55rem", fontSize: "0.775rem", color: "var(--status-warning)", lineHeight: "1.4" }}>
                  <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span>
                    <strong>Nota de Gobernanza TI:</strong> Ningún sistema con exposición pública a
                    Internet puede clasificarse como Criticidad Baja (superficie de ataque pública).
                    Selecciona <strong>Media</strong> o <strong>Alta</strong>.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            BLOQUEO PREVENTIVO EN CLIENTE
            =================================================================== */}
        {isBlocked && !isOfficialProfile && (
          <div className="validation-blocker-card">
            <AlertOctagon size={24} className="blocker-icon" />
            <div className="blocker-content">
              <h4>Acción Bloqueada Preventivamente por Reglas de Negocio</h4>
              {clientBlockers.map((issue) => (
                <div key={issue.id} style={{ marginBottom: "0.6rem" }}>
                  <p>• {issue.message}</p>
                  <button
                    type="button"
                    className="autofix-btn"
                    onClick={issue.applyFix}
                  >
                    <Wand2 size={13} style={{ display: "inline", marginRight: "4px" }} />
                    {issue.autofixLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            BOTONES DE NAVEGACIÓN
            =================================================================== */}
        <div className="wizard-actions">
          {currentStep > 1 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
            >
              <ArrowLeft size={16} /> Anterior
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)}
            >
              Siguiente <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || (isBlocked && !isOfficialProfile)}
              style={{ minWidth: "240px" }}
            >
              {isLoading ? (
                <>Evaluando y Generando Paquete...</>
              ) : (
                <>
                  <FileCheck2 size={18} /> Evaluar y Generar Paquete
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
