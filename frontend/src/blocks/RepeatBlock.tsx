import React, { useEffect } from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';
import { validarCountSemantico } from '../automata/dpda_repeat';

interface RepeatBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const RepeatBlock: React.FC<RepeatBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData, registerVariable, unregisterVariable } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const count = node.data.count ?? '10';
  const iteratorName = node.data.iterator ?? 'i';
  const esValido = count === '' || validarCountSemantico(count).valid;

  useEffect(() => {
    if (iteratorName.trim()) {
      registerVariable(id, iteratorName.trim(), '0');
    } else {
      unregisterVariable(id);
    }
    return () => unregisterVariable(id);
  }, [iteratorName, id, registerVariable, unregisterVariable]);

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={!esValido}
      errorMessage={!esValido ? validarCountSemantico(count).mensaje : null}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-repeat)' }}>repetir</span>
          <input
            type="text"
            className="block-input scratch-input"
            style={{
              outline: !esValido && count !== '' ? '1px solid #ff4444' : undefined,
            }}
            placeholder="10"
            value={count}
            size={Math.max(3, count.length)}
            onChange={(e) => updateNodeData(id, { count: e.target.value })}
          />
          <span className="scratch-label">veces con ind:</span>
          <input
            type="text"
            className="block-input scratch-input scratch-input-sm"
            style={{ minWidth: '40px' }}
            placeholder="i"
            value={iteratorName}
            size={Math.max(2, iteratorName.length)}
            onChange={(e) => updateNodeData(id, { iterator: e.target.value })}
          />
        </div>
      }
      category="repeat"
    >
      <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del bucle: arrastra bloques aqui" />
    </BaseBlock>
  );
};
