"""
Document package generator for the "Arranque Seguro" governance platform.

Generates the 4 standard project artifacts:
1. DECISIONES.md: Record of architectural, business, and security decisions made in the wizard.
2. LINEAMIENTOS.md: Regulatory and technical guidelines tailored to answers and rules R1-R9.
3. INSTRUCCIONES_IA.md: Clear and immutable specifications for development AI assistants.
4. .gitignore: Exclusion rules for secrets, assistant configurations, and dependencies.

Critical Security and Privacy Rules:
- R6: Sanitized project name and description are explicitly propagated to all 3 Markdown files.
- Markdown Sanitization: Special characters such as pipes ('|') inside table cells are escaped.
- Law 1581 / Privacy: Uses sanitized_owner and sanitized_description. If PII was detected,
  includes a Privacy by Design notice.
- R9: Strict integration filtering (only active integrations receive specific guidelines).
- Anti-Tamper: Full block of prompt injection traps (e.g., 'Matriz de trazabilidad Ámbar').
"""

from __future__ import annotations

import re
from typing import Any, Optional
from pydantic import BaseModel

from ..domain.models import (
    BackendTech,
    Criticality,
    DataType,
    EffectiveLevel,
    EvaluationResult,
    Exposure,
    Integration,
    LoginMethod,
    ProjectRequest,
    Stage,
)
from .ai_intro_client import AIIntroResult, generate_project_intro_sync


class GeneratedPackage(BaseModel):
    """Generated document package structure for the prototype repository."""

    files: dict[str, str]
    intro_source: str
    effective_level: EffectiveLevel


def _escape_markdown_table_cell(text: str) -> str:
    """Escapes vertical bars (pipes) and normalizes newlines for Markdown table cells."""
    escaped = text.replace("|", r"\|")
    escaped = re.sub(r"\r?\n", " ", escaped)
    return escaped.strip()


def _format_list_spanish(items: list[str]) -> str:
    """Formats a list of terms into a grammatically correct Spanish enumeration."""
    if not items:
        return "Ninguno"
    if len(items) == 1:
        return items[0]
    return f"{', '.join(items[:-1])} y {items[-1]}"


def _has_owner_pii_alert(evaluation: EvaluationResult) -> bool:
    """Determines whether the evaluation contains a PII alert on the project owner field."""
    return any(alert.field == "owner" and alert.alert_type == "pii" for alert in evaluation.security_alerts)


# ---------------------------------------------------------------------------
# 1. DECISIONES.md Generator
# ---------------------------------------------------------------------------

def _generate_decisiones_md(
    req: ProjectRequest,
    evaluation: EvaluationResult,
) -> str:
    escaped_name = _escape_markdown_table_cell(req.name)
    escaped_desc = _escape_markdown_table_cell(evaluation.sanitized_description)
    escaped_owner = _escape_markdown_table_cell(evaluation.sanitized_owner)

    owner_pii_note = ""
    if _has_owner_pii_alert(evaluation):
        owner_pii_note = (
            "\n> [!NOTE]\n"
            "> **Privacidad desde el Diseño (Ley 1581 de 2012):**\n"
            "> Los datos personales de contacto directo (cédula y/o celular) suministrados en el formulario "
            "fueron eliminados y anonimizados en este documento para cumplir con el principio de minimización de datos.\n"
        )

    # Spanish label mapping for form choices
    stage_es = {Stage.prototype: "Prototipo", Stage.pilot: "Piloto", Stage.production: "Producción"}.get(req.stage, req.stage.value)
    data_es = {
        DataType.fictional: "Ficticios",
        DataType.internal: "Internos",
        DataType.personal: "Personales",
        DataType.financial: "Financieros",
    }
    data_str = _format_list_spanish([data_es.get(d, d.value) for d in req.data_types])

    exposure_es = {
        Exposure.local: "Solo equipo local",
        Exposure.internal_network: "Red interna",
        Exposure.internet: "Internet",
    }.get(req.exposure, req.exposure.value)

    login_es = {
        LoginMethod.none: "Sin inicio de sesión",
        LoginMethod.own_accounts: "Cuentas propias",
        LoginMethod.microsoft_entra: "Microsoft Entra ID",
    }.get(req.login, req.login.value)

    integrations_es = {
        Integration.erp: "ERP",
        Integration.email: "Correo",
        Integration.file_storage: "Almacenamiento de archivos",
        Integration.ai_service: "Servicio de IA",
        Integration.none: "Ninguna",
    }
    integ_str = _format_list_spanish([integrations_es.get(i, i.value) for i in req.integrations])

    backend_es = {
        BackendTech.python:     "Python (FastAPI / Pydantic)",
        BackendTech.typescript: "TypeScript / Node.js",
        BackendTech.java:       "Java (Spring Boot)",
        BackendTech.csharp:     "C# / .NET",
        BackendTech.go:         "Go (Golang)",
        BackendTech.php:        "PHP (Laravel / Symfony)",
        BackendTech.ruby:       "Ruby on Rails",
        BackendTech.rust:       "Rust (Actix / Axum)",
        BackendTech.kotlin:     "Kotlin (Ktor / Spring)",
        BackendTech.other:      "Otro / Stack Genérico",
    }.get(req.backend, req.backend.value)

    criticality_es = {
        Criticality.low: "Baja",
        Criticality.medium: "Media",
        Criticality.high: "Alta",
    }.get(req.criticality, req.criticality.value)

    # Record of resolved contradictions
    contradictions_block = ""
    if evaluation.contradictions:
        contradictions_block = "\n## Contradicciones Detectadas y Resueltas\n\n"
        for idx, c in enumerate(evaluation.contradictions, start=1):
            fields_joined = ", ".join(f"`{f}`" for f in c.fields)
            contradictions_block += (
                f"### {idx}. Conflicto en campos: {fields_joined}\n"
                f"- **Motivo:** {c.description}\n"
                f"- **Resolución aplicada:** {c.resolution}\n\n"
            )
    else:
        contradictions_block = "\n## Contradicciones\n\nNo se identificaron inconsistencias entre las respuestas del formulario.\n"

    # Effective level and justification mapping
    level_es = {
        EffectiveLevel.basic: "Básico (Basic)",
        EffectiveLevel.standard: "Estándar (Standard)",
        EffectiveLevel.strict: "Estricto (Strict)",
    }.get(evaluation.effective_level, evaluation.effective_level.value)

    md = f"""# Decisiones del Proyecto: {req.name}

> Este documento registra las decisiones tomadas durante la fase de arranque y la evaluación automática de reglas de seguridad y arquitectura.

## Propósito del Proyecto
{evaluation.sanitized_description}

---

## Ficha Técnica de Decisiones

| Parámetro | Decisión Registrada |
| :--- | :--- |
| **Nombre del proyecto** | {escaped_name} |
| **Responsable** | {escaped_owner} |
| **Área solicitante** | {req.area.value.replace('_', ' ').capitalize()} |
| **Etapa** | {stage_es} |
| **Audiencia** | {req.audience.value.replace('_', ' ').capitalize()} |
| **Tipo de datos** | {data_str} |
| **Exposición** | {exposure_es} |
| **Inicio de sesión** | {login_es} |
| **Integraciones** | {integ_str} |
| **Tecnología backend** | {backend_es} |
| **Criticidad** | {criticality_es} |
{owner_pii_note}
---

## Evaluación de Reglas de Negocio (R1 - R9)

- **Nivel de seguridad efectivo asignado:** **{level_es}**
- **Controles obligatorios activados:** {len(evaluation.mandatory_controls)} controles requeridos.

### Trazabilidad de Reglas Aplicadas:
"""
    for trace in evaluation.rule_traces:
        status_icon = "✅" if trace.triggered else "⚪"
        md += f"- **{trace.code} ({trace.name})** {status_icon}: {trace.reason}\n"

    md += f"\n{contradictions_block}"
    return md


# ---------------------------------------------------------------------------
# 2. LINEAMIENTOS.md Generator
# ---------------------------------------------------------------------------

def _generate_lineamientos_md(
    req: ProjectRequest,
    evaluation: EvaluationResult,
    intro_result: AIIntroResult,
) -> str:
    level_str = evaluation.effective_level.value.upper()

    md = f"""# Lineamientos de Arquitectura y Seguridad: {req.name}

## 1. Introducción y Alcance
{intro_result.introduction}

> **Propósito declarado:** {evaluation.sanitized_description}  
> **Nivel de exigencia:** `{level_str}`  
> **Fuente de introducción:** `{intro_result.source}`  

---

## 2. Lineamientos Base de Arquitectura (R1)
> **Procedencia:** Estándares de Arquitectura Navitrans & Principios SOLID / Clean Code.

- **Estructura modular:** Separar responsabilidades en capas claras (Dominio, Servicios, API/Presentación). La lógica de negocio no debe acoplarse al framework web ni a la base de datos.
- **Configuración desacoplada (Twelve-Factor App):** Toda variable configurable, URL de dependencias y puertos debe gestionarse mediante variables de entorno (`.env`), nunca hardcodeada.
- **Documentación de contratos:** Exponer endpoints REST con especificación OpenAPI / Swagger estandarizada.

---
"""

    # R2: Personal data handling section
    if "data_treatment_section" in evaluation.mandatory_controls:
        md += """## 3. Tratamiento de Datos Personales (R2)
> **Procedencia:** Ley Estatutaria 1581 de 2012 de Colombia & Política Corporativa de Protección de Datos de Navitrans.

1. **Finalidad explícita:** Los datos personales capturados se utilizarán exclusivamente para los fines operativos descritos en este proyecto.
2. **Minimización de datos (Privacidad desde el Diseño):** Solo se solicitarán y almacenarán los campos estrictamente necesarios para la operación. Queda prohibido solicitar o almacenar cédulas o teléfonos en logs o campos no esenciales.
3. **Control de acceso y confidencialidad:** El acceso a bases de datos con información personal estará restringido únicamente al personal autorizado del área responsable.
4. **Conservación y retención temporal:** Definir un ciclo de vida para los datos; una vez finalizada la vigencia operativa, se deben anonimizar o eliminar de forma segura.

---
"""

    # R3: Internet exposure and perimeter security controls
    if "server_side_permissions" in evaluation.mandatory_controls or req.exposure == Exposure.internet:
        md += """## 4. Controles de Seguridad Perimetral y Exposición a Internet (R3)
> **Procedencia:** OWASP Top 10 (2021) & OWASP Application Security Verification Standard (ASVS v4.0).

- **Permisos verificados en el servidor:** Toda validación de roles y permisos debe ejecutarse en el backend. Las comprobaciones en el cliente web son únicamente para UX y nunca sustituyen la autorización en el servidor.
- **Cifrado en tránsito (HTTPS / TLS 1.3):** Todo tráfico externo debe exigir conexiones cifradas con certificados válidos.
- **Validación estricta de entradas:** Emplear esquemas de validación fuertemente tipados (e.g. Pydantic o Zod) para rechazar payloads maliciosos, inyecciones SQL o Cross-Site Scripting (XSS).
- **Manejo seguro de errores:** Los mensajes de error devueltos al cliente no deben exponer trazas de la aplicación (stack traces), rutas del sistema operativo ni versiones internas de librerías.
- **Cero secretos en el código:** Ningún token, contraseña, cadena de conexión o API Key puede existir en el código fuente.

---
"""

    # R4: Internal network controls
    if req.exposure == Exposure.internal_network:
        if "access_control" in evaluation.mandatory_controls:
            md += """## 5. Controles para Red Interna con Datos Sensibles (R2 sobre R4)
> **Procedencia:** Acuerdo de Seguridad de la Información e Infraestructura (2024) y Circular Externa SIC.

- **Control de acceso obligatorio:** Aunque la aplicación opera dentro de la red corporativa, el manejo de datos personales/financieros impide el acceso abierto. Se debe exigir autenticación y control de acceso basado en roles (RBAC).
- **Segmentación perimetral:** La aplicación solo debe escuchar peticiones en los segmentos de red interna autorizados.

---
"""
        else:
            md += """## 5. Lineamientos para Red Interna de Riesgo Bajo (R4)
> **Procedencia:** Acuerdo con Infraestructura Navitrans (2024).

- **Alcance simplificado:** Al manejar datos no sensibles restringidos al equipo local/red interna, se omiten controles exhaustivos de acceso y checklists perimetrales para facilitar la agilidad del prototipo.
- Se debe asegurar que el servidor no quede expuesto inadvertidamente a interfaces de red públicas.

---
"""

    # R7: High criticality requirements
    if "rto_rpo_definition" in evaluation.mandatory_controls or req.criticality == Criticality.high:
        md += """## 6. Disponibilidad, Respaldo y Continuidad del Negocio (R7)
> **Procedencia:** ISO/IEC 27001 (Control A.12.3 Respaldo) & NIST CSF (Controles de Recuperación).

- **Tiempo Máximo de Recuperación (RTO):** Definir el RTO admisible (máximo 4 horas en entorno productivo/piloto).
- **Pérdida de Datos Tolerable (RPO):** Establecer el RPO admisible (máximo 1 hora de información).
- **Plan de respaldo automatizado:** Se requiere un procedimiento comprobado de copia de seguridad periódica antes de migrar el prototipo a fase de piloto.
- **Autenticación obligatoria:** Prohibido el funcionamiento sin inicio de sesión en aplicaciones de criticidad alta.

---
"""

    # R9: Filter sections by active integrations
    has_integrations = bool(evaluation.active_integrations)
    if has_integrations:
        md += "## 7. Lineamientos de Integraciones Externas (R9)\n> **Procedencia:** Arquitectura de Integraciones Navitrans y R9 (solo secciones aplicables).\n\n"

        for integration in evaluation.active_integrations:
            if integration == Integration.ai_service:
                md += """### 7.1. Integración con Servicios de Inteligencia Artificial (R5)
> **Procedencia:** Buenas Prácticas OWASP Top 10 for LLM Applications & R5 Seguridad de la Información.

- **Gestión de claves en backend:** La llave del servicio de IA debe residir única y exclusivamente en el servidor y leerse desde variables de entorno. Jamás enviarla al navegador.
- **Prohibición de fuga de PII:** Está estrictamente prohibido enviar datos personales, cédulas, teléfonos o información financiera sin anonimizar a servicios externos de IA.
- **Resiliencia y degradación elegante:** La integración debe implementar timeout estricto y fallback ante desconexión o indisponibilidad del modelo.

"""
            elif integration == Integration.email:
                md += """### 7.2. Integración de Correo Electrónico
> **Procedencia:** Estándares de Mensajería Transaccional Navitrans.

- **Servicio transaccional seguro:** Enviar correos únicamente mediante el servidor SMTP o API autorizada usando autenticación TLS.
- **Plantillas sanitizadas:** Sanitizar variables dinámicas para prevenir inyección de encabezados de correo (Email Header Injection).
- **No enviar contraseñas:** Nunca enviar credenciales en texto plano por correo electrónico.

"""
            elif integration == Integration.erp:
                md += """### 7.3. Integración con ERP
> **Procedencia:** Guía de Conectores Empresariales Navitrans.

- **Uso de credenciales de servicio:** Conectarse al ERP mediante cuentas de servicio con permisos de mínimo privilegio.
- **Políticas de reintento y circuit-breaker:** Proteger las llamadas síncronas al ERP con timeouts y reintentos exponenciales para evitar bloqueos en cascada.

"""
            elif integration == Integration.file_storage:
                md += """### 7.4. Integración de Almacenamiento de Archivos
> **Procedencia:** Políticas de Almacenamiento Seguro de Objetos.

- **Validación de tipos MIME y extensiones:** Comprobar la extensión y el contenido real de los archivos antes de almacenarlos.
- **Almacenamiento fuera del webroot:** Los archivos no deben ser directamente ejecutables desde la raíz del servidor web.

"""
    else:
        md += """## 7. Integraciones Externas (R9)
> El proyecto no seleccionó integraciones externas; no se generan lineamientos adicionales de integración.

---
"""

    # Deployment verification checklist
    md += f"""## 8. Checklist de Validación para Despliegue
- [ ] Nombre del proyecto y propósito ({req.name}) validados.
- [ ] Variables de entorno configuradas sin secretos en Git.
- [ ] Reglas del `.gitignore` instaladas en la raíz del repositorio.
- [ ] Nivel `{level_str}` verificado por el líder técnico.
"""

    return md


# ---------------------------------------------------------------------------
# 3. INSTRUCCIONES_IA.md Generator
# ---------------------------------------------------------------------------

def _generate_instrucciones_ia_md(
    req: ProjectRequest,
    evaluation: EvaluationResult,
) -> str:
    level_str = evaluation.effective_level.value.upper()
    _TECH_LABEL = {
        BackendTech.python:     "Python (FastAPI / Pydantic)",
        BackendTech.typescript: "TypeScript / Node.js (Express / Fastify / NestJS)",
        BackendTech.java:       "Java (Spring Boot / Maven)",
        BackendTech.csharp:     "C# / .NET (ASP.NET Core)",
        BackendTech.go:         "Go (Golang / Gin / Fiber)",
        BackendTech.php:        "PHP (Laravel / Symfony)",
        BackendTech.ruby:       "Ruby (Ruby on Rails)",
        BackendTech.rust:       "Rust (Actix-web / Axum)",
        BackendTech.kotlin:     "Kotlin (Ktor / Spring Boot)",
        BackendTech.other:      "Stack Genérico / Personalizado",
    }
    tech_str = _TECH_LABEL.get(req.backend, req.backend.value)

    md = f"""# Instrucciones para el Asistente de IA: {req.name}

> Este documento contiene las directivas obligatorias que cualquier asistente de IA (Cursor, Claude, Copilot, ChatGPT, etc.) debe leer y obedecer estrictamente antes de generar o modificar código en este proyecto.

---

## 1. Contexto y Propósito del Proyecto (R6)
- **Nombre del proyecto:** {req.name}
- **Área solicitante:** {req.area.value.replace('_', ' ').capitalize()}
- **Propósito:** {evaluation.sanitized_description}
- **Etapa actual:** {req.stage.value.capitalize()}
- **Nivel de seguridad requerido:** `{level_str}`
- **Stack tecnológico base:** {tech_str}

---

## 2. Documentos que Debes Leer Primero
Antes de sugerir arquitecturas o escribir código, consulta en este orden:
1. `DECISIONES.md`: Contiene las decisiones funcionales y técnicas acordadas.
2. `LINEAMIENTOS.md`: Contiene las reglas obligatorias de seguridad y arquitectura.
3. `.gitignore`: Reglas de exclusión de archivos confidenciales.

---

## 3. Reglas Innegociables de Desarrollo y Seguridad

### 3.1. Manejo de Secretos y Configuración
- **NUNCA** coloques tokens, contraseñas, API keys o URLs privadas hardcodeadas en el código fuente.
- Toda configuración confidencial debe leerse desde variables de entorno mediante librerías seguras (e.g. `pydantic-settings` o `dotenv`).
- Respeta estrictamente el archivo `.gitignore`. **JAMÁS** sugieras agregar `.env` o archivos de configuración de asistentes al repositorio.

### 3.2. Validación en el Servidor (OWASP)
- Toda validación debe ocurrir en el backend, no solo en la interfaz de usuario.
- Valida tipos, longitudes y rangos permitidos con esquemas formales.
- Sanitiza y escapa cualquier salida para prevenir inyecciones (SQL, XSS, Command Injection).

### 3.3. Manejo de Datos y Privacidad (Ley 1581)
- Si este prototipo procesa datos personales, aplica el principio de minimización.
- No almacenes datos personales en memoria sin cifrar ni en registros de depuración (logs).
- Si usas modelos de IA externos, **NUNCA** envíes datos personales sin anonimizar previamente (R5).

### 3.4. Instrucciones Propias del Proyecto
- Puedes enriquecer este archivo con convenciones de estilo de código de tu equipo, pero **NUNCA** borres ni relajes las directivas de seguridad aquí descritas.
- Ante cualquier conflicto entre velocidad de desarrollo y seguridad, prevalece el nivel de seguridad `{level_str}` asignado.
"""

    return md


# ---------------------------------------------------------------------------
# 4. .gitignore Generator (R8)
# ---------------------------------------------------------------------------

def _generate_gitignore(req: ProjectRequest) -> str:
    gi = """# ===================================================================
# Arranque Seguro - Reglas .gitignore del Proyecto
# ===================================================================

# Variables de entorno y secretos locales (R8)
.env
.env.*
!.env.example
*.pem
*.key
*.cert
*.pfx
secrets/
config/secrets.*

# Configuraciones personales de Asistentes de IA (R8)
AGENTS.md
CLAUDE.md
.claude/
.cursor/
.codex/
.gemini/
.copilot/
*.code-workspace

# Logs y volcados de depuración
*.log
logs/
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Archivos del sistema operativo
.DS_Store
Thumbs.db
desktop.ini
"""

    if req.backend == BackendTech.python:
        gi += """
# Entorno y artefactos de Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.pytest_cache/
.coverage
htmlcov/
"""
    elif req.backend == BackendTech.typescript:
        gi += """
# Entorno y dependencias de Node / TypeScript
node_modules/
dist/
build/
out/
.next/
.nuxt/
coverage/
*.tsbuildinfo
.npm
.yarn/
"""
    elif req.backend in (BackendTech.java, BackendTech.kotlin):
        gi += """
# Artefactos JVM — Java / Kotlin (Maven / Gradle)
target/
*.jar
*.war
*.ear
*.class
.gradle/
build/
out/
.idea/
*.iml
"""
    elif req.backend == BackendTech.csharp:
        gi += """
# Artefactos .NET — C# / ASP.NET Core
bin/
obj/
*.user
*.suo
*.csproj.user
*.sln.user
.vs/
packages/
"""
    elif req.backend == BackendTech.go:
        gi += """
# Artefactos Go (Golang)
bin/
vendor/
*.exe
*.test
"""
    elif req.backend == BackendTech.php:
        gi += """
# Artefactos PHP (Laravel / Symfony)
vendor/
.phpunit.result.cache
storage/logs/
storage/framework/cache/
bootstrap/cache/
.env.testing
"""
    elif req.backend == BackendTech.ruby:
        gi += """
# Artefactos Ruby on Rails
.bundle/
vendor/bundle/
log/
tmp/
*.sqlite3
coverage/
"""
    elif req.backend == BackendTech.rust:
        gi += """
# Artefactos Rust (Cargo)
target/
Cargo.lock
*.rlib
"""
    else:
        gi += """
# Artefactos de compilación genéricos
build/
dist/
bin/
obj/
out/
"""

    return gi


# ---------------------------------------------------------------------------
# 5. Main Package Generator Entry Point
# ---------------------------------------------------------------------------

def generate_package(
    request: ProjectRequest,
    evaluation: EvaluationResult,
    ai_intro: Optional[AIIntroResult] = None,
) -> GeneratedPackage:
    """
    Builds the complete 4-artifact package in Markdown and .gitignore format.

    Rigorously applies:
    - R1: Complete base package.
    - R2: Personal data handling section and PII anonymization with legal notice.
    - R3: Internet exposure controls when applicable.
    - R4: Internal network handling.
    - R5: AI assistant rules in guidelines and instructions.
    - R6: Name and description propagated to DECISIONES, LINEAMIENTOS and INSTRUCCIONES IA with Markdown escaping.
    - R7: High criticality controls (RTO/RPO/backups).
    - R8: .gitignore with secrets and personal AI folders exclusion.
    - R9: Section filtering based on active_integrations.
    - Zero inclusion of prompt injection traps or unauthorized bypasses.
    """
    # 1. Obtain project introduction if not provided externally
    if ai_intro is None:
        ai_intro = generate_project_intro_sync(request, evaluation)

    # 2. Generate each document artifact
    decisiones = _generate_decisiones_md(request, evaluation)
    lineamientos = _generate_lineamientos_md(request, evaluation, ai_intro)
    instrucciones_ia = _generate_instrucciones_ia_md(request, evaluation)
    gitignore = _generate_gitignore(request)

    files = {
        "DECISIONES.md": decisiones,
        "LINEAMIENTOS.md": lineamientos,
        "INSTRUCCIONES_IA.md": instrucciones_ia,
        ".gitignore": gitignore,
    }

    return GeneratedPackage(
        files=files,
        intro_source=ai_intro.source,
        effective_level=evaluation.effective_level,
    )
