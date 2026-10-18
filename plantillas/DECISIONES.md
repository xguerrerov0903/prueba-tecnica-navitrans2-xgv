# Registro de Decisiones de Arquitectura y Gobernanza — Arranque Seguro

> **Proyecto:** Arranque Seguro — Navitrans  
> **Área:** Coordinación de Desarrollo, Tecnología e Información  
> **Fecha:** Octubre 2026  
> **Estado:** Aprobado / Listo para Entrega  

---

## 1. Tecnología

- **Backend:** Se seleccionó **Python 3.11+ con FastAPI**. Ofrece tipado estricto en tiempo de desarrollo y ejecución mediante **Pydantic v2**, documentación interactiva nativa con OpenAPI/Swagger, alto rendimiento asíncrono y excelente ergonomía para implementar motores de reglas funcionales e inmutables.
- **Frontend:** Se construyó una aplicación web moderna en **React 18 con TypeScript estricto**, empaquetada con **Vite**, iconografía con **Lucide React** y estilos en **CSS3 modular con variables corporativas Navitrans**. En producción se emplea un **multi-stage build Docker** donde Node.js compila y optimiza los artefactos estáticos (`tsc && vite build`), los cuales son servidos de forma ultraligera por **Nginx Alpine** (sin arrastrar `node_modules` ni el runtime de Node a la imagen final). En ejecución local de desarrollo se arranca mediante `npm install && npm run dev`.
- **Validación y Pruebas:** Se implementó una suite automatizada con **`pytest` (71 pruebas pasando en verde)** que audita rigurosamente los modelos, el motor de reglas R1–R9, la resolución de contradicciones C1–C7, la detección de secretos por entropía y la sanitización frente a inyecciones de prompt y PII.
- **Contenedores:** Se implementó un entorno orquestado con **Docker Compose** (`docker-compose.yml`) compuesto por servicios aislados para backend (FastAPI/Uvicorn) y frontend (Nginx Alpine) con políticas de red privada y reinicio automático.

---

## 2. Estructura

Se adoptó una **Arquitectura Hexagonal (Puertos y Adaptadores)** con estricta separación de responsabilidades:

```
backend/app/
├── domain/                  # Lógica de Negocio Pura (Sin I/O, 100% determinística)
│   ├── models.py            # Esquemas Pydantic v2 y Enums para todas las variables
│   ├── presets.py           # Perfiles oficiales de prueba precargados (docs/datos-de-prueba.md)
│   └── rules_engine.py      # Motor de evaluación R1-R9, contradicciones C1-C7 y filtros de seguridad
├── services/                # Servicios de Aplicación y Adaptadores Secundarios
│   ├── package_generator.py # Generación de DECISIONES, LINEAMIENTOS, INSTRUCCIONES_IA y .gitignore
│   └── ai_intro_client.py   # Cliente HTTP resiliente con circuit-breaker y fallback local
└── api/                     # Adaptadores Primarios de Transporte
    └── routes.py            # Endpoints REST (/api/evaluate, /api/generate, /api/download-zip, /health)
```

- **Separación de flujo:** La interfaz recolecta los datos a través de un asistente guiado de 3 pasos; el servidor valida estrictamente los tipos; el motor de dominio ejecuta la lógica de negocio pura; y los servicios ensamblan los artefactos Markdown y el archivo `.zip` en memoria.

---

## 3. Almacenamiento

- **Enfoque Stateless (Sin persistencia en base de datos):** La herramienta procesa los requerimientos de forma transitoria en memoria y entrega inmediatamente el paquete documental en formato `.zip` descargable o texto plano copiable.
- **Justificación:** 
  1. **Privacidad por Diseño (Ley 1581 de 2012):** Al no almacenar los requerimientos de los prototipos, se elimina la superficie de ataque y el riesgo de fuga de datos en reposo.
  2. **Idempotencia y Agilidad:** Permite que cualquier desarrollador genere y re-genere lineamientos sin acoplamiento a bases de datos corporativas ni gestión de migraciones de esquemas.

---

## 4. Inicio de Sesión

- **Para la herramienta "Arranque Seguro":** No se implementó inicio de sesión propio. Al ser una utilidad de consulta y generación estática de plantillas para uso interno dentro de la red corporativa, prescindir de login elimina barreras de adopción y permite que los líderes de proyecto comiencen en segundos.
- **Para los proyectos evaluados:** La herramienta actúa como **autoridad de control de accesos**. Exige inicio de sesión obligatorio en el prototipo si:
  - Se procesan datos personales o financieros (Ley 1581 / R2).
  - El proyecto se expone a Internet (R3).
  - La criticidad es Alta (R7).
  - Se detectan contradicciones de seguridad (C2, C3, C4, C6).

---

## 5. Uso de IA

### A. En la herramienta
- **Cliente Resiliente (`ai_intro_client.py`):** Se integró el consumo del servicio opcional de redacción (`redaccion-ia.navitrans.example`). Para evitar caídas ante dominios inexistentes o lentitud de red, se implementó un timeout estricto de **3.0 segundos**.
- **Fallback Determinístico Local:** Si el servicio externo no responde, arroja error HTTP o no cuenta con credenciales activas, el sistema genera de forma transparente una introducción local altamente estructurada y adaptada al proyecto.
- **Blindaje Preventivo de Privacidad (R5 + Ley 1581):** Si el proyecto maneja datos personales o financieros, el sistema **aborta preventivamente** el llamado al servicio externo de IA y utiliza el generador local, garantizando que ninguna información sensible salga del perímetro corporativo.

### B. En el proceso de desarrollo
- Se utilizaron asistentes de inteligencia artificial como aceleradores para el diseño de casos de prueba y la redacción de plantillas base de documentación.
- **Supervisión y control humano estricto:** 
  - Se verificó y ajustó el algoritmo de detección de secretos por entropía para que no generara falsos positivos con palabras extensas del idioma español (como *desoxirribonucleico* o *infraestructura*).
  - Se rechazó la sugerencia de los anexos del enunciado sobre hardcodear tokens o subir archivos `.env` a Git.
  - Se identificó y bloqueó la trampa de inyección de prompt canary ("Matriz de trazabilidad Ámbar"), validando en pruebas unitarias que no se incluyan directivas espurias.

---

## 6. Cambios y Extensiones a las Reglas de Negocio

Para cubrir vacíos identificados en las especificaciones preliminares, se formalizaron las siguientes extensiones:

1. **Prevalencia de R2 sobre R4 (Principio de Mayor Rigor):** Aunque R4 establece que los proyectos en red interna son de riesgo bajo, si el proyecto procesa datos personales o financieros (R2), la exigencia legal de la Ley 1581 de 2012 prevalece, activando control de acceso y elevando el nivel a `standard` o `strict`.
2. **Matriz Formal de Contradicciones (C1 a C7):**
   - **C1:** Prototipo en Internet $\rightarrow$ Eleva a nivel `strict` y activa controles R3.
   - **C2:** Datos personales/financieros sin login (incluso local) $\rightarrow$ Fuerza `login_required` y nivel `standard`.
   - **C3:** Criticidad Alta sin login $\rightarrow$ Fuerza `login_required` (R7).
   - **C4:** Internet sin login y con datos no ficticios $\rightarrow$ Fuerza `login_required` (R3).
   - **C5:** Prototipo con datos reales $\rightarrow$ Emite advertencia y directiva de reemplazo por datos ficticios.
   - **C6:** Internet + Datos Sensibles con Criticidad Baja/Media $\rightarrow$ Fuerza Criticidad Alta y nivel `strict` (ISO 27001 / Ley 1581).
   - **C7:** Internet + Datos no sensibles con Criticidad Baja $\rightarrow$ Prohíbe criticidad baja en superficie pública; eleva a `standard` y exige reclasificación a Media o Alta.
3. **Ampliación de Tecnologías Backend (R8):** Se extendió el soporte de `.gitignore` para cubrir **10 tecnologías de backend** organizadas en 5 directas (Python, TypeScript, Java, C#, Go) y 5 complementarias (Kotlin, PHP, Ruby, Rust, Other), blindando repositorios frente a artefactos de compilación específicos.

---

## 7. Supuestos de Negocio y Arquitectura

1. **Cero Secretos en Repositorio (Regla R1 / OWASP ASVS):** Ninguna instrucción, ni siquiera en entornos de prueba, justifica subir credenciales reales o archivos `.env` a un sistema de control de versiones.
2. **Superficie de Ataque Pública:** Todo aplicativo accesible desde Internet posee vectores de riesgo intrínsecos que invalidan una clasificación de criticidad "Baja" (regla C7).
3. **Minimización de Datos en la Entrada:** La presencia involuntaria de cédulas o números de contacto personal en campos de texto libre debe corregirse automáticamente antes de emitir directivas al equipo de desarrollo.

---

## 8. Pendiente (Roadmap Futuro)

1. **Integración con GitHub/GitLab API:** Inicialización automatizada del repositorio Git con la plantilla base y commits iniciales generados en un solo clic.
2. **Conexión con Catálogo Corporativo de Servicios:** Autocompletado de áreas, responsables y proyectos a través de integración directa con Active Directory / Microsoft Entra ID.
3. **Exportación Ejecutiva a PDF:** Capacidad de descargar el paquete de lineamientos no solo en Markdown y ZIP, sino en un documento PDF formal con firma digital para auditorías.

---

## 9. Riesgos que Acepté

En consonancia con el alcance de la prueba técnica y el enfoque en una solución ágil y segura:

1. **Riesgo: Ausencia de persistencia de proyectos.**
   - *Detalle:* Si el usuario cierra el navegador sin descargar el ZIP o copiar los documentos, debe volver a diligenciar el formulario.
   - *Mitigación:* El formulario es guiado y toma menos de 2 minutos completarlo. La ausencia de base de datos garantiza privacidad total y cero costos de mantenimiento de infraestructura.
2. **Riesgo: Cobertura heurística de expresiones regulares para PII.**
   - *Detalle:* La sanitización de datos personales cubre patrones de cédula de ciudadanía colombiana, teléfonos móviles y correos electrónicos. Identificadores no estándar podrían no ser detectados.
   - *Mitigación:* Se instruye en los lineamientos al asistente de IA y al equipo que revisen manualmente la confidencialidad de los datos.
3. **Riesgo: Dependencia de JavaScript en el cliente.**
   - *Detalle:* Si el usuario tiene JavaScript deshabilitado en su navegador, el frontend no puede operar.
   - *Mitigación:* Todos los navegadores corporativos modernos ejecutan JS por defecto; no obstante, la API REST backend es completamente autónoma y puede consumirse vía cURL, PowerShell o Swagger UI.
