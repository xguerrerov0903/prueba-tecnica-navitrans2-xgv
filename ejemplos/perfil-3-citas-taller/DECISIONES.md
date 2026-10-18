# Decisiones del Proyecto: Citas Taller **Norte** | v2

> Este documento registra las decisiones tomadas durante la fase de arranque y la evaluación automática de reglas de seguridad y arquitectura.

## Propósito del Proyecto
Permitir que los clientes agenden citas de mantenimiento desde la web y reciban un recordatorio.

---

## Ficha Técnica de Decisiones

| Parámetro | Decisión Registrada |
| :--- | :--- |
| **Nombre del proyecto** | Citas Taller **Norte** \| v2 |
| **Responsable** | Equipo de desarrollo |
| **Área solicitante** | Taller |
| **Etapa** | Prototipo |
| **Audiencia** | External clients |
| **Tipo de datos** | Personales |
| **Exposición** | Internet |
| **Inicio de sesión** | Sin inicio de sesión |
| **Integraciones** | Correo y Servicio de IA |
| **Tecnología backend** | TypeScript / Node.js |
| **Criticidad** | Media |

---

## Evaluación de Reglas de Negocio (R1 - R9)

- **Nivel de seguridad efectivo asignado:** **Estricto (Strict)**
- **Controles obligatorios activados:** 18 controles requeridos.

### Trazabilidad de Reglas Aplicadas:
- **R1 (Paquete base)** ✅: Siempre activo: todo proyecto recibe el paquete base de documentos.
- **R2 (Tratamiento de datos personales)** ✅: El proyecto declara datos personales o financieros (Ley 1581 de 2012).
- **R3 (Controles mínimos para Internet)** ✅: El proyecto se expone a Internet (Seguridad de la información).
- **R4 (Red interna – riesgo bajo)** ⚪: El proyecto no está restringido a la red interna.
- **R5 (Integración con servicio de IA)** ✅: El proyecto integra un servicio de IA (Seguridad de la información).
- **R6 (Nombre y descripción en todos los documentos)** ✅: Siempre activo: nombre y descripción se propagan a todos los documentos del paquete.
- **R7 (Criticidad alta)** ⚪: Criticidad declarada es 'medium', no 'high'.
- **R8 (Reglas .gitignore para asistente de IA)** ✅: Siempre activo: el paquete incluye .gitignore con exclusiones de secretos y configs personales.
- **R9 (Solo secciones relevantes)** ✅: Se generarán secciones solo para: email, ai_service.


## Contradicciones Detectadas y Resueltas

### 1. Conflicto en campos: `stage`, `exposure`
- **Motivo:** Un prototipo no debería estar expuesto a Internet sin controles de producción.
- **Resolución aplicada:** Se eleva el nivel de exigencia a 'strict' y se activan todos los controles de R3.

### 2. Conflicto en campos: `data_types`, `login`
- **Motivo:** El proyecto maneja datos personales o financieros sin inicio de sesión. Por mandato de la Ley 1581 de 2012 y directivas de seguridad corporativa, ningún entorno que procese datos sensibles puede operar sin autenticación y control de acceso, incluso si se encuentra en red local o en etapa de prototipo.
- **Resolución aplicada:** Se fuerza inicio de sesión (login_required) y control de acceso como controles obligatorios. El nivel mínimo de seguridad se eleva a 'standard'.

### 3. Conflicto en campos: `exposure`, `login`
- **Motivo:** Proyecto expuesto a Internet sin inicio de sesión manejando datos no ficticios (R3).
- **Resolución aplicada:** Se agrega inicio de sesión como control obligatorio.

### 4. Conflicto en campos: `stage`, `data_types`
- **Motivo:** Un prototipo debería usar datos ficticios, no personales o financieros.
- **Resolución aplicada:** Se emite advertencia; el desarrollador debe reemplazar datos reales por ficticios.

### 5. Conflicto en campos: `exposure`, `data_types`, `criticality`
- **Motivo:** El sistema procesa datos personales o financieros y está expuesto a Internet, pero la criticidad declarada es 'medium'. Según ISO 27001 y la Ley 1581 de 2012, esta combinación exige clasificación obligatoria como Criticidad Alta.
- **Resolución aplicada:** Se eleva automáticamente la criticidad efectiva a 'high' y el nivel de seguridad a 'strict'. Se activan todos los controles de R3 y R7 (RTO/RPO, respaldo, login).

