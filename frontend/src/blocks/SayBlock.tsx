import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarAmount } from '../automata/afd_var_infer';
import { validarPrintValue } from '../automata/afd_print';
import { AutocompleteInput } from '../components/AutocompleteInput';

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
  const unit = node.data.unit ?? 's';

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
      errorMessage={!esValidoVal ? validationVal.mensaje : (!esValidoDuration ? validationDuration.mensaje : null)}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-say)' }}>decir</span>
          <AutocompleteInput
            className={`${!esValidoVal ? 'input-error' : ''}`}
            style={{ outline: !esValidoVal ? '1px solid #ff4444' : undefined }}
            placeholder='"hola" o variable'
            value={value}
            onChange={(val) => updateNodeData(id, { value: val })}
          />
          <span className="scratch-label">por</span>
          <input
            type="text"
            className={`block-input scratch-input scratch-input-sm ${!esValidoDuration ? 'input-error' : ''}`}
            style={{ outline: !esValidoDuration ? '1px solid #ff4444' : undefined }}
            placeholder="2"
            value={duration}
            size={Math.max(3, duration.length + 1)}
            onChange={(e) => updateNodeData(id, { duration: e.target.value })}
          />
          <select
            className="block-input scratch-select"
            value={unit}
            style={{ width: 'auto' }}
            onChange={(e) => updateNodeData(id, { unit: e.target.value })}
          >
            <option value="s">segundos</option>
            <option value="ms">milisegundos</option>
          </select>
        </div>
      }
      category="say"
    />
  );
};
