# Decisiones del Proyecto: Seguimiento de garantías

> Este documento registra las decisiones tomadas durante la fase de arranque y la evaluación automática de reglas de seguridad y arquitectura.

## Propósito del Proyecto
Registrar reclamaciones de garantía de equipos vendidos, asignarlas a un técnico y avisar al cliente por correo cuando cambie el estado.

---

## Ficha Técnica de Decisiones

| Parámetro | Decisión Registrada |
| :--- | :--- |
| **Nombre del proyecto** | Seguimiento de garantías |
| **Responsable** | Andrea Ríos Restrepo — andrea.rios@ejemplo.com.co |
| **Área solicitante** | Taller |
| **Etapa** | Piloto |
| **Audiencia** | Multiple areas |
| **Tipo de datos** | Internos y Personales |
| **Exposición** | Red interna |
| **Inicio de sesión** | Sin inicio de sesión |
| **Integraciones** | ERP y Correo |
| **Tecnología backend** | TypeScript / Node.js |
| **Criticidad** | Alta |

> [!NOTE]
> **Privacidad desde el Diseño (Ley 1581 de 2012):**
> Los datos personales de contacto directo (cédula y/o celular) suministrados en el formulario fueron eliminados y anonimizados en este documento para cumplir con el principio de minimización de datos.

---

## Evaluación de Reglas de Negocio (R1 - R9)

- **Nivel de seguridad efectivo asignado:** **Estricto (Strict)**
- **Controles obligatorios activados:** 11 controles requeridos.

### Trazabilidad de Reglas Aplicadas:
- **R1 (Paquete base)** ✅: Siempre activo: todo proyecto recibe el paquete base de documentos.
- **R2 (Tratamiento de datos personales)** ✅: El proyecto declara datos personales o financieros (Ley 1581 de 2012).
- **R3 (Controles mínimos para Internet)** ⚪: El proyecto no se expone a Internet.
- **R4 (Red interna – riesgo bajo)** ✅: Aplica R4 (red interna), pero R2 eleva el nivel a 'standard' por datos personales/financieros. Se requiere control de acceso.
- **R5 (Integración con servicio de IA)** ⚪: No se declaró integración con servicio de IA.
- **R6 (Nombre y descripción en todos los documentos)** ✅: Siempre activo: nombre y descripción se propagan a todos los documentos del paquete.
- **R7 (Criticidad alta)** ✅: Criticidad alta: exige RTO/RPO, respaldo y login obligatorio (Área de desarrollo).
- **R8 (Reglas .gitignore para asistente de IA)** ✅: Siempre activo: el paquete incluye .gitignore con exclusiones de secretos y configs personales.
- **R9 (Solo secciones relevantes)** ✅: Se generarán secciones solo para: erp, email.


## Contradicciones Detectadas y Resueltas

### 1. Conflicto en campos: `data_types`, `login`
- **Motivo:** El proyecto maneja datos personales o financieros sin inicio de sesión. Por mandato de la Ley 1581 de 2012 y directivas de seguridad corporativa, ningún entorno que procese datos sensibles puede operar sin autenticación y control de acceso, incluso si se encuentra en red local o en etapa de prototipo.
- **Resolución aplicada:** Se fuerza inicio de sesión (login_required) y control de acceso como controles obligatorios. El nivel mínimo de seguridad se eleva a 'standard'.

### 2. Conflicto en campos: `criticality`, `login`
- **Motivo:** Un proyecto de criticidad alta no puede operar sin inicio de sesión (R7).
- **Resolución aplicada:** Se fuerza inicio de sesión como control obligatorio.

