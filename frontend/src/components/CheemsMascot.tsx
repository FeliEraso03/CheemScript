import React, { useEffect } from 'react';
import { useAST } from '../context/ASTContext';
import cheemsImg from '../assets/mascota.png'; 

export const CheemsMascot: React.FC = () => {
  const { consoleStatus, cheemsMessages, addCheemsMessage } = useAST();

  // Solo hacer que Cheems diga los "stdout" (prints de código)
  useEffect(() => {
    if (consoleStatus.lines.length > 0) {
      const lastLine = consoleStatus.lines[consoleStatus.lines.length - 1];
      if (lastLine.type === 'stdout') {
        addCheemsMessage(lastLine.text, 'speech');
      }
    }
  }, [consoleStatus.lines, addCheemsMessage]);

  // Always render the container because it's now our Stage
  // But maybe hide the bubbles if empty.

  return (
    <div className="cheems-mascot-container">
      <div className="cheems-bubbles">
        {cheemsMessages.map(msg => (
          <div key={msg.id} className={`cheems-bubble cheems-bubble-${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <img src={cheemsImg} alt="Cheems" className={`cheems-img ${consoleStatus.status === 'compiling' ? 'cheems-thinking' : consoleStatus.status === 'error' ? 'cheems-angry' : 'cheems-idle'}`} />
    </div>
  );
};
