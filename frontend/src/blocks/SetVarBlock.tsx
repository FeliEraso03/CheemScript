import React from 'react';
import { BaseBlock } from './BaseBlock';
import { ExpressionSlot } from '../components/ExpressionSlot';
import { VariableSelector } from '../components/VariableSelector';
import { useAST } from '../context/ASTContext';
import { validarValorAsignacion } from '../automata/afd_var_infer';

interface SetVarBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SetVarBlock: React.FC<SetVarBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const variable = node.data.variable ?? '';
  const value = node.data.value ?? '';

  const validationVar = variable === '' ? { valid: false, mensaje: 'Debe seleccionar una variable' } : { valid: true, mensaje: 'Variable seleccionada' };
  const validationVal = validarValorAsignacion(value);

  const hasError = !validationVar.valid || !validationVal.valid;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      errorMessage={!validationVar.valid ? validationVar.mensaje : (!validationVal.valid ? validationVal.mensaje : null)}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-var_new)' }}>asignar</span>
          <VariableSelector
            value={variable}
            onChange={(v) => updateNodeData(id, { variable: v })}
            placeholder="variable..."
          />
          <span className="scratch-label">a</span>
          <ExpressionSlot
            value={value}
            onChange={(v) => updateNodeData(id, { value: v })}
            placeholder="valor"
            categoryColor={validationVal.valid ? 'var(--accent-var_new)' : '#ff4444'}
          />
        </div>
      }
      category="var_new"
    />
  );
};
