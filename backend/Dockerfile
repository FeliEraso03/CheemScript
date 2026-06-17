# ─────────────────────────────────────────────────
# CheemScript Backend — Compilador C++ en contenedor
# Imagen base: gcc (incluye g++) + Node.js
# ─────────────────────────────────────────────────
FROM node:20-alpine

# Instalar g++ y libstdc++ dentro del contenedor
RUN apk add --no-cache g++ libstdc++

WORKDIR /app

# Copiar dependencias primero (cache de capas)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar codigo fuente
COPY . .

# Crear directorio temporal para compilaciones
RUN mkdir -p /tmp/cheemscript

# Usuario sin privilegios para seguridad
RUN adduser -D cheemscript && chown -R cheemscript:cheemscript /app /tmp/cheemscript
USER cheemscript

EXPOSE 3001
CMD ["node", "server.js"]
