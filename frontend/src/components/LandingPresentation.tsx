import React from "react";
import {
  ShieldCheck,
  FileCode,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  GitBranch,
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
      {/* Hero Section */}
      <section className="card hero-card" style={{ textAlign: "center", padding: "3.5rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(14, 165, 233, 0.12)", border: "1px solid rgba(14, 165, 233, 0.3)", padding: "0.35rem 0.85rem", borderRadius: "9999px", fontSize: "0.8rem", color: "#38bdf8", fontWeight: 700, marginBottom: "1.5rem" }}>
          <ShieldCheck size={16} /> Innovación Segura para Prototipos Navitrans
        </div>
        <h2 style={{ fontSize: "2.75rem", fontWeight: 800, marginBottom: "1.25rem", lineHeight: 1.15 }}>
          Que cada prototipo arranque con las <span style={{ background: "linear-gradient(135deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>reglas claras</span>
        </h2>
        <p style={{ maxWidth: "780px", margin: "0 auto 2rem", fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          Herramienta corporativa que asesora y automatiza la gobernanza técnica de nuevos prototipos en <strong>Taller, Repuestos, Flota, Comercial y Financiera</strong> antes de escribir la primera línea de código.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={onStart} style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
            Iniciar Arranque Seguro <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Qué problema resuelve y para quién */}
      <section className="card">
        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <AlertTriangle color="#f59e0b" size={24} /> El Desafío en Navitrans
        </h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Hoy en día, las distintas áreas proponen aplicaciones internas que se construyen en pocos días apoyadas en Inteligencia Artificial. Sin embargo, surgen dolores recurrentes:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h4 style={{ color: "#f87171", fontSize: "0.95rem", marginBottom: "0.35rem" }}>Descubrimiento tardío de PII</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Se descubre en fase piloto que la aplicación procesaba cédulas y teléfonos sin aplicar la Ley 1581 de protección de datos.
            </p>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h4 style={{ color: "#fbbf24", fontSize: "0.95rem", marginBottom: "0.35rem" }}>Exposición y Autenticación Tardía</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Prototipos expuestos a Internet sin inicio de sesión o sin validaciones seguras en el servidor.
            </p>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h4 style={{ color: "#a78bfa", fontSize: "0.95rem", marginBottom: "0.35rem" }}>Secretos y Conflicto en Git</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Archivos <code>.env</code> o configuraciones personales de asistentes (Cursor, Claude) terminan en el repositorio compartido.
            </p>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="card">
        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Sparkles color="#38bdf8" size={24} /> Cómo Funciona: de la Idea al Paquete Versionable
        </h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Un proceso ágil en 3 pasos que toma menos de 2 minutos y entrega los lineamientos formales del proyecto:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--accent-cyan)", fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>Paso 1</div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Formulario Guiado</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Respuestas rápidas mediante opciones cerradas sobre audiencia, datos, exposición, integraciones y criticidad.
            </p>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--accent-indigo)", fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>Paso 2</div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Motor de Reglas y Seguridad</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Aplica reglas R1 a R9, detecta contradicciones, sanitiza inyecciones de prompt y minimiza PII en tiempo real.
            </p>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ color: "var(--accent-emerald)", fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>Paso 3</div>
            <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Paquete Oficial de Documentos</h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Entrega inmediata de 4 archivos listos para versionar en Git y descargar en archivo <code>.zip</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Qué módulos tiene y qué genera */}
      <section className="card">
        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FileCode color="#10b981" size={24} /> Los 4 Artefactos que Entrega
        </h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Todo desarrollador o líder de proyecto recibe estos archivos para incorporarlos en la raíz de su repositorio:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h4 style={{ color: "var(--accent-cyan)", fontSize: "0.95rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} /> DECISIONES.md
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Ficha técnica de decisiones, nivel efectivo asignado y registro auditable de contradicciones resueltas.
            </p>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h4 style={{ color: "var(--accent-cyan)", fontSize: "0.95rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} /> LINEAMIENTOS.md
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Guías normativas y técnicas personalizadas con procedencia explícita y filtradas por R9.
            </p>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h4 style={{ color: "var(--accent-cyan)", fontSize: "0.95rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} /> INSTRUCCIONES_IA.md
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Directivas obligatorias que el asistente de IA (Cursor, Claude, Copilot) debe obedecer antes de generar código.
            </p>
          </div>
          <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <h4 style={{ color: "var(--accent-cyan)", fontSize: "0.95rem", marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <CheckCircle2 size={16} /> .gitignore
            </h4>
            <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
              Exclusiones estrictas (R8) para <code>.env</code>, llaves criptográficas y carpetas personales de IA.
            </p>
          </div>
        </div>
      </section>

      {/* Procedencia Normativa */}
      <section className="card">
        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Scale color="#a855f7" size={24} /> Procedencia de los Lineamientos
        </h3>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Cada recomendación técnica está respaldada por un estándar de industria o por una decisión consensuada:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                <th style={{ padding: "0.75rem", color: "var(--text-dim)" }}>Dominio</th>
                <th style={{ padding: "0.75rem", color: "var(--text-dim)" }}>Estándar o Decisión</th>
                <th style={{ padding: "0.75rem", color: "var(--text-dim)" }}>Alcance Técnico</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)" }}>Privacidad</td>
                <td style={{ padding: "0.75rem" }}>Ley Estatutaria 1581 de 2012 (Colombia)</td>
                <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Minimización de datos, finalidad explícita y retención temporal.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)" }}>Seguridad Web</td>
                <td style={{ padding: "0.75rem" }}>OWASP Top 10 & ASVS v4.0</td>
                <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Validación en servidor, HTTPS forzoso, cero secretos en frontend.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)" }}>Red Interna</td>
                <td style={{ padding: "0.75rem" }}>Acuerdo con Infraestructura Navitrans (2024)</td>
                <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Riesgo bajo para red local; elevación a estándar si procesa datos personales.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)" }}>Continuidad</td>
                <td style={{ padding: "0.75rem" }}>ISO/IEC 27001 & NIST CSF</td>
                <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>RTO, RPO y respaldos verificados para proyectos de criticidad alta.</td>
              </tr>
              <tr>
                <td style={{ padding: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)" }}>Inteligencia Artificial</td>
                <td style={{ padding: "0.75rem" }}>Guía de Seguridad para LLMs (OWASP for LLM)</td>
                <td style={{ padding: "0.75rem", color: "var(--text-muted)" }}>Llaves de API solo en servidor, timeout resiliente y prohibición de fuga de PII.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Final */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button className="btn btn-primary" onClick={onStart} style={{ fontSize: "1.1rem", padding: "1rem 2.5rem" }}>
          Probar la Herramienta Ahora <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
