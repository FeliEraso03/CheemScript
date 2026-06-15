import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarAmount, esEntero, esDouble } from '../automata/afd_var_infer';

interface SleepBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function validarDurationSleep(raw: string) {
  const base = validarAmount(raw);
  if (!base.valid) return base;
  if ((esEntero(raw).valid && parseInt(raw.trim(), 10) <= 0) ||
      (esDouble(raw).valid && parseFloat(raw.trim()) <= 0))
    return { valid: false, mensaje: 'La duración debe ser mayor a 0' };
  if (esDouble(raw).valid)
    return { valid: true, mensaje: 'Advertencia: los ms se truncarán a entero' };
  return base;
}

export const SleepBlock: React.FC<SleepBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const duration = node.data.duration ?? '';
  const resultado = validarDurationSleep(duration);
  const esAdvertencia = resultado.valid && resultado.mensaje.startsWith('Advertencia');
  const esValido = resultado.valid;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={!esValido}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-sleep)' }}>wait</span>
          <input
            type="text"
            className={`block-input scratch-input ${!esValido ? 'input-error' : ''}`}
            style={{
              width: '80px',
              outline: !esValido && duration !== ''
                ? '1px solid #ff4444'
                : esAdvertencia
                ? '1px solid #ffaa00'
                : undefined,
            }}
            placeholder="1000"
            value={duration}
            onChange={(e) => updateNodeData(id, { duration: e.target.value })}
          />
          <span className="scratch-label">ms</span>
          {(!esValido || esAdvertencia) && (
            <span style={{
              color: esValido ? '#ffaa00' : '#ff4444',
              fontSize: '11px',
              whiteSpace: 'nowrap'
            }}>
              {resultado.mensaje}
            </span>
          )}
        </div>
      }
      category="sleep"
    />
  );
};
