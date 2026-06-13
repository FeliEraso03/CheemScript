import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';

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

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-repeatUntil)' }}>repetir hasta que</span>
          <input
            type="text"
            className="block-input scratch-input"
            placeholder="x > 10"
            value={condition}
            onChange={(e) => updateNodeData(id, { condition: e.target.value })}
          />
        </div>
      }
      category="repeatUntil"
    >
      <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del bucle: arrastra bloques aqui" />
    </BaseBlock>
  );
};
