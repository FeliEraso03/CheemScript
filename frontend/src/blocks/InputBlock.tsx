import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';

interface InputBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const InputBlock: React.FC<InputBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const question = node.data.question ?? '';
  const variable = node.data.variable ?? '';

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800 }}>preguntar</span>
          <input
            type="text"
            className="block-input"
            style={{ width: '120px' }}
            placeholder='"¿Cómo te llamas?"'
            value={question}
            onChange={(e) => updateNodeData(id, { question: e.target.value })}
          />
          <span style={{ fontWeight: 800 }}>y guardar en</span>
          <input
            type="text"
            className="block-input"
            style={{ width: '80px' }}
            placeholder="variable"
            value={variable}
            onChange={(e) => updateNodeData(id, { variable: e.target.value })}
          />
        </div>
      }
      category="input"
    />
  );
};
