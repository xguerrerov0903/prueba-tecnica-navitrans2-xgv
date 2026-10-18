# Prueba técnica — Arranque Seguro

> Todos los datos de este repositorio son ficticios. Trátalos con el mismo cuidado que tratarías datos reales de la compañía.

---

## El memo

**De:** Coordinación de Desarrollo, Tecnología e Información
**Asunto:** Que cada prototipo arranque con las reglas claras

En Navitrans las áreas de Taller, Repuestos, Comercial, Flota y otras proponen con frecuencia ideas de aplicaciones internas. Muchas se construyen primero como prototipos, y cada vez más con ayuda de asistentes de inteligencia artificial.

El problema es que cada prototipo empieza distinto. Algunos no tienen estructura, otros descubren tarde que manejaban datos personales, otros se publican sin control de acceso. Además, cada persona escribe sus propias instrucciones para el asistente de IA y a veces esas instrucciones, o sus archivos de configuración, terminan en el repositorio compartido y chocan con las de otros compañeros.

Queremos una herramienta que, antes de escribir la primera línea de código, le pregunte a quien va a iniciar el prototipo lo esencial y le entregue los **lineamientos iniciales del proyecto**: para el equipo y para el asistente de IA que lo va a desarrollar.

**Construye esa herramienta.** La llamamos **Arranque Seguro**.

---

## Qué hay en este repositorio

```
README.md                   Este memo, las reglas de la prueba y el tiempo
ENTREGA.md                  Qué entregar y cómo
docs/
  contexto.md               Cómo se trabajan hoy los prototipos en el área
  requisitos.md             Qué debe hacer la herramienta: obligatorio y opcional
  reglas-de-negocio.md      Reglas que hoy aplica el área al arrancar un prototipo
  datos-de-prueba.md        Perfiles de proyectos para probar tu herramienta
plantillas/
  DECISIONES.md             Plantilla para documentar tus decisiones
```

Lee todo antes de empezar. Los documentos se complementan.

---

## En pocas palabras

Una aplicación web pequeña que:

1. Se presenta sola ante el comité que decidirá si se adopta, con una **página de presentación**.
2. Le pide a quien va a iniciar un prototipo que responda un **formulario rápido**, principalmente con clics.
3. Aplica las **reglas del área** según las respuestas.
4. Entrega un **paquete de documentos** con las decisiones del proyecto, los lineamientos de seguridad y arquitectura, y las instrucciones para el asistente de IA.

El detalle está en [docs/requisitos.md](docs/requisitos.md).

---

## Reglas

- **Tiempo:** Hasta el dia lunes 19 de Octubre a las 12:00m
- **Stack libre.** Usa el lenguaje, framework y herramientas que prefieras.
- **IA permitida.** Puedes usar asistentes de IA para programar. Debes poder explicar y modificar cada parte de lo que entregues.
- **Preguntas:** si algo del negocio no está claro, toma un supuesto razonable y escríbelo en tu `DECISIONES.md`.

Preferimos una solución pequeña, clara y bien justificada a una grande sin criterio.
