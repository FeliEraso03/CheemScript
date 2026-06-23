const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:4173', 
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como cURL, Postman)
    if (!origin) return callback(null, true);

    // Permitir cualquier localhost
    if (origin.startsWith('http://localhost')) return callback(null, true);

    // Verificar FRONTEND_URL ignorando barras al final
    if (process.env.FRONTEND_URL) {
      const cleanOrigin = origin.replace(/\/$/, '');
      const cleanEnv = process.env.FRONTEND_URL.replace(/\/$/, '');
      if (cleanOrigin === cleanEnv) {
        return callback(null, true);
      }
    }

    // Si no coincide, rechazar sin lanzar error 500
    callback(null, false);
  }
}));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const activeProcesses = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/compilar', async (req, res) => {
  const { codigo } = req.body;
  const id = uuidv4();
  const srcPath = `/tmp/${id}.cpp`;
  const binPath = `/tmp/${id}`;

  // 1. Escribir el archivo
  fs.writeFileSync(srcPath, codigo);

  // 2. Compilar
  exec(`g++ -o ${binPath} ${srcPath} 2>&1`, (errComp, stdoutComp) => {
    if (errComp) {
      if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
      return res.json({ exito: false, stderr: stdoutComp, sessionId: null });
    }

    // 3. Retornar el sessionId para que el frontend inicie el WS
    res.json({ exito: true, sessionId: id, stderr: '' });
  });
});

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    ws.close(1008, 'No sessionId provided');
    return;
  }

  const srcPath = `/tmp/${sessionId}.cpp`;
  const binPath = `/tmp/${sessionId}`;

  if (!fs.existsSync(binPath)) {
    ws.close(1008, 'Session/Binary not found');
    return;
  }

  // Spawn de la ejecución
  const proc = spawn(binPath);
  activeProcesses.set(sessionId, proc);

  proc.stdout.on('data', (data) => {
    ws.send(JSON.stringify({ type: 'stdout', data: data.toString() }));
  });

  proc.stderr.on('data', (data) => {
    ws.send(JSON.stringify({ type: 'stderr', data: data.toString() }));
  });

  proc.on('close', (code) => {
    ws.send(JSON.stringify({ type: 'exit', code }));
    ws.close();
    activeProcesses.delete(sessionId);
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(binPath)) fs.unlinkSync(binPath);
  });

  proc.on('error', (err) => {
    ws.send(JSON.stringify({ type: 'error', data: err.message }));
  });

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      if (msg.type === 'stdin') {
        if (proc && !proc.killed) {
          proc.stdin.write(msg.data + '\n'); // Append newline so cin accepts it
        }
      } else if (msg.type === 'kill') {
        if (proc && !proc.killed) proc.kill();
      }
    } catch (e) {
      console.error('WS message error', e);
    }
  });

  ws.on('close', () => {
    if (proc && !proc.killed) {
      proc.kill();
    }
    activeProcesses.delete(sessionId);
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
    if (fs.existsSync(binPath)) fs.unlinkSync(binPath);
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => console.log(`CheemScript compiler backend running on :${port} with WS`));
