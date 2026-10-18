import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Bot,
  Terminal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PackageResponse, ProjectRequest } from "../types";
import { DocumentViewer } from "./DocumentViewer";

interface ResultsDashboardProps {
  packageData: PackageResponse;
  projectRequest: ProjectRequest;
  onBackToForm: () => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  packageData,
  projectRequest,
  onBackToForm,
  onDownloadZip,
  isDownloading,
}) => {
  const [showAllRules, setShowAllRules] = useState<boolean>(false);
  const { evaluation, files, intro_source, intro_fallback_reason } = packageData;

  const getLevelDescription = () => {
    switch (evaluation.effective_level) {
      case "basic":
        return "Riesgo Bajo: Prototipo restringido al equipo local o red interna sin datos sensibles. Aplica controles esenciales sin fricción operativa.";
      case "standard":
        return "Riesgo Estándar: Maneja datos personales o integra servicios corporativos. Exige control de acceso obligatorio, tratamiento de datos (Ley 1581) y validaciones en servidor.";
      case "strict":
        return "Riesgo Estricto: Expuesto a Internet, criticidad alta o datos sensibles sin autenticación. Se activan todos los controles de OWASP ASVS, HTTPS, RTO/RPO y aislamiento de secretos.";
    }
  };

  return (
    <div className="results-dashboard">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)" }}>Resultados de Evaluación</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Paquete oficial generado para <strong>{projectRequest.name}</strong>
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBackToForm}
          style={{ fontSize: "0.85rem" }}
        >
          <RotateCcw size={15} /> Ajustar Respuestas / Probar Otro Perfil
        </button>
      </div>

      <div className={`level-badge-container ${evaluation.effective_level}`}>
        <div className="level-pill">{evaluation.effective_level}</div>
        <div>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={20} /> Nivel Efectivo de Seguridad: {evaluation.effective_level.toUpperCase()}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {getLevelDescription()}
          </p>
        </div>
      </div>

      {evaluation.security_alerts.length > 0 && (
        <div className="card" style={{ borderLeft: "4px solid var(--color-accent)", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.85rem", color: "#991b1b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldAlert size={20} color="var(--color-accent)" />
            Hallazgos de Seguridad Detectados y Mitigados Automáticamente ({evaluation.security_alerts.length})
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {evaluation.security_alerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ fontWeight: 700, color: "#991b1b" }}>
                    Campo: <code>{alert.field}</code> — Tipo: <span style={{ textTransform: "uppercase" }}>{alert.alert_type}</span>
                  </span>
                  <span style={{ fontSize: "0.75rem", background: "#fee2e2", color: "#b91c1c", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                    Snippet: <code>{alert.snippet}</code>
                  </span>
                </div>
                <p style={{ color: "#7f1d1d", margin: 0 }}>{alert.detail}</p>
                {alert.alert_type === "pii" && (
                  <p style={{ color: "var(--status-success)", marginTop: "0.35rem", fontSize: "0.825rem", fontWeight: 700 }}>
                    ✓ Responsable anonimizado en documentos a: "{evaluation.sanitized_owner}"
                  </p>
                )}
                {alert.alert_type === "injection" && (
                  <p style={{ color: "var(--color-primary)", marginTop: "0.35rem", fontSize: "0.825rem", fontWeight: 700 }}>
                    ✓ Instrucción de evasión eliminada de la descripción oficial del proyecto.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluation.contradictions.length > 0 && (
        <div className="card" style={{ borderLeft: "4px solid var(--status-warning)", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.85rem", color: "#92400e", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={20} color="var(--status-warning)" />
            Contradicciones de Negocio Resueltas Automáticamente ({evaluation.contradictions.length})
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {evaluation.contradictions.map((c, idx) => (
              <div
                key={idx}
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ fontWeight: 700, color: "#78350f", marginBottom: "0.25rem" }}>
                  Conflicto entre campos: {c.fields.map((f) => <code key={f} style={{ marginRight: "4px" }}>{f}</code>)}
                </div>
                <p style={{ color: "#92400e", marginBottom: "0.4rem" }}><strong>Motivo:</strong> {c.description}</p>
                <p style={{ color: "#065f46", margin: 0, fontWeight: 600 }}><strong>Resolución del motor:</strong> {c.resolution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h4 style={{ fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              {intro_source === "ai_service" ? <Bot size={18} color="var(--color-primary)" /> : <Terminal size={18} color="var(--status-success)" />}
              <span>Origen de la Redacción de Lineamientos: </span>
              <span style={{ color: intro_source === "ai_service" ? "var(--color-primary)" : "var(--status-success)", fontWeight: 800 }}>
                {intro_source === "ai_service" ? "Servicio de IA Navitrans" : "Plantilla Local Resiliente (Fallback Seguro)"}
              </span>
            </h4>
            {intro_fallback_reason && (
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <strong>Motivo de Fallback:</strong> {intro_fallback_reason}
              </p>
            )}
          </div>
          <div style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
            Controles obligatorios activados: <strong style={{ color: "var(--color-primary)" }}>{evaluation.mandatory_controls.length}</strong>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          onClick={() => setShowAllRules(!showAllRules)}
        >
          <h3 style={{ fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)" }}>
            <Sparkles size={18} color="var(--color-primary)" />
            Trazabilidad de Reglas de Negocio (R1 — R9)
          </h3>
          <button type="button" className="btn btn-secondary" style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}>
            {showAllRules ? <>Ocultar <ChevronUp size={14} /></> : <>Ver todas las 9 reglas <ChevronDown size={14} /></>}
          </button>
        </div>

        {showAllRules && (
          <div style={{ marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
            {evaluation.rule_traces.map((trace) => (
              <div
                key={trace.code}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.65rem 0.85rem",
                  background: trace.triggered ? "var(--color-primary-subtle)" : "#f8fafc",
                  border: trace.triggered ? "1px solid rgba(10, 37, 64, 0.2)" : "1px solid var(--border-light)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.825rem",
                }}
              >
                <div style={{ fontWeight: 800, color: trace.triggered ? "var(--color-primary)" : "var(--text-dim)", minWidth: "32px" }}>
                  {trace.code}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: trace.triggered ? "var(--color-primary)" : "var(--text-secondary)" }}>
                    {trace.name} {trace.triggered ? "✅" : "⚪"}
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.785rem" }}>{trace.reason}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DocumentViewer
        files={files}
        onDownloadZip={onDownloadZip}
        isDownloading={isDownloading}
      />
    </div>
  );
};
