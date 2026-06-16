import React from 'react';
import { useAST } from '../context/ASTContext';

export const Console: React.FC = () => {
  const { consoleStatus } = useAST();

  const getStatusColor = () => {
    switch (consoleStatus.status) {
      case 'idle':
        return '#EDEDED'; // Text principal
      case 'compiling':
        return '#D4860A'; // Warning/Ambar
      case 'success':
        return '#27AE60'; // Success
      case 'error':
        return '#C0392B'; // Error rojo
      default:
        return '#EDEDED';
    }
  };

  return (
    <div className="console-panel" style={{ color: getStatusColor() }}>
      <span className="console-prompt">&gt;</span>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
        {consoleStatus.text || "Salida de ejecución..."}
      </pre>
    </div>
  );
};
