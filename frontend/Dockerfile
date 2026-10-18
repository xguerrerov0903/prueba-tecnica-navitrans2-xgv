# ============================================================
# frontend/Dockerfile — Arranque Seguro
#
# Multi-stage build:
#   Stage 1 (builder): Compila el bundle de producción con Vite
#   Stage 2 (server):  Sirve los estáticos con nginx
#
# El contexto de compilación es la raíz del proyecto para que
# docker-compose pueda usar `context: .` en ambos servicios.
# ============================================================

# ============================================================
# Stage 1 — builder: instala deps y genera el bundle
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos primero para aprovechar caché de capas:
# si package.json no cambia, npm ci no se re-ejecuta
COPY frontend/package.json frontend/package-lock.json ./

# Instalación reproducible y limpia (equivalente a npm install --frozen-lockfile)
RUN npm ci

# Copiar el resto del código fuente del frontend
COPY frontend/ .

# Generar bundle de producción: tsc && vite build → /app/dist
RUN npm run build

# ============================================================
# Stage 2 — server: imagen final ligera con nginx
# ============================================================
FROM nginx:stable-alpine AS server

# Copiar el bundle generado en stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de nginx
# (reemplaza default.conf con SPA routing + reverse proxy /api/)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
