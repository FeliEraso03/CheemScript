import React, { useState, useEffect } from 'react';
import { useAST } from '../context/ASTContext';
import { generateCppCode } from '../codegen/generator';

interface ToolbarProps {
  isCodeVisible: boolean;
  setIsCodeVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setCodePanelWidth: React.Dispatch<React.SetStateAction<number>>;
  setRightPanelTab?: React.Dispatch<React.SetStateAction<'stage' | 'code'>>;
}
export const Toolbar: React.FC<ToolbarProps> = ({ isCodeVisible, setIsCodeVisible, setCodePanelWidth, setRightPanelTab }) => {
  const { nodes, rootNodes, variables, consoleStatus, setConsoleStatus, clearCheemsMessages, addCheemsMessage, isTracingEnabled, setIsTracingEnabled, activeBlockId, setActiveBlockId, loadState } = useAST();
  const [isCompiling, setIsCompiling] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    const data = { nodes, rootNodes, variables };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cheemscript_project.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCpp = () => {
    const { code } = generateCppCode(nodes, rootNodes, variables, false);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cheemscript_code.cpp';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.nodes && data.rootNodes && data.variables) {
          if (loadState) loadState(data.nodes, data.rootNodes, data.variables);
        } else {
          alert('Archivo inválido. Faltan datos estructurales.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset
  };

  useEffect(() => {
    document.querySelectorAll('.block-active-neon').forEach(el => el.classList.remove('block-active-neon'));
    if (activeBlockId) {
       const blockEl = document.getElementById(`block-${activeBlockId}`);
       if (blockEl) {
         blockEl.classList.add('block-active-neon');
         const container = blockEl.querySelector('.block-container') || blockEl;
         container.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
    }
  }, [activeBlockId]);

  const handleCompile = async () => {
    try {
      if (document.querySelector('.block-error') || document.querySelector('.input-error')) {
        if (clearCheemsMessages) clearCheemsMessages();
        if (addCheemsMessage) {
          addCheemsMessage('¡Grrr! Hay errores en tus bloques. Revisa los recuadros rojos antes de compilar.', 'error');
        }
        setConsoleStatus({
          status: 'error',
          lines: [{ type: 'system', text: 'No se puede compilar: hay bloques inválidos.' }],
          isWaitingForInput: false
        });
        return;
      }

      setIsCompiling(true);
      if (clearCheemsMessages) clearCheemsMessages();
      
      if (setRightPanelTab && isCodeVisible) {
        setRightPanelTab('stage');
      }

      setConsoleStatus({ 
        status: 'compiling', 
        lines: [{ type: 'system', text: 'Compilando...' }],
        isWaitingForInput: false
      });

      const { code, sourceMap } = generateCppCode(nodes, rootNodes, variables, isTracingEnabled);
      // Hack: we store sourceMap on window so CodeView can read it easily without more context wiring
      (window as any)._cheemsSourceMap = sourceMap;

      const response = await fetch('/api/compilar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: code })
      });

      const result = await response.json();

      if (!result.exito) {
        setConsoleStatus({ 
          status: 'error', 
          lines: [{ type: 'stderr', text: result.stderr || 'Error desconocido durante la compilación.' }],
          isWaitingForInput: false
        });
        setIsCompiling(false);
        return;
      }

      setConsoleStatus({ 
        status: 'running', 
        lines: [{ type: 'system', text: 'Compilado con éxito. Ejecutando...' }],
        isWaitingForInput: false
      });

      // Conectar WebSocket
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Asumimos que el backend está en el mismo host pero puerto 3001 si estamos en dev local,
      // o a través del proxy de Vite en '/api' pero WS no pasa por el proxy igual.
      // Mejor construimos la URL usando el hostname
      const wsUrl = `${wsProtocol}//${window.location.hostname}:3001/?sessionId=${result.sessionId}`;
      const ws = new WebSocket(wsUrl);

      let currentLines: any[] = [{ type: 'system', text: 'Compilado con éxito. Ejecutando...' }];
      
      const updateLines = (newLine: any) => {
        currentLines = [...currentLines, newLine];
        setConsoleStatus((prev: any) => ({
          ...prev,
          lines: currentLines,
        }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'stdout') {
          let text = msg.data as string;
          
          // Process and remove ALL clear signals
          if (text.includes('__CHEEMS_CLEAR__')) {
            if (clearCheemsMessages) clearCheemsMessages();
            text = text.replace(/__CHEEMS_CLEAR__(?:\r?\n)?/g, '');
          }

          // Extract ALL trace signals
          const extractedTraces: string[] = [];
          text = text.replace(/__CHEEMS_TRACE__([^\r\n]+)(?:\r?\n|$)/g, (_match, p1) => {
             extractedTraces.push(p1.trim());
             return ''; // remove from output
          });
          
          // Fallback if they were somehow squashed with spaces instead of newlines
          text = text.replace(/__CHEEMS_TRACE__([^\s]+)/g, (_match, p1) => {
             extractedTraces.push(p1.trim());
             return '';
          });

          if (extractedTraces.length > 0 && isTracingEnabled) {
             if (setActiveBlockId) setActiveBlockId(extractedTraces[extractedTraces.length - 1]);
          }

          if (text.trim() || text.includes('\n')) {
            updateLines({ type: 'stdout', text });
          }
        } else if (msg.type === 'stderr') {
          updateLines({ type: 'stderr', text: msg.data });
        } else if (msg.type === 'exit') {
          updateLines({ type: 'system', text: `Proceso terminado (código ${msg.code})` });
          setConsoleStatus((prev: any) => ({ ...prev, status: msg.code === 0 ? 'success' : 'error' }));
          setIsCompiling(false);
          if (setActiveBlockId) setActiveBlockId(null);
        } else if (msg.type === 'error') {
          updateLines({ type: 'stderr', text: `Error de proceso: ${msg.data}` });
          setConsoleStatus((prev: any) => ({ ...prev, status: 'error' }));
          setIsCompiling(false);
          if (setActiveBlockId) setActiveBlockId(null);
        }
      };

      ws.onclose = () => {
        setIsCompiling(false);
      };

      ws.onerror = () => {
        updateLines({ type: 'system', text: 'Desconectado del servidor.' });
        setConsoleStatus((prev: any) => ({ ...prev, status: 'error' }));
        setIsCompiling(false);
      };

      // Set sendInput to be used by Console
      setConsoleStatus((prev: any) => ({
        ...prev,
        sendInput: (text: string) => {
          updateLines({ type: 'stdin', text: text });
          ws.send(JSON.stringify({ type: 'stdin', data: text }));
        },
        killProcess: () => {
          ws.send(JSON.stringify({ type: 'kill' }));
        }
      }));

    } catch (err) {
      setConsoleStatus({ 
        status: 'error', 
        lines: [{ type: 'system', text: 'Error de red: No se pudo conectar al compilador local (CheemScript Backend).' }],
        isWaitingForInput: false
      });
      setIsCompiling(false);
    }
  };

  return (
    <header className="toolbar">
      <span className="toolbar-title">CheemScript Editor</span>
      
      <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
        <button className="toolbar-btn" onClick={() => fileInputRef.current?.click()}>
          Importar
        </button>
        <button className="toolbar-btn" onClick={handleExportJson}>
          Exportar JSON
        </button>
        <button className="toolbar-btn" onClick={handleExportCpp}>
          Exportar C++
        </button>
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleImport} 
        />
      </div>

      <div className="toolbar-actions" style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          <label className="toggle-switch-label">
            <div className={`toggle-switch ${isTracingEnabled ? 'active' : ''}`}>
              <input 
                type="checkbox" 
                className="sr-only"
                checked={isTracingEnabled} 
                onChange={(e) => setIsTracingEnabled && setIsTracingEnabled(e.target.checked)}
              />
              <div className="toggle-slider"></div>
            </div>
            Seguir ejecución
          </label>
          <button
            className={`compile-btn ${isCompiling ? 'kill-btn' : ''}`}
            onClick={isCompiling ? () => {
              if (consoleStatus.killProcess) {
                consoleStatus.killProcess();
                if (clearCheemsMessages) clearCheemsMessages();
                if (addCheemsMessage) addCheemsMessage('¡Ejecución cancelada!', 'error');
              }
            } : handleCompile}
            disabled={isCompiling && !consoleStatus.killProcess}
        >
          {isCompiling ? '■ Detener Ejecución' : '▶ Compilar y Ejecutar'}
        </button>
      </div>

      <button 
        className="toolbar-btn"
        onClick={() => setIsCodeVisible(prev => !prev)}
      >
        {isCodeVisible ? 'Ocultar Código C++' : 'Mostrar Código C++'}
      </button>
      
      {isCodeVisible && (
        <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
          <button 
            className="toolbar-btn"
            onClick={() => setCodePanelWidth(w => Math.max(280, w - 50))}
            title="Reducir panel"
          >
            - Ancho
          </button>
          <button 
            className="toolbar-btn"
            onClick={() => setCodePanelWidth(w => Math.min(800, w + 50))}
            title="Aumentar panel"
          >
            + Ancho
          </button>
        </div>
      )}
    </header>
  );
};
