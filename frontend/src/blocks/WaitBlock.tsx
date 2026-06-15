import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarAmount, esEntero, esDouble } from '../automata/afd_var_infer';

interface WaitBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function validarDuration(raw: string) {
  const base = validarAmount(raw);
  if (!base.valid) return base;
  if (esEntero(raw).valid && parseInt(raw.trim(), 10) <= 0)
    return { valid: false, mensaje: 'La duración debe ser mayor a 0' };
  if (esDouble(raw).valid && parseFloat(raw.trim()) <= 0)
    return { valid: false, mensaje: 'La duración debe ser mayor a 0' };
  return base;
}

export const WaitBlock: React.FC<WaitBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const duration = node.data.duration ?? '';
  const unit = node.data.unit ?? 's';

  const validationDuration = validarDuration(duration);
  const esValidoDuration = validationDuration.valid;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={!esValidoDuration}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-wait)' }}>esperar</span>
          <input
            type="text"
            className={`block-input scratch-input scratch-input-sm ${!esValidoDuration ? 'input-error' : ''}`}
            style={{ outline: !esValidoDuration ? '1px solid #ff4444' : undefined }}
            placeholder="1"
            value={duration}
            onChange={(e) => updateNodeData(id, { duration: e.target.value })}
          />
          <select
            className="block-input scratch-select"
            value={unit}
            onChange={(e) => updateNodeData(id, { unit: e.target.value })}
          >
            <option value="s">segundos</option>
            <option value="ms">milisegundos</option>
          </select>
          {!esValidoDuration && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationDuration.mensaje}
            </span>
          )}
        </div>
      }
      category="wait"
    />
  );
};
