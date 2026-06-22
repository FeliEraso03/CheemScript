# CheemScript Frontend

Este es el frontend de la aplicación CheemScript, construido con React, TypeScript y Vite.

## Entorno Local (Desarrollo)

Para ejecutar el proyecto localmente:

1. Asegúrate de tener las dependencias instaladas:
   ```bash
   npm install
   ```
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Por defecto, el frontend asume que el backend (Express) se está ejecutando en el puerto `3001` de `localhost`. No es necesario configurar variables de entorno para desarrollo local, ya que existen fallbacks seguros (`http://localhost:3001`).

## Variables de Entorno

Si deseas apuntar a un backend remoto o necesitas configurar el entorno de producción, puedes crear un archivo `.env` basándote en el archivo de ejemplo:

```bash
cp .env.example .env
```

Variables disponibles:
- `VITE_API_URL`: URL base del backend para llamadas HTTP (ej: `https://mi-backend.onrender.com`).
- `VITE_WS_URL`: URL base del backend para conexión WebSocket (ej: `wss://mi-backend.onrender.com`).

## Despliegue en Vercel (Frontend)

Para desplegar esta aplicación en Vercel:

1. Importa el repositorio a Vercel.
2. Asegúrate de que el Framework Preset esté en **Vite**.
3. El comando de build es `npm run build` y el directorio de salida es `dist`.
4. Ve a la sección **Environment Variables** en Vercel.
5. Añade las siguientes variables (ajusta las URLs según donde despliegues el backend):
   - `VITE_API_URL` = `https://mi-backend.onrender.com`
   - `VITE_WS_URL`  = `wss://mi-backend.onrender.com`
6. Haz click en Deploy.

## Despliegue en Render (Backend)

Para desplegar la carpeta `backend/` en Render:

1. Crea un nuevo **Web Service** en Render.
2. Conecta el repositorio de GitHub.
3. En la configuración del servicio:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (o `node server.js`)
4. Añade las siguientes Variables de Entorno:
   - `FRONTEND_URL` = `https://tu-frontend.vercel.app` (Esto configurará el CORS).
5. Render inyectará automáticamente la variable `PORT`.
6. Haz click en Deploy.

**Nota sobre Cold Starts:** Al usar el plan gratuito de Render, el backend entrará en reposo tras inactividad. El frontend está diseñado para mostrar automáticamente una pantalla de carga y esperar a que el servidor "despierte" la próxima vez que un usuario ingrese.

## Flujo de Trabajo (Rama `deploy-preparation`)

Actualmente, las configuraciones de despliegue se encuentran aisladas en la rama `deploy-preparation`.

Para realizar modificaciones enfocadas en infraestructura sin romper el flujo de desarrollo principal:
1. Cambia a esta rama: `git checkout deploy-preparation`.
2. Realiza tus cambios y sube la rama a GitHub.
3. Vercel creará un Preview Deployment automáticamente para que valides el frontend.

### Merge hacia `main`

Una vez que hayas validado que el despliegue funciona correctamente:
1. Comprueba que el entorno local (`localhost`) sigue compilando sin problemas.
2. Verifica que las URLs en producción resuelven correctamente y el WebSocket compila el código.
3. Abre un Pull Request desde `deploy-preparation` hacia `main` en GitHub.
4. Aprueba y fusiona (Merge). `main` heredará la preparación para producción.
