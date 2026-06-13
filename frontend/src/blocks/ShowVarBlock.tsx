import React from 'react';
import { BaseBlock } from './BaseBlock';
import { VariableSelector } from '../components/VariableSelector';
import { useAST } from '../context/ASTContext';

interface ShowVarBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ShowVarBlock: React.FC<ShowVarBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const variable = node.data.variable ?? '';
  const hasError = variable === '';

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-var_new)' }}>mostrar</span>
          <VariableSelector
            value={variable}
            onChange={(v) => updateNodeData(id, { variable: v })}
            placeholder="variable..."
          />
          {hasError && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              Debe seleccionar una variable
            </span>
          )}
        </div>
      }
      category="var_new"
    />
  );
};
