import React from 'react';
import type { BlockCategory } from '../types/ast';

interface BaseBlockProps {
  title: React.ReactNode;
  category: BlockCategory;
  children?: React.ReactNode;
  hasError?: boolean;
  errorMessage?: string | null;
  isActive?: boolean;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const BaseBlock: React.FC<BaseBlockProps> = ({
  title,
  category,
  children,
  hasError,
  errorMessage,
  isActive,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  return (
    <div
      className={`block-container ${hasError ? 'block-error' : ''} ${isActive ? 'block-active-neon' : ''}`}
      style={{
        '--block-accent': `var(--accent-${category})`,
        '--block-bg': `var(--bg-${category})`,
      } as React.CSSProperties}
    >
      <div className="block-notch-top"></div>
      
      <div className="block-header">
        <div className="block-title-wrapper">
          <div className="block-stripe" />
          <span className="block-title">
            {title}
          </span>
        </div>
        <div className="block-actions" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {onMoveUp && (
            <button 
              onClick={onMoveUp} 
              className="block-move-btn"
              title="Mover arriba"
            >
              ▲
            </button>
          )}
          {onMoveDown && (
            <button 
              onClick={onMoveDown} 
              className="block-move-btn"
              title="Mover abajo"
            >
              ▼
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete} 
              className="block-delete-btn"
              title="Eliminar bloque"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="block-error-banner" style={{ padding: '4px 12px', backgroundColor: 'rgba(255, 68, 68, 0.15)', color: '#ff6b6b', fontSize: '11px', fontFamily: '\"Fira Code\", monospace', borderTop: '1px solid rgba(255, 68, 68, 0.3)', borderBottom: children ? '1px solid rgba(255, 68, 68, 0.3)' : 'none', fontWeight: 500, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 'bold', marginRight: '6px' }}>!!!</span>
          {errorMessage}
        </div>
      )}

      {children && (
        <div className="block-body">
          <div className="block-drop-zone">
            {children}
          </div>
        </div>
      )}
      <div className="block-notch-bottom"></div>
    </div>
  );
};
