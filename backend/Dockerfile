FROM gcc:13-alpine

RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Usuario sin privilegios para seguridad
RUN adduser -D cheemscript
USER cheemscript

EXPOSE 3001
CMD ["node", "server.js"]
