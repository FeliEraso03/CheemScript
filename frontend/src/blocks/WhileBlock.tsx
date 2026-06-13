import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';

interface WhileBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const WhileBlock: React.FC<WhileBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
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
          <span className="scratch-keyword" style={{ color: 'var(--accent-while)' }}>repetir mientras</span>
          <input
            type="text"
            className="block-input scratch-input"
            placeholder="x < 10"
            value={condition}
            onChange={(e) => updateNodeData(id, { condition: e.target.value })}
          />
          <span className="scratch-label">sea verdadero</span>
        </div>
      }
      category="while"
    >
      <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del while: arrastra bloques aquí" />
    </BaseBlock>
  );
};
