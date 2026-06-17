# ─────────────────────────────────────────────────
# CheemScript Frontend — Build multi-stage
# Etapa 1: Build con Node
# Etapa 2: Servir con Nginx
# ─────────────────────────────────────────────────

# === Etapa 1: Build ===
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# === Etapa 2: Servir ===
FROM nginx:alpine

# Copiar build del frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuracion de nginx (proxy al backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
