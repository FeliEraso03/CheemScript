import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';

interface SleepBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SleepBlock: React.FC<SleepBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const duration = node.data.duration ?? '1000';

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 800 }}>wait</span>
          <input
            type="text"
            className="block-input"
            style={{ width: '60px' }}
            placeholder="1000"
            value={duration}
            onChange={(e) => updateNodeData(id, { duration: e.target.value })}
          />
          <span style={{ fontWeight: 800 }}>ms</span>
        </div>
      }
      category="sleep"
    />
  );
};
