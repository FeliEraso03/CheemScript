import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';

interface ForBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ForBlock: React.FC<ForBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const init = node.data.init ?? 'int i = 0';
  const condition = node.data.condition ?? 'i < 10';
  const increment = node.data.increment ?? 'i++';

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div className="scratch-title-col">
          <div className="scratch-title-row">
            <span className="scratch-keyword" style={{ color: 'var(--accent-for)' }}>repetir</span>
            <span className="scratch-label">desde</span>
            <input
              type="text"
              className="block-input scratch-input"
              placeholder="int i = 0"
              value={init}
              onChange={(e) => updateNodeData(id, { init: e.target.value })}
            />
          </div>
          <div className="scratch-title-row">
            <span className="scratch-label">mientras</span>
            <input
              type="text"
              className="block-input scratch-input"
              placeholder="i < 10"
              value={condition}
              onChange={(e) => updateNodeData(id, { condition: e.target.value })}
            />
            <span className="scratch-label">luego</span>
            <input
              type="text"
              className="block-input scratch-input scratch-input-sm"
              placeholder="i++"
              value={increment}
              onChange={(e) => updateNodeData(id, { increment: e.target.value })}
            />
          </div>
        </div>
      }
      category="for"
    >
      <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del for: arrastra bloques aquí" />
    </BaseBlock>
  );
};
