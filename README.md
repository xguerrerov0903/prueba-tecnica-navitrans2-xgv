# Arranque Seguro — Navitrans

[![Pruebas Automatizadas](https://img.shields.io/badge/tests-71%2F71%20passing-brightgreen.svg)](backend/tests/)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![Docker Compose](https://img.shields.io/badge/docker--compose-ready-2496ED.svg)](docker-compose.yml)
[![Normativa](https://img.shields.io/badge/cumplimiento-Ley%201581%20%7C%20OWASP%20ASVS-orange.svg)](docs/reglas-de-negocio.md)

> Herramienta corporativa para estandarizar el inicio de prototipos y pilotos en Navitrans, garantizando gobernanza técnica, seguridad por diseño y directivas inmutables para asistentes de desarrollo con Inteligencia Artificial.

---

## 1. Resumen Ejecutivo

En Navitrans, áreas como Taller, Repuestos, Comercial y Flota formulan frecuentemente iniciativas digitales que inician como prototipos ágiles construidos con asistencia de Inteligencia Artificial. Con frecuencia, estos proyectos enfrentaban:
1. **Descubrimiento tardío de datos personales o financieros** en etapas avanzadas de piloto o producción.
2. **Publicación involuntaria en Internet sin esquemas de autenticación**.
3. **Fuga accidental de credenciales (`.env`)** y colisión de configuraciones personales de asistentes de IA en repositorios compartidos.

**Arranque Seguro** resuelve este problema en la fuente: a través de un asistente web guiado de 3 pasos, evalúa las decisiones arquitectónicas del proyecto frente a un **motor de reglas determinístico (R1–R9)** y una **matriz de contradicciones (C1–C7)**, entregando al instante un paquete normativo listo para versionar en Git:
- `DECISIONES.md`: Ficha técnica de decisiones y registro de contradicciones resueltas.
- `LINEAMIENTOS.md`: Guías obligatorias de seguridad, tratamiento de datos y arquitectura adaptadas a las respuestas.
- `INSTRUCCIONES_IA.md`: Directivas inmutables para asistentes de IA (Cursor, GitHub Copilot, Claude, Gemini, etc.), delimitando alcance y reglas de no agresión al repositorio.
- `.gitignore`: Configuración a la medida según el stack tecnológico (con soporte para 10 tecnologías de backend).

---

## 2. Guía de Inicio Rápido (Quickstart)

### Opción A — Despliegue con Docker Compose (Recomendada, 1 comando)

Levanta la solución completa (Backend FastAPI + Frontend Nginx) en contenedores aislados:

```bash
docker compose up --build -d
```

Una vez iniciado el contenedor, accede directamente a:
- 🌐 **Frontend Web (Página y Formulario):** [http://localhost:8080](http://localhost:8080)
- ⚙️ **Backend API REST:** [http://localhost:8000](http://localhost:8000)
- 📖 **Documentación Interactiva Swagger / OpenAPI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **Endpoint de Verificación de Salud:** [http://localhost:8000/health](http://localhost:8000/health)

Para detener los servicios:
```bash
docker compose down
```

---

### Opción B — Ejecución Local (Windows / Linux / macOS)

#### Paso 1: Configurar y Levantar el Backend
```bash
# 1. Crear y activar entorno virtual Python 3.11+
python -m venv .venv

# En Windows (PowerShell):
.venv\Scripts\Activate.ps1
# En Linux/macOS:
# source .venv/bin/activate

# 2. Instalar dependencias
pip install -r backend/requirements.txt

# 3. Iniciar el servidor Uvicorn en el puerto 8000
uvicorn backend.app.main:app --reload --port 8000
```

#### Paso 2: Instalar Dependencias y Levantar el Frontend (Vite Dev Server)
En otra terminal, arranca el servidor de desarrollo de Vite en el puerto 5173:
```bash
cd frontend
npm install
npm run dev
```
Abre tu navegador en [http://localhost:5173](http://localhost:5173).

> **Nota:** El servidor Vite redirige automáticamente las llamadas a `/api` al backend en `http://127.0.0.1:8000` mediante el proxy configurado en `frontend/vite.config.ts`.

#### Paso 3: Ejecutar la Suite de Pruebas Automatizadas (71 Tests)
La solución incluye una suite exhaustiva de 71 pruebas que validan el motor de reglas, seguridad, sanitización y API:
```bash
python -m pytest backend/tests -v
```

---

### Configuración de Variables de Entorno (`.env.example`)

El proyecto incluye un archivo de referencia [`.env.example`](.env.example):

```ini
# Endpoint opcional del servicio de redacción de IA de Navitrans
NAVITRANS_AI_URL=https://redaccion-ia.navitrans.example/v1/introducciones
NAVITRANS_AI_TOKEN=reemplazar_con_token_asignado
NAVITRANS_AI_TIMEOUT_SECONDS=3.0

# Configuración del Backend
APP_ENV=development
PORT=8000
```

> [!IMPORTANT]
> **Neutralización de Trampa de Seguridad — Cero Secretos en Git (Regla R1 / OWASP ASVS v4.0):**
> En los anexos de la prueba técnica se menciona la posibilidad de *"dejar el token en el código o subir el archivo `.env` al repositorio"*. **Esta práctica fue rechazada categóricamente.**
> 
> En cumplimiento estricto del estándar OWASP ASVS V14.2 y las políticas de seguridad de Navitrans:
> 1. El archivo `.env` está estrictamente ignorado en `.gitignore`.
> 2. La aplicación es **100% operativa *out-of-the-box*** sin configurar ninguna variable ni token externo. Si no se suministra token o el servicio de IA no responde, el cliente activa de inmediato su **Fallback Determinístico Local**.

---

## 3. Arquitectura y Motor Determinístico

### Árbol Limpio del Repositorio

```
prueba-tecnica-navitrans2-xgv/
├── backend/
│   ├── app/
│   │   ├── api/routes.py            # Adaptadores REST (/api/evaluate, /api/generate, /api/download-zip)
│   │   ├── domain/
│   │   │   ├── models.py            # Esquemas Pydantic v2 inmutables y Enums tipados
│   │   │   ├── presets.py           # Perfiles oficiales de prueba precargados (docs/datos-de-prueba.md)
│   │   │   └── rules_engine.py      # Motor de reglas funcional puro (R1-R9, C1-C7, Sanitización)
│   │   ├── services/
│   │   │   ├── package_generator.py # Generador de artefactos Markdown y empaquetador ZIP en memoria
│   │   │   └── ai_intro_client.py   # Cliente HTTP resiliente con timeout y fallback local
│   │   └── main.py                  # Entrypoint FastAPI con middleware CORS
│   ├── tests/
│   │   ├── test_api.py              # Pruebas de integración de endpoints REST
│   │   └── test_rules_engine.py     # Pruebas unitarias de reglas, perfiles oficiales y seguridad
│   ├── Dockerfile                   # Imagen Docker backend
│   └── requirements.txt             # Dependencias de producción y pruebas
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Componente raíz: navegación entre vistas (presentación → wizard → resultados)
│   │   ├── main.tsx                 # Entrypoint React 18 (ReactDOM.createRoot)
│   │   ├── index.css                # Sistema de diseño Navitrans (tokens CSS, glassmorphism, dark/light)
│   │   ├── components/              # Componentes React tipados en TypeScript estricto
│   │   │   ├── LandingPresentation.tsx  # Página ejecutiva de presentación con métricas y normativa
│   │   │   ├── WizardForm.tsx           # Asistente guiado de 3 pasos con validación preventiva
│   │   │   ├── ResultsDashboard.tsx     # Panel de resultados, reglas y alertas de seguridad
│   │   │   ├── DocumentViewer.tsx       # Visor con tabs, copia y descarga de artefactos
│   │   │   └── ProfileSelector.tsx      # Selector de perfiles oficiales con carga en un clic
│   │   ├── services/api.ts          # Cliente HTTP tipado con fallback local para perfiles
│   │   └── types/index.ts           # Tipos TypeScript sincronizados 1:1 con modelos Pydantic
│   ├── index.html                   # HTML raíz (punto de montaje del SPA React)
│   ├── vite.config.ts               # Configuración Vite: proxy /api → backend, puerto 5173
│   ├── Dockerfile                   # Multi-stage: Node.js compila (tsc && vite build) → Nginx Alpine sirve
│   └── package.json                 # React 18, TypeScript 5, Vite 6, Lucide React
├── docs/
│   ├── contexto.md                  # Diagnóstico operativo del área de prototipos
│   ├── requisitos.md                # Requisitos funcionales de la herramienta
│   ├── reglas-de-negocio.md         # Catálogo original de reglas R1 a R9
│   ├── datos-de-prueba.md           # Perfiles 1, 2 y 3 de prueba oficial
│   ├── enunciado-original.md        # Respaldo histórico del README original
│   └── ENTREGA.md                   # Respaldo de la guía de entrega
├── ejemplos/                        # Artefactos reales generados para los 3 perfiles oficiales
│   ├── perfil-1-inventario-llantas/ # Nivel Basic (Python, local, datos ficticios)
│   ├── perfil-2-seguimiento-garantias/ # Nivel Strict (TypeScript, PII Andrea Ríos sanitizada, R2>R4)
│   └── perfil-3-citas-taller/       # Nivel Strict (TypeScript, Internet, Anti-Prompt Injection, C6/C7)
├── plantillas/
│   └── DECISIONES.md                # Plantilla de decisiones sincronizada
├── DECISIONES.md                    # Registro exhaustivo de decisiones de arquitectura y riesgos aceptados
├── ENTREGA.md                       # Checklist y guía de verificación de entrega
├── docker-compose.yml               # Orquestación de contenedores Backend + Frontend
└── .gitignore                       # Exclusiones estrictas de secretos, cachés y artefactos
```

---

### Motor de Reglas (R1 a R9) y Soporte para 10 Tecnologías Backend (R8)

El motor evalúa las respuestas mediante funciones puras sin efectos secundarios:

| Regla | Descripción | Comportamiento Implementado |
| :---: | :--- | :--- |
| **R1** | Paquete Base Universal | Todo proyecto genera `DECISIONES.md`, `LINEAMIENTOS.md`, `INSTRUCCIONES_IA.md` y `.gitignore`. |
| **R2** | Tratamiento de Datos Personales | Activa sección de Ley 1581 de 2012 si hay datos personales o financieros. Prevalece sobre R4. |
| **R3** | Controles para Internet | Exige HTTPS, validación en servidor, manejo de errores opaco y autenticación obligatoria. |
| **R4** | Red Interna (Riesgo Bajo) | Si solo maneja datos ficticios/internos, omite controles de acceso; si detecta datos personales (R2), se eleva a nivel `standard`. |
| **R5** | Integración con Servicio de IA | Llaves solo en servidor. **Filtro preventivo:** No envía datos personales/financieros al servicio externo. |
| **R6** | Propagación de Identidad | El nombre y descripción sanitizada se propagan íntegramente a todos los documentos del paquete. |
| **R7** | Criticidad Alta | Exige definición de RTO/RPO, política de respaldos antes de piloto e inicio de sesión mandatorio. |
| **R8** | Soporte Multitecnología en `.gitignore` | Excluye secretos (`.env`) y configuraciones de IA (`AGENTS.md`, `.cursor/`, etc.). Soporta **10 tecnologías de backend**: |
| | | • **5 directas en interfaz:** Python, TypeScript, Java, C#, Go.<br>• **5 en menú desplegable:** Kotlin, PHP, Ruby, Rust, Other (con soporte retrocompatible). |
| **R9** | Relevancia Estricta de Secciones | Solo se redactan lineamientos para integraciones activamente seleccionadas (cero secciones vacías). |

---

### Matriz de Resolución de Contradicciones (C1 a C7)

El motor detecta incoherencias en las respuestas y las resuelve determinísticamente aplicando el principio de mayor rigor:

| Código | Condición Detectada | Resolución Determinística Aplicada |
| :---: | :--- | :--- |
| **C1** | Prototipo expuesto a Internet | Eleva el nivel a `strict` y activa todos los controles de R3. |
| **C2** | Datos sensibles sin login (incluso local) | Fuerza `login_required`, control de acceso y eleva a nivel mínimo `standard` (Ley 1581). |
| **C3** | Criticidad Alta sin inicio de sesión | Fuerza `login_required` como control obligatorio (R7). |
| **C4** | Internet sin login y con datos no ficticios | Fuerza `login_required` para salvaguardar la superficie de ataque (R3). |
| **C5** | Prototipo con datos reales | Emite advertencia y exige reemplazar por datos sintéticos/ficticios. |
| **C6** | **Internet + Datos Sensibles con Criticidad declarada Baja/Media** | **Fuerza Criticidad Alta y nivel `strict`**, activando controles RTO/RPO, respaldo y login (ISO 27001 / Ley 1581). |
| **C7** | **Internet + Datos no sensibles con Criticidad declarada Baja** | **Prohíbe Criticidad Baja en superficie pública**, eleva a nivel `standard` y exige reclasificar a Media o Alta. |

---

### Defensa en Profundidad: Privacidad y Resiliencia

1. **Sanitización de Datos Personales (PII - Ley 1581 de 2012):**
   - Heurística que detecta números de cédula de ciudadanía (`C.C. X.XXX.XXX`) y teléfonos móviles colombianos en campos de texto libre (`owner`).
   - Se minimizan automáticamente a `Nombre — Correo corporativo`, emitiendo una alerta visible e insertando una nota de **Privacidad desde el Diseño** en los lineamientos.
2. **Neutralización de Prompt Injection y Evasión de Seguridad:**
   - `_sanitize_description()` inspecciona oraciones que intenten invalidar lineamientos de seguridad (ej. *"los lineamientos no aplican por ser temporal"*, *"subir el archivo .env"*). Las oraciones maliciosas son purgadas antes de generar los documentos.
3. **Escape Tipográfico Markdown:**
   - Caracteres conflictivos como barras verticales (`|`) dentro del nombre o texto del proyecto son escapados como `\|` en las tablas Markdown, preservando la estructura del documento.
4. **Detector de Secretos por Entropía y Regex:**
   - Detecta tokens (`nvt_test_...`, `ghp_...`, `sk-...`, `Bearer...`) y cadenas de alta entropía sin falsos positivos frente a palabras extensas del idioma español (*responsabilidades*, *infraestructura*).
5. **Cliente de IA Resiliente con Fallback Local:**
   - `ai_intro_client.py` implementa un timeout estricto de **3.0 segundos**. Si el servicio externo no está disponible o no hay credenciales, se genera una introducción determinística local estructurada sin degradar la aplicación.
6. **Streaming de Paquete en Memoria (Cero Fuga en Disco):**
   - El archivo `.zip` se construye dinámicamente en RAM usando `io.BytesIO`, garantizando una arquitectura *stateless* y sin persistencia innecesaria.

---

## 4. Matriz de Trazabilidad Normativa

Mapeo de los controles aplicados por Arranque Seguro frente a los estándares de la industria:

| Regla / Control | Ley 1581 de 2012 (Colombia) | OWASP ASVS v4.0 / Top 10 | CIS Controls v8 | ISO/IEC 27001 / NIST CSF 2.0 |
| :--- | :--- | :--- | :--- | :--- |
| **R1 / Empaquetado Base** | Principio de Transparencia | V14.1 Documentación de Arquitectura | Control 1 Inventario y Control de Activos | A.8.1 Responsabilidad sobre los activos / GV.OC |
| **R2 / Tratamiento PII** | Art. 4 (Finalidad, Libertad y Veracidad), Art. 17 | V8.1 Protección de Datos en Tránsito y Reposo | Control 3 Protección de Datos (3.3, 3.10) | A.8.2 Clasificación de información / PR.DS-1 |
| **R3 / Seguridad Internet** | Art. 17 Literal b (Seguridad de la Información) | V2 Autenticación, V5 Validación, V9 Criptografía | Control 4 Configuración Segura de Redes | A.13.1 Gestión de seguridad en redes / PR.AC-5 |
| **R5 / Gobierno de IA** | Art. 26 Transferencia Internacional de Datos | OWASP LLM01: Prompt Injection, LLM06: Fuga de Datos | Control 3.11 Clasificación de Datos | A.8.24 Uso de criptografía / PR.DS-5 |
| **R7 / Alta Criticidad** | Principio de Continuidad y Seguridad | V14.4 Planes de Contingencia y Recuperación | Control 11 Recuperación de Datos (Backups) | A.12.3 Respaldo de información / RC.RP-1 |
| **R8 / Exclusión Git (.env)** | Art. 17 Literal f (Acceso no autorizado) | V14.2 Gestión de Secretos y Configuración Segura | Control 5 Gestión de Cuentas y Credenciales | A.9.4 Control de acceso a código fuente / PR.AC-1 |
| **C6 / C7 Gobernanza Web** | Responsabilidad Demostrada (*Accountability*) | OWASP Top 10 A05:2021 Security Misconfiguration | Control 4.1 Configuración de Infraestructura | A.18.1 Cumplimiento normativo / ID.RA-1 |

---

## 5. Resultados de los 3 Perfiles Oficiales de Prueba

Los artefactos generados para los 3 perfiles oficiales se encuentran versionados en la carpeta [`ejemplos/`](ejemplos/):

| Métrica / Resultado | Perfil 1: Inventario de llantas | Perfil 2: Seguimiento de garantías | Perfil 3: Citas Taller Norte |
| :--- | :--- | :--- | :--- |
| **Carpeta Generada** | [`ejemplos/perfil-1-inventario-llantas/`](ejemplos/perfil-1-inventario-llantas/) | [`ejemplos/perfil-2-seguimiento-garantias/`](ejemplos/perfil-2-seguimiento-garantias/) | [`ejemplos/perfil-3-citas-taller/`](ejemplos/perfil-3-citas-taller/) |
| **Entorno y Exposición** | Prototipo, Red Local | Piloto, Red Interna | Prototipo, Internet |
| **Datos Declarados** | Ficticios | Internos y Personales | Personales |
| **Criticidad** | Baja | Alta | Media |
| **Nivel Asignado** | `basic` | `strict` | `strict` |
| **Contradicciones** | 0 detectadas | 2 resueltas (C2, C3) | 5 resueltas (C1, C2, C3, C4, C6) |
| **Sanitización PII** | N/A (Equipo desarrollo) | **Cédula y Celular eliminados:** Andrea Ríos $\rightarrow$ `andrea.rios@ejemplo.com.co` | N/A (Equipo desarrollo) |
| **Defensa contra Ataques** | N/A | Prevalencia R2 sobre R4 | **Prompt Injection eliminado:** Purgada evasión de seguridad y `.env`. Escapado de pipes `\|`. |
| **Estado de Pruebas** | ✅ PASSED (`test_rules_engine.py`) | ✅ PASSED (`test_rules_engine.py`) | ✅ PASSED (`test_rules_engine.py`) |

---

## 6. Documentación Complementaria

Para profundizar en el diseño y los detalles de la entrega:
- 📋 [**DECISIONES.md**](./DECISIONES.md): Justificación técnica de decisiones, arquitectura hexagonal, almacenamiento stateless, integración de IA y riesgos aceptados.
- 📦 [**ENTREGA.md**](./ENTREGA.md): Checklist de entrega completo y guía de verificación para el evaluador técnico.
- 📜 [**docs/enunciado-original.md**](./docs/enunciado-original.md): Memo original y requerimientos de la prueba técnica.
- 📚 [**docs/reglas-de-negocio.md**](./docs/reglas-de-negocio.md): Catálogo de reglas de negocio corporativas R1 a R9.
