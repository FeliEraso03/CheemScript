import React, { useState } from 'react';
import { useAST } from '../context/ASTContext';
import { generateCppCode } from '../codegen/generator';

interface ToolbarProps {
  isCodeVisible: boolean;
  setIsCodeVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setCodePanelWidth: React.Dispatch<React.SetStateAction<number>>;
}

export const Toolbar: React.FC<ToolbarProps> = ({ isCodeVisible, setIsCodeVisible, setCodePanelWidth }) => {
  const { nodes, rootNodes, setConsoleStatus } = useAST();
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompile = async () => {
    try {
      setIsCompiling(true);
      setConsoleStatus({ status: 'compiling', text: 'Compilando y ejecutando...' });

      const code = generateCppCode(nodes, rootNodes);

      const response = await fetch('/api/compilar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: code })
      });

      const result = await response.json();

      if (result.exito) {
        setConsoleStatus({ status: 'success', text: result.stdout || 'Compilado con éxito (sin salida estándar).' });
      } else {
        setConsoleStatus({ status: 'error', text: result.stderr || 'Error desconocido durante la compilación.' });
      }
    } catch (err) {
      setConsoleStatus({ status: 'error', text: 'Error de red: No se pudo conectar al compilador local (CheemScript Backend).' });
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <header className="toolbar">
      <span className="toolbar-title">CheemScript Editor</span>
      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', marginRight: '16px' }}>
        <button
          className="toolbar-btn"
          style={{ backgroundColor: '#27AE60', color: '#fff', fontWeight: 'bold' }}
          onClick={handleCompile}
          disabled={isCompiling}
        >
          {isCompiling ? 'Ejecutando...' : '▶ Compilar y Ejecutar'}
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
