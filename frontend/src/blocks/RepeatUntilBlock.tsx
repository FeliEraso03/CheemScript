import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';
import { validarExpr } from '../automata/dpda_expr';
import { AutocompleteInput } from '../components/AutocompleteInput';

interface RepeatUntilBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const RepeatUntilBlock: React.FC<RepeatUntilBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const condition = node.data.condition ?? '';
  const resultado = validarExpr(condition);
  const esValido = condition === '' || resultado.valid;

  return (
    <BaseBlock
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        title={
          <div className="scratch-title-row">
            <span className="scratch-keyword" style={{ color: 'var(--accent-repeatUntil)' }}>repetir hasta que</span>
            <AutocompleteInput
              className={`${!esValido ? 'input-error' : ''}`}
              placeholder="x == 10"
              value={condition}
              onChange={(val) => updateNodeData(id, { condition: val })}
            />
          </div>
        }
        category="repeatUntil"
        hasError={!esValido}
        errorMessage={!esValido ? resultado.mensaje : null}
      >
        <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del bucle: arrastra bloques aqui" />
      </BaseBlock>
  );
};
