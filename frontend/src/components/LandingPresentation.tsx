import React from "react";
import {
  ShieldCheck,
  FileCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from "lucide-react";

interface LandingPresentationProps {
  onStart: () => void;
}

export const LandingPresentation: React.FC<LandingPresentationProps> = ({ onStart }) => {
  return (
    <div className="presentation-view">
      <section className="card hero-card" style={{ textAlign: "center", padding: "3.5rem 2rem", borderTop: "4px solid var(--color-primary)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--color-primary-subtle)", border: "1px solid rgba(10, 37, 64, 0.2)", padding: "0.35rem 0.85rem", borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 700, marginBottom: "1.5rem" }}>
          <ShieldCheck size={16} /> Innovación y Gobernanza Técnica para Prototipos Navitrans
        </div>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1.25rem", color: "var(--color-primary)", lineHeight: 1.2 }}>
          Que cada prototipo arranque con las <span style={{ color: "var(--color-accent)" }}>reglas claras</span>
        </h2>
        <p style={{ maxWidth: "780px", margin: "0 auto 2rem", fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Herramienta corporativa que asesora y automatiza la gobernanza técnica de nuevos desarrollos en <strong>Taller, Repuestos, Flota, Comercial, Financiera y Talento Humano</strong> antes de escribir la primera línea de código.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={onStart} style={{ fontSize: "0.95rem", padding: "0.85rem 2.25rem" }}>
            Iniciar Arranque Seguro <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="card">
        <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <AlertTriangle color="var(--color-accent)" size={24} /> El Desafío en Navitrans
        </h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.925rem" }}>
          Las distintas áreas proponen aplicaciones internas que se construyen en pocos días apoyadas en Inteligencia Artificial. Sin embargo, surgen fricciones recurrentes al intentar llevarlas a piloto:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "#fbfcfc", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
            <h4 style={{ color: "var(--color-accent)", fontSize: "0.95rem", marginBottom: "0.35rem", fontWeight: 700 }}>
              Descubrimiento tardío de PII
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Se descubre en fase piloto que la aplicación procesaba cédulas y teléfonos sin aplicar la Ley 1581 de protección de datos personales.
            </p>
          </div>
          <div style={{ background: "#fbfcfc", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
            <h4 style={{ color: "var(--status-warning)", fontSize: "0.95rem", marginBottom: "0.35rem", fontWeight: 700 }}>
              Exposición y Autenticación Tardía
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Prototipos publicados a Internet sin inicio de sesión formal o sin validaciones defensivas en el servidor.
            </p>
          </div>
          <div style={{ background: "#fbfcfc", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
            <h4 style={{ color: "var(--color-primary)", fontSize: "0.95rem", marginBottom: "0.35rem", fontWeight: 700 }}>
              Secretos y Conflicto en Git
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Archivos <code>.env</code> con tokens o configuraciones de asistentes (Cursor, Claude) terminan en el repositorio compartido.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Sparkles color="var(--color-primary)" size={24} /> Cómo Funciona: de la Idea al Paquete Versionable
        </h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.925rem" }}>
          Un proceso ágil en 3 pasos que toma menos de 2 minutos y entrega los lineamientos formales del proyecto:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", borderTop: "3px solid var(--color-primary)" }}>
            <div style={{ color: "var(--color-primary)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem" }}>Paso 1</div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Formulario Guiado</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Respuestas rápidas mediante opciones cerradas sobre audiencia, tipo de datos, exposición, integraciones y criticidad.
            </p>
          </div>
          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", borderTop: "3px solid var(--color-primary)" }}>
            <div style={{ color: "var(--color-primary)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem" }}>Paso 2</div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Motor de Reglas y Seguridad</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Aplica reglas R1 a R9, detecta contradicciones, sanitiza inyecciones de prompt y minimiza PII en tiempo real.
            </p>
          </div>
          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)", borderTop: "3px solid var(--color-accent)" }}>
            <div style={{ color: "var(--color-accent)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem" }}>Paso 3</div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Paquete Oficial de Documentos</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Entrega inmediata de 4 archivos listos para versionar en Git y descargar en archivo <code>.zip</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FileCode color="var(--color-primary)" size={24} /> Los 4 Artefactos que Entrega
        </h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.925rem" }}>
          Todo desarrollador o líder técnico recibe estos archivos para incorporarlos en la raíz de su repositorio:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "#fbfcfc", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
            <h4 style={{ color: "var(--color-primary)", fontSize: "0.95rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} color="var(--status-success)" /> DECISIONES.md
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Ficha técnica de decisiones, nivel efectivo asignado y registro auditable de contradicciones resueltas.
            </p>
          </div>
          <div style={{ background: "#fbfcfc", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
            <h4 style={{ color: "var(--color-primary)", fontSize: "0.95rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} color="var(--status-success)" /> LINEAMIENTOS.md
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Guías normativas y técnicas personalizadas con procedencia explícita y filtradas estrictamente por R9.
            </p>
          </div>
          <div style={{ background: "#fbfcfc", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
            <h4 style={{ color: "var(--color-primary)", fontSize: "0.95rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} color="var(--status-success)" /> INSTRUCCIONES_IA.md
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Directivas inmutables que el asistente de IA (Cursor, Claude, Copilot) debe respetar antes de programar.
            </p>
          </div>
          <div style={{ background: "#fbfcfc", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
            <h4 style={{ color: "var(--color-primary)", fontSize: "0.95rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} color="var(--status-success)" /> .gitignore
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              Exclusiones estrictas (R8) para <code>.env</code>, llaves criptográficas y carpetas personales de asistentes.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Scale color="var(--color-primary)" size={24} /> Procedencia de los Lineamientos
        </h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.925rem" }}>
          Cada directriz técnica está respaldada por un marco normativo o por un acuerdo institucional de Navitrans:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "var(--color-primary-subtle)", borderBottom: "2px solid var(--border-light)", textAlign: "left" }}>
                <th style={{ padding: "0.85rem", color: "var(--color-primary)", fontWeight: 700 }}>Dominio</th>
                <th style={{ padding: "0.85rem", color: "var(--color-primary)", fontWeight: 700 }}>Estándar o Acuerdo</th>
                <th style={{ padding: "0.85rem", color: "var(--color-primary)", fontWeight: 700 }}>Alcance Técnico</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "0.85rem", fontWeight: 700, color: "var(--color-primary)" }}>Privacidad</td>
                <td style={{ padding: "0.85rem" }}>Ley Estatutaria 1581 de 2012 (Colombia)</td>
                <td style={{ padding: "0.85rem", color: "var(--text-secondary)" }}>Minimización de datos, finalidad explícita y retención temporal.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "0.85rem", fontWeight: 700, color: "var(--color-primary)" }}>Seguridad Web</td>
                <td style={{ padding: "0.85rem" }}>OWASP Top 10 & ASVS v4.0</td>
                <td style={{ padding: "0.85rem", color: "var(--text-secondary)" }}>Validación en servidor, HTTPS forzoso, cero secretos en frontend.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "0.85rem", fontWeight: 700, color: "var(--color-primary)" }}>Red Interna</td>
                <td style={{ padding: "0.85rem" }}>Acuerdo con Infraestructura Navitrans (2024)</td>
                <td style={{ padding: "0.85rem", color: "var(--text-secondary)" }}>Riesgo bajo para red local; elevación a estándar si procesa datos personales.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "0.85rem", fontWeight: 700, color: "var(--color-primary)" }}>Continuidad</td>
                <td style={{ padding: "0.85rem" }}>ISO/IEC 27001 & NIST CSF</td>
                <td style={{ padding: "0.85rem", color: "var(--text-secondary)" }}>RTO, RPO y respaldos verificados para proyectos de criticidad alta.</td>
              </tr>
              <tr>
                <td style={{ padding: "0.85rem", fontWeight: 700, color: "var(--color-primary)" }}>Inteligencia Artificial</td>
                <td style={{ padding: "0.85rem" }}>Guía de Seguridad para LLMs (OWASP for LLM)</td>
                <td style={{ padding: "0.85rem", color: "var(--text-secondary)" }}>Llaves de API solo en servidor, timeout resiliente y prohibición de fuga de PII.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
        <button className="btn btn-primary" onClick={onStart} style={{ fontSize: "1rem", padding: "1rem 2.5rem" }}>
          Probar la Herramienta Ahora <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
