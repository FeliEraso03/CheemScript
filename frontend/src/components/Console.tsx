import React, { useState, useRef, useEffect } from 'react';
import { useAST } from '../context/ASTContext';

export const Console: React.FC = () => {
  const { consoleStatus, setConsoleStatus } = useAST();
  const [inputValue, setInputValue] = useState('');
  const endOfConsoleRef = useRef<HTMLDivElement>(null);
  
  const [height, setHeight] = useState(() => {
    const saved = localStorage.getItem('cheemscript_console_height');
    return saved ? parseInt(saved, 10) : 140;
  });
  const [isDragging, setIsDragging] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfConsoleRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleStatus.lines]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      const boundedHeight = Math.max(60, Math.min(newHeight, window.innerHeight * 0.8));
      setHeight(boundedHeight);
      localStorage.setItem('cheemscript_console_height', String(boundedHeight));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getStatusColor = () => {
    switch (consoleStatus.status) {
      case 'idle':
        return '#EDEDED';
      case 'compiling':
        return '#D4860A';
      case 'running':
        return '#4D97FF';
      case 'success':
        return '#27AE60';
      case 'error':
        return '#C0392B';
      default:
        return '#EDEDED';
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consoleStatus.sendInput) {
      consoleStatus.sendInput(inputValue);
      setInputValue('');
      setConsoleStatus(prev => ({ ...prev, isWaitingForInput: false }));
    }
  };

  return (
    <div 
      ref={consoleRef}
      className="console-panel" 
      style={{ 
        color: getStatusColor(), 
        display: 'flex', 
        flexDirection: 'column',
        height: `${height}px`,
        minHeight: `${height}px`,
        position: 'relative',
        paddingTop: '12px'
      }}
    >
      <div 
        className={`console-resizer ${isDragging ? 'dragging' : ''}`}
        onMouseDown={() => setIsDragging(true)}
        style={{ height: '8px', cursor: 'row-resize', position: 'absolute', top: 0, left: 0, right: 0 }}
      />
      <div className="console-header" style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginBottom: '8px', fontSize: '10px', color: '#888', display: 'flex', justifyContent: 'space-between', userSelect: 'none' }}>
        <span>Terminal C++</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {consoleStatus.lines?.map((line, idx) => (
          <div key={idx} style={{ 
            color: line.type === 'stderr' ? '#C0392B' : 
                   line.type === 'system' ? '#888' : 
                   line.type === 'stdin' ? '#27AE60' : '#EDEDED',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit'
          }}>
            {line.type === 'stdin' ? '> ' : ''}{line.text}
          </div>
        ))}
        {consoleStatus.status === 'running' && consoleStatus.isWaitingForInput && (
          <form onSubmit={handleInputSubmit} style={{ display: 'flex', marginTop: '4px' }}>
            <span style={{ color: '#27AE60', marginRight: '8px' }}>$</span>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#EDEDED', outline: 'none', fontFamily: 'inherit' }}
              autoFocus
              placeholder="..."
            />
          </form>
        )}
        <div ref={endOfConsoleRef} />
      </div>
    </div>
  );
};
