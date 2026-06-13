import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';

interface MatrixBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const MatrixBlock: React.FC<MatrixBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const dataType = node.data.dataType ?? 'int';
  const name = node.data.name ?? 'mat';
  const rows = node.data.rows ?? '3';
  const cols = node.data.cols ?? '3';

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <select
            className="block-input"
            style={{ width: '70px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}
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
          <input
            type="text"
            className="block-input"
            style={{ width: '60px' }}
            placeholder="mat"
            value={name}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>[</span>
          <input
            type="text"
            className="block-input"
            style={{ width: '30px' }}
            placeholder="filas"
            value={rows}
            onChange={(e) => updateNodeData(id, { rows: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>][</span>
          <input
            type="text"
            className="block-input"
            style={{ width: '30px' }}
            placeholder="cols"
            value={cols}
            onChange={(e) => updateNodeData(id, { cols: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>]</span>
        </div>
      }
      category="mat"
    />
  );
};
