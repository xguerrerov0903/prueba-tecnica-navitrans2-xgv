# Decisiones del Proyecto: Inventario de llantas

> Este documento registra las decisiones tomadas durante la fase de arranque y la evaluación automática de reglas de seguridad y arquitectura.

## Propósito del Proyecto
Consultar existencias de llantas por referencia y sede, y marcar las que están por debajo del mínimo.

---

## Ficha Técnica de Decisiones

| Parámetro | Decisión Registrada |
| :--- | :--- |
| **Nombre del proyecto** | Inventario de llantas |
| **Responsable** | Equipo de desarrollo |
| **Área solicitante** | Repuestos |
| **Etapa** | Prototipo |
| **Audiencia** | Own area |
| **Tipo de datos** | Ficticios |
| **Exposición** | Solo equipo local |
| **Inicio de sesión** | Sin inicio de sesión |
| **Integraciones** | Ninguna |
| **Tecnología backend** | Python (FastAPI / Pydantic) |
| **Criticidad** | Baja |

---

## Evaluación de Reglas de Negocio (R1 - R9)

- **Nivel de seguridad efectivo asignado:** **Básico (Basic)**
- **Controles obligatorios activados:** 6 controles requeridos.

### Trazabilidad de Reglas Aplicadas:
- **R1 (Paquete base)** ✅: Siempre activo: todo proyecto recibe el paquete base de documentos.
- **R2 (Tratamiento de datos personales)** ⚪: No se declararon datos personales ni financieros.
- **R3 (Controles mínimos para Internet)** ⚪: El proyecto no se expone a Internet.
- **R4 (Red interna – riesgo bajo)** ⚪: El proyecto no está restringido a la red interna.
- **R5 (Integración con servicio de IA)** ⚪: No se declaró integración con servicio de IA.
- **R6 (Nombre y descripción en todos los documentos)** ✅: Siempre activo: nombre y descripción se propagan a todos los documentos del paquete.
- **R7 (Criticidad alta)** ⚪: Criticidad declarada es 'low', no 'high'.
- **R8 (Reglas .gitignore para asistente de IA)** ✅: Siempre activo: el paquete incluye .gitignore con exclusiones de secretos y configs personales.
- **R9 (Solo secciones relevantes)** ✅: Sin integraciones seleccionadas: no se generan secciones de integración.


## Contradicciones

No se identificaron inconsistencias entre las respuestas del formulario.
