import React from 'react';
import type { BlockCategory } from '../types/ast';

interface BaseBlockProps {
  title: React.ReactNode;
  category: BlockCategory;
  children?: React.ReactNode;
  hasError?: boolean;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const BaseBlock: React.FC<BaseBlockProps> = ({
  title,
  category,
  children,
  hasError,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  return (
    <div
      className={`block-container ${hasError ? 'block-error' : ''}`}
      style={{
        background: `var(--bg-${category})`,
        borderColor: hasError ? '#d32f2f' : `rgba(var(--accent-${category}-rgb, 0 0 0) / 0.35)`,
        border: hasError ? '2px solid #d32f2f' : `1px solid color-mix(in srgb, var(--accent-${category}), transparent 60%)`,
        boxShadow: hasError ? '0 0 8px rgba(211, 47, 47, 0.4)' : 'none'
      }}
    >
      <div className="block-header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            className="block-stripe"
            style={{ background: `var(--accent-${category})` }}
          />
          <span
            className="block-title"
            style={{ color: `var(--accent-${category})` }}
          >
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

      {children && (
        <div className="block-body">
          <div className="block-drop-zone">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
