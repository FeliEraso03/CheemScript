import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';
import { validarExpr } from '../automata/parser_expr';

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
    <div className="repeatUntil-block-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <BaseBlock
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        title={
          <div className="scratch-title-row">
            <span className="scratch-keyword" style={{ color: 'var(--accent-repeatUntil)' }}>repetir hasta que</span>
            <input
              type="text"
              className={`block-input scratch-input ${!esValido ? 'input-error' : ''}`}
              placeholder="x > 10"
              value={condition}
              onChange={(e) => updateNodeData(id, { condition: e.target.value })}
            />
          </div>
        }
        category="repeatUntil"
        hasError={!esValido}
      >
        <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del bucle: arrastra bloques aqui" />
      </BaseBlock>

      {!esValido && (
        <div className="if-status-bar status-error">
          <span className="status-icon">!!!</span>
          <span className="status-text">{resultado.mensaje}</span>
        </div>
      )}
    </div>
  );
};
