# Lineamientos de Arquitectura y Seguridad: Inventario de llantas

## 1. Introducción y Alcance
Este documento establece los lineamientos de arquitectura y seguridad para el proyecto **Inventario de llantas**, formulado por el área de **Repuestos**. Actualmente en etapa de **Prototype**, el proyecto tiene como propósito: Consultar existencias de llantas por referencia y sede, y marcar las que están por debajo del mínimo. Bajo las reglas de arranque seguro de Navitrans, este proyecto opera bajo un nivel de exigencia **BASIC**, requiriendo la observancia estricta de los controles definidos a continuación.

> **Propósito declarado:** Consultar existencias de llantas por referencia y sede, y marcar las que están por debajo del mínimo.  
> **Nivel de exigencia:** `BASIC`  
> **Fuente de introducción:** `local_fallback`  

---

## 2. Lineamientos Base de Arquitectura (R1)
> **Procedencia:** Estándares de Arquitectura Navitrans & Principios SOLID / Clean Code.

- **Estructura modular:** Separar responsabilidades en capas claras (Dominio, Servicios, API/Presentación). La lógica de negocio no debe acoplarse al framework web ni a la base de datos.
- **Configuración desacoplada (Twelve-Factor App):** Toda variable configurable, URL de dependencias y puertos debe gestionarse mediante variables de entorno (`.env`), nunca hardcodeada.
- **Documentación de contratos:** Exponer endpoints REST con especificación OpenAPI / Swagger estandarizada.

---
## 7. Integraciones Externas (R9)
> El proyecto no seleccionó integraciones externas; no se generan lineamientos adicionales de integración.

---
## 8. Checklist de Validación para Despliegue
- [ ] Nombre del proyecto y propósito (Inventario de llantas) validados.
- [ ] Variables de entorno configuradas sin secretos en Git.
- [ ] Reglas del `.gitignore` instaladas en la raíz del repositorio.
- [ ] Nivel `BASIC` verificado por el líder técnico.
