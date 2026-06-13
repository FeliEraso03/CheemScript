import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarAmount } from '../automata/afd_var_infer';
import { validarPrintValue } from '../automata/afd_print';

interface SayBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SayBlock: React.FC<SayBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const value = node.data.value ?? '';
  const duration = node.data.duration ?? '';

  const validationVal = validarPrintValue(value);
  const esValidoVal = validationVal.valid;

  const validationDuration = validarAmount(duration);
  const esValidoDuration = validationDuration.valid;

  const hasError = !esValidoVal || !esValidoDuration;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-say)' }}>decir</span>
          <input
            type="text"
            className={`block-input scratch-input ${!esValidoVal ? 'input-error' : ''}`}
            style={{ width: '140px', outline: !esValidoVal ? '1px solid #ff4444' : undefined }}
            placeholder='"hola" o variable'
            value={value}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
          />
          <span className="scratch-label">por</span>
          <input
            type="text"
            className={`block-input scratch-input scratch-input-sm ${!esValidoDuration ? 'input-error' : ''}`}
            style={{ outline: !esValidoDuration ? '1px solid #ff4444' : undefined }}
            placeholder="2"
            value={duration}
            onChange={(e) => updateNodeData(id, { duration: e.target.value })}
          />
          <span className="scratch-label">segs</span>
          {!esValidoVal && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationVal.mensaje}
            </span>
          )}
          {!esValidoDuration && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationDuration.mensaje}
            </span>
          )}
        </div>
      }
      category="say"
    />
  );
};
