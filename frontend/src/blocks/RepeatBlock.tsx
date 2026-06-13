import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';

interface RepeatBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const RepeatBlock: React.FC<RepeatBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const count = node.data.count ?? '10';

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-repeat)' }}>repetir</span>
          <input
            type="text"
            className="block-input scratch-input"
            placeholder="10"
            value={count}
            onChange={(e) => updateNodeData(id, { count: e.target.value })}
          />
          <span className="scratch-label">veces</span>
        </div>
      }
      category="repeat"
    >
      <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del bucle: arrastra bloques aqui" />
    </BaseBlock>
  );
};
