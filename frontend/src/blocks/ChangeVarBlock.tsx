import React from 'react';
import { BaseBlock } from './BaseBlock';
import { ExpressionSlot } from '../components/ExpressionSlot';
import { VariableSelector } from '../components/VariableSelector';
import { useAST } from '../context/ASTContext';
import { validarAmount } from '../automata/afd_var_infer';

interface ChangeVarBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ChangeVarBlock: React.FC<ChangeVarBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const variable = node.data.variable ?? '';
  const amount = node.data.amount ?? '';

  const validationVar = variable === '' ? { valid: false, mensaje: 'Debe seleccionar una variable' } : { valid: true, mensaje: 'Variable seleccionada' };
  const validationAmount = validarAmount(amount);
  
  const hasError = !validationVar.valid || !validationAmount.valid;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-var_new)' }}>cambiar</span>
          <VariableSelector
            value={variable}
            onChange={(v) => updateNodeData(id, { variable: v })}
            placeholder="variable..."
          />
          <span className="scratch-label">en</span>
          <ExpressionSlot
            value={amount}
            onChange={(v) => updateNodeData(id, { amount: v })}
            placeholder="N"
            categoryColor={validationAmount.valid ? 'var(--accent-var_new)' : '#ff4444'}
          />
          {!validationVar.valid && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationVar.mensaje}
            </span>
          )}
          {!validationAmount.valid && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationAmount.mensaje}
            </span>
          )}
        </div>
      }
      category="var_new"
    />
  );
};
