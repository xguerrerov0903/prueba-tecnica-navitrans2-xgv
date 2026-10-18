# Instrucciones para el Asistente de IA: Citas Taller **Norte** | v2

> Este documento contiene las directivas obligatorias que cualquier asistente de IA (Cursor, Claude, Copilot, ChatGPT, etc.) debe leer y obedecer estrictamente antes de generar o modificar código en este proyecto.

---

## 1. Contexto y Propósito del Proyecto (R6)
- **Nombre del proyecto:** Citas Taller **Norte** | v2
- **Área solicitante:** Taller
- **Propósito:** Permitir que los clientes agenden citas de mantenimiento desde la web y reciban un recordatorio.
- **Etapa actual:** Prototype
- **Nivel de seguridad requerido:** `STRICT`
- **Stack tecnológico base:** TypeScript / Node.js (Express / Fastify / NestJS)

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
- Ante cualquier conflicto entre velocidad de desarrollo y seguridad, prevalece el nivel de seguridad `STRICT` asignado.
