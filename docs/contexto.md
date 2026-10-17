# Contexto: cómo se trabajan hoy los prototipos

## Quién pide y quién construye

Las solicitudes llegan desde distintas áreas. Algunos ejemplos recientes:

- **Taller:** agendar citas de mantenimiento y avisar al cliente cuando su equipo está listo.
- **Repuestos:** consultar inventario de referencias críticas por sede.
- **Flota:** ver el estado de vehículos y sus próximos mantenimientos.
- **Comercial:** registrar visitas y oportunidades de venta.

Un prototipo lo construye normalmente una sola persona del área de desarrollo en pocos días, a veces con apoyo de un asistente de IA. Si el prototipo demuestra valor, pasa a **piloto** con usuarios reales de un área y luego a **producción**.

## Lo que sale mal hoy

| Situación | Consecuencia |
| --- | --- |
| Cada prototipo tiene una estructura distinta | Pasar de prototipo a producción implica reescribir buena parte |
| Se decide tarde si hay inicio de sesión | Prototipos con datos de clientes accesibles sin control |
| Nadie registra qué datos maneja la aplicación | Se descubre en el piloto que había datos personales |
| Cada persona escribe sus instrucciones para la IA | Instrucciones contradictorias entre compañeros |
| Archivos `.env` o carpetas de configuración del asistente terminan en Git | Secretos expuestos y configuraciones personales mezcladas |
| Los lineamientos están en la cabeza de algunas personas | Cada revisión depende de quién la haga |

## Lo que se espera de la herramienta

- Que tome **pocos minutos** responderla.
- Que lo que entregue sea **específico** para el proyecto. Un documento genérico igual para todos no ayuda.
- Que quien lea los lineamientos sepa **de dónde sale cada regla**: si responde a un estándar o referencia reconocida, o si es una decisión del área.
- Que el asistente de IA que desarrolle el prototipo sepa **qué leer primero** y **qué no debe subir al repositorio**.
- Que los documentos generados puedan **versionarse** en el repositorio del prototipo y mantenerse entre varias personas.

## Etapas

| Etapa | Usuarios | Datos |
| --- | --- | --- |
| Prototipo | Equipo de desarrollo y el área que lo pidió | Preferiblemente ficticios |
| Piloto | Usuarios reales de una o varias áreas | Reales, con alcance limitado |
| Producción | Todos los usuarios previstos | Reales |
