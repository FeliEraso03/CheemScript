import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';

interface VarBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const VarBlock: React.FC<VarBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const dataType = node.data.dataType ?? 'int';
  const name = node.data.name ?? 'x';
  const value = node.data.value ?? '0';

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-var)' }}>crear variable</span>
          <input
            type="text"
            className="block-input scratch-input scratch-input-sm"
            placeholder="nombre"
            value={name}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
          />
          <span className="scratch-label">tipo</span>
          <select
            className="block-input scratch-select"
            value={dataType}
            onChange={(e) => updateNodeData(id, { dataType: e.target.value })}
          >
            <option value="int">int</option>
            <option value="float">float</option>
            <option value="double">double</option>
            <option value="char">char</option>
            <option value="bool">bool</option>
            <option value="string">string</option>
          </select>
          <span className="scratch-label">con valor</span>
          <input
            type="text"
            className="block-input scratch-input scratch-input-sm"
            placeholder="valor"
            value={value}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
          />
        </div>
      }
      category="var"
    />
  );
};
