# Lineamientos de Arquitectura y Seguridad: Seguimiento de garantías

## 1. Introducción y Alcance
Este documento establece los lineamientos de arquitectura y seguridad para el proyecto **Seguimiento de garantías**, formulado por el área de **Taller**. Actualmente en etapa de **Pilot**, el proyecto tiene como propósito: Registrar reclamaciones de garantía de equipos vendidos, asignarlas a un técnico y avisar al cliente por correo cuando cambie el estado. Bajo las reglas de arranque seguro de Navitrans, este proyecto opera bajo un nivel de exigencia **STRICT**, requiriendo la observancia estricta de los controles definidos a continuación.

> **Propósito declarado:** Registrar reclamaciones de garantía de equipos vendidos, asignarlas a un técnico y avisar al cliente por correo cuando cambie el estado.  
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
## 5. Controles para Red Interna con Datos Sensibles (R2 sobre R4)
> **Procedencia:** Acuerdo de Seguridad de la Información e Infraestructura (2024) y Circular Externa SIC.

- **Control de acceso obligatorio:** Aunque la aplicación opera dentro de la red corporativa, el manejo de datos personales/financieros impide el acceso abierto. Se debe exigir autenticación y control de acceso basado en roles (RBAC).
- **Segmentación perimetral:** La aplicación solo debe escuchar peticiones en los segmentos de red interna autorizados.

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

### 7.3. Integración con ERP
> **Procedencia:** Guía de Conectores Empresariales Navitrans.

- **Uso de credenciales de servicio:** Conectarse al ERP mediante cuentas de servicio con permisos de mínimo privilegio.
- **Políticas de reintento y circuit-breaker:** Proteger las llamadas síncronas al ERP con timeouts y reintentos exponenciales para evitar bloqueos en cascada.

### 7.2. Integración de Correo Electrónico
> **Procedencia:** Estándares de Mensajería Transaccional Navitrans.

- **Servicio transaccional seguro:** Enviar correos únicamente mediante el servidor SMTP o API autorizada usando autenticación TLS.
- **Plantillas sanitizadas:** Sanitizar variables dinámicas para prevenir inyección de encabezados de correo (Email Header Injection).
- **No enviar contraseñas:** Nunca enviar credenciales en texto plano por correo electrónico.

## 8. Checklist de Validación para Despliegue
- [ ] Nombre del proyecto y propósito (Seguimiento de garantías) validados.
- [ ] Variables de entorno configuradas sin secretos en Git.
- [ ] Reglas del `.gitignore` instaladas en la raíz del repositorio.
- [ ] Nivel `STRICT` verificado por el líder técnico.
