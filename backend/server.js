const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/compilar', async (req, res) => {
  const { codigo, timeout = 5000 } = req.body;
  const id = uuidv4();
  const srcPath = `/tmp/${id}.cpp`;
  const binPath = `/tmp/${id}`;

  // 1. Escribir el archivo
  fs.writeFileSync(srcPath, codigo);

  // 2. Compilar
  exec(`g++ -o ${binPath} ${srcPath} 2>&1`, (errComp, stdoutComp) => {
    if (errComp) {
      fs.unlinkSync(srcPath);
      return res.json({ exito: false, stdout: '', stderr: stdoutComp });
    }

    // 3. Ejecutar con timeout
    exec(binPath, { timeout }, (errRun, stdout, stderr) => {
      // Limpieza segura
      if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
      if (fs.existsSync(binPath)) fs.unlinkSync(binPath);

      if (errRun && errRun.killed) {
        return res.json({ exito: false, stdout: '', stderr: 'Timeout: ejecución excedió el límite de tiempo.' });
      }

      res.json({ exito: !errRun, stdout, stderr: stderr || '' });
    });
  });
});

app.listen(3001, () => console.log('CheemScript compiler backend running on :3001'));
