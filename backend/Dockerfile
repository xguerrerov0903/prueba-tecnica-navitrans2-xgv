# ============================================================
# backend/Dockerfile — Arranque Seguro
#
# Imagen de producción del backend FastAPI.
# Requisitos:
#   - WORKDIR=/app con PYTHONPATH=/app para preservar la
#     ruta de paquete backend.app.* (ej. uvicorn backend.app.main:app)
#   - Imagen ligera python:3.11-slim
#   - Usuario no-root por seguridad
# ============================================================

FROM python:3.11-slim

# ---------------------------------------------------------------------------
# Variables de entorno globales
# ---------------------------------------------------------------------------
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

# ---------------------------------------------------------------------------
# Usuario no-root
# ---------------------------------------------------------------------------
RUN addgroup --system appgroup \
 && adduser --system --ingroup appgroup --no-create-home appuser

# ---------------------------------------------------------------------------
# Directorio de trabajo — mantiene la estructura /app/backend/...
# para que los imports backend.app.* funcionen correctamente
# ---------------------------------------------------------------------------
WORKDIR /app

# ---------------------------------------------------------------------------
# Instalar dependencias Python (capa cacheada antes de copiar código)
# ---------------------------------------------------------------------------
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# ---------------------------------------------------------------------------
# Copiar el código fuente del paquete backend
# (docs/ no se copia porque sólo se referencia en comentarios, no en runtime)
# ---------------------------------------------------------------------------
COPY backend/ ./backend/

# ---------------------------------------------------------------------------
# Ajustar permisos al usuario no-root
# ---------------------------------------------------------------------------
RUN chown -R appuser:appgroup /app

USER appuser

# ---------------------------------------------------------------------------
# Puerto expuesto
# ---------------------------------------------------------------------------
EXPOSE 8000

# ---------------------------------------------------------------------------
# Comando de arranque
# Usa la ruta de paquete completa: backend.app.main:app
# ---------------------------------------------------------------------------
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
