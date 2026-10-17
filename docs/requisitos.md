# Requisitos de Arranque Seguro

## Obligatorio

### 1. Página de presentación

La herramienta se va a presentar ante un comité que decide si el área la adopta. Necesita una página de entrada que la presente por sí sola, sin que tengas que explicarla:

- Qué problema resuelve y para quién.
- Cómo funciona, de las respuestas al paquete de documentos.
- Qué módulos tiene y qué genera, con un ejemplo de lo que entrega.
- De dónde salen los lineamientos.
- Acceso directo al formulario.

Debe ser parte de la misma aplicación. El diseño cuenta: es lo primero que verá el comité.

### 2. Formulario guiado

- Al menos **3 pasos**, con indicador de progreso.
- Al menos **8 decisiones** sobre el prototipo. Te sugerimos estas, pero puedes ajustar la lista si lo justificas:

| Decisión | Opciones sugeridas |
| --- | --- |
| Nombre del proyecto | Texto corto |
| Qué problema resuelve | Texto, unas pocas líneas |
| Responsable | Texto |
| Área solicitante | Taller, Repuestos, Comercial, Flota, Financiera, Talento Humano |
| Etapa | Prototipo, piloto, producción |
| Audiencia | Mi área, varias áreas, clientes externos |
| Tipo de datos (varias) | Ficticios, internos, personales, financieros |
| Exposición | Solo equipo local, red interna, Internet |
| Inicio de sesión | Sin inicio de sesión, cuentas propias, Microsoft Entra ID |
| Integraciones (varias) | ERP, correo, almacenamiento de archivos, servicio de IA |
| Tecnología del backend | Python, TypeScript, otra |
| Criticidad | Baja, media, alta |

- Prefiere opciones seleccionables con valores predeterminados razonables sobre texto libre.
- Los errores deben decir qué falta o qué está mal y cómo corregirlo.

### 3. Reglas del área

- Implementa las reglas de [reglas-de-negocio.md](reglas-de-negocio.md). Las respuestas deben cambiar el contenido generado.
- Haz visible el efecto de las reglas: quien llena el formulario debe entender por qué aparece una advertencia o una sección.
- Si consideras que alguna regla es incorrecta o incompleta, puedes cambiarla. Explica el cambio en tu `DECISIONES.md`.

### 4. Validación en el servidor

Todo lo que recibe la aplicación se valida en el servidor, no solo en el navegador.

### 5. Paquete de documentos

La herramienta genera **al menos 3 documentos**, descargables o copiables. El formato es libre siempre que se pueda leer y versionar (Markdown es una buena opción).

| Documento | Contenido mínimo |
| --- | --- |
| Decisiones del proyecto | Lo que se respondió en el formulario |
| Lineamientos | Seguridad y arquitectura adaptadas a las respuestas |
| Instrucciones para asistentes de IA | Qué debe leer y respetar el asistente antes de programar, y las reglas de `.gitignore` del proyecto |

Puedes dividir los lineamientos en más documentos si te parece más claro.

### 6. Procedencia

Cada lineamiento indica de dónde sale: un estándar o referencia reconocida, con su enlace, o una decisión del área o tuya. Quien lea el documento debe poder distinguir una cosa de la otra.

### 7. Pruebas

Al menos una prueba automatizada de las reglas del área que se pueda ejecutar con un comando indicado en el README.

### 8. Ejemplos

Genera el paquete con **los tres perfiles** de [datos-de-prueba.md](datos-de-prueba.md) y guarda el resultado en la carpeta `ejemplos/` de tu repositorio.

## Opcional

Ninguno de estos puntos es obligatorio. Si incluyes alguno, explica en `DECISIONES.md` por qué y cómo lo protegiste. Si no lo incluyes, explica por qué no hacía falta.

- **Inicio de sesión** para la propia herramienta.
- **Almacenamiento** de los proyectos que se registran.
- **Integración con un servicio de IA** que redacte o enriquezca los documentos. En [datos-de-prueba.md](datos-de-prueba.md) está el servicio de redacción del área. Si lo usas, la herramienta debe seguir generando el paquete aunque el servicio no responda.
- **Pruebas adicionales**, contenedores o despliegue.
