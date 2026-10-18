# Lineamientos de Arquitectura y Seguridad: Citas Taller **Norte** | v2

## 1. Introducción y Alcance
Este documento establece los lineamientos de arquitectura y seguridad para el proyecto **Citas Taller **Norte** | v2**, formulado por el área de **Taller**. Actualmente en etapa de **Prototype**, el proyecto tiene como propósito: Permitir que los clientes agenden citas de mantenimiento desde la web y reciban un recordatorio. Bajo las reglas de arranque seguro de Navitrans, este proyecto opera bajo un nivel de exigencia **STRICT**, requiriendo la observancia estricta de los controles definidos a continuación.

> **Propósito declarado:** Permitir que los clientes agenden citas de mantenimiento desde la web y reciban un recordatorio.  
> **Nivel de exigencia:** `STRICT`  
> **Fuente de introducción:** `local_fallback`  

---

## 2. Lineamientos Base de Arquitectura (R1)
> **Procedencia:** Estándares de Arquitectura Navitrans & Principios SOLID / Clean Code.

- **Estructura modular:** Separar responsabilidades en capas claras (Dominio, Servicios, API/Presentación). La lógica de negocio no debe acoplarse al framework web ni a la base de datos.
- **Configuración desacoplada (Twelve-Factor App):** Toda variable configurable, URL de dependencias y puertos debe gestionarse mediante variables de entorno (`.env`), nunca hardcodeada.
- **Documentación de contratos:** Exponer endpoints REST con especificación OpenAPI / Swagger estandarizada.

---
## 3. Tratamiento de Datos Personales (R2)
> **Procedencia:** Ley Estatutaria 1581 de 2012 de Colombia & Política Corporativa de Protección de Datos de Navitrans.

1. **Finalidad explícita:** Los datos personales capturados se utilizarán exclusivamente para los fines operativos descritos en este proyecto.
2. **Minimización de datos (Privacidad desde el Diseño):** Solo se solicitarán y almacenarán los campos estrictamente necesarios para la operación. Queda prohibido solicitar o almacenar cédulas o teléfonos en logs o campos no esenciales.
3. **Control de acceso y confidencialidad:** El acceso a bases de datos con información personal estará restringido únicamente al personal autorizado del área responsable.
4. **Conservación y retención temporal:** Definir un ciclo de vida para los datos; una vez finalizada la vigencia operativa, se deben anonimizar o eliminar de forma segura.

---
## 4. Controles de Seguridad Perimetral y Exposición a Internet (R3)
> **Procedencia:** OWASP Top 10 (2021) & OWASP Application Security Verification Standard (ASVS v4.0).

- **Permisos verificados en el servidor:** Toda validación de roles y permisos debe ejecutarse en el backend. Las comprobaciones en el cliente web son únicamente para UX y nunca sustituyen la autorización en el servidor.
- **Cifrado en tránsito (HTTPS / TLS 1.3):** Todo tráfico externo debe exigir conexiones cifradas con certificados válidos.
- **Validación estricta de entradas:** Emplear esquemas de validación fuertemente tipados (e.g. Pydantic o Zod) para rechazar payloads maliciosos, inyecciones SQL o Cross-Site Scripting (XSS).
- **Manejo seguro de errores:** Los mensajes de error devueltos al cliente no deben exponer trazas de la aplicación (stack traces), rutas del sistema operativo ni versiones internas de librerías.
- **Cero secretos en el código:** Ningún token, contraseña, cadena de conexión o API Key puede existir en el código fuente.

---
## 6. Disponibilidad, Respaldo y Continuidad del Negocio (R7)
> **Procedencia:** ISO/IEC 27001 (Control A.12.3 Respaldo) & NIST CSF (Controles de Recuperación).

- **Tiempo Máximo de Recuperación (RTO):** Definir el RTO admisible (máximo 4 horas en entorno productivo/piloto).
- **Pérdida de Datos Tolerable (RPO):** Establecer el RPO admisible (máximo 1 hora de información).
- **Plan de respaldo automatizado:** Se requiere un procedimiento comprobado de copia de seguridad periódica antes de migrar el prototipo a fase de piloto.
- **Autenticación obligatoria:** Prohibido el funcionamiento sin inicio de sesión en aplicaciones de criticidad alta.

---
## 7. Lineamientos de Integraciones Externas (R9)
> **Procedencia:** Arquitectura de Integraciones Navitrans y R9 (solo secciones aplicables).

### 7.2. Integración de Correo Electrónico
> **Procedencia:** Estándares de Mensajería Transaccional Navitrans.

- **Servicio transaccional seguro:** Enviar correos únicamente mediante el servidor SMTP o API autorizada usando autenticación TLS.
- **Plantillas sanitizadas:** Sanitizar variables dinámicas para prevenir inyección de encabezados de correo (Email Header Injection).
- **No enviar contraseñas:** Nunca enviar credenciales en texto plano por correo electrónico.

### 7.1. Integración con Servicios de Inteligencia Artificial (R5)
> **Procedencia:** Buenas Prácticas OWASP Top 10 for LLM Applications & R5 Seguridad de la Información.

- **Gestión de claves en backend:** La llave del servicio de IA debe residir única y exclusivamente en el servidor y leerse desde variables de entorno. Jamás enviarla al navegador.
- **Prohibición de fuga de PII:** Está estrictamente prohibido enviar datos personales, cédulas, teléfonos o información financiera sin anonimizar a servicios externos de IA.
- **Resiliencia y degradación elegante:** La integración debe implementar timeout estricto y fallback ante desconexión o indisponibilidad del modelo.

## 8. Checklist de Validación para Despliegue
- [ ] Nombre del proyecto y propósito (Citas Taller **Norte** | v2) validados.
- [ ] Variables de entorno configuradas sin secretos en Git.
- [ ] Reglas del `.gitignore` instaladas en la raíz del repositorio.
- [ ] Nivel `STRICT` verificado por el líder técnico.
