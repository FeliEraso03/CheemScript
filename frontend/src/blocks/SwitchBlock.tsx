import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';

interface SwitchBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SwitchBlock: React.FC<SwitchBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const variable = node.data.variable ?? '';

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-switch)' }}>según el valor de</span>
          <input
            type="text"
            className="block-input scratch-input"
            placeholder="opcion"
            value={variable}
            onChange={(e) => updateNodeData(id, { variable: e.target.value })}
          />
          <span className="scratch-label">hacer</span>
        </div>
      }
      category="switch"
    >
      <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del switch: arrastra bloques aquí" />
    </BaseBlock>
  );
};
