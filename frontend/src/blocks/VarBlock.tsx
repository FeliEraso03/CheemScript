import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { ExpressionSlot } from '../components/ExpressionSlot';
import { validarValorTipado, type TipoExplicito, validarNombreVariable } from '../automata/afd_var_infer';

interface VarBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const VarBlock: React.FC<VarBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData, registerVariable } = useAST();
  const node = nodes[id];

  const dataType = (node?.data.dataType ?? 'int') as TipoExplicito;
  const name = node?.data.name ?? '';
  const value = node?.data.value ?? '';
  const validationName = validarNombreVariable(name);
  const esNombreValido = validationName.valid;

  React.useEffect(() => {
    if (!node) return;
    if (name && esNombreValido) {
      registerVariable(id, name, value);
    }
  }, [id, name, value, esNombreValido, registerVariable, node]);
  const validationVal = validarValorTipado(dataType, value);
  const esValorValido = validationVal.valid;

  if (!node) return null;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={!esNombreValido || !esValorValido}
      errorMessage={!esNombreValido ? validationName.mensaje : (!esValorValido ? validationVal.mensaje : null)}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-var)' }}>crear variable</span>
          <input
            type="text"
            className={`block-input scratch-input scratch-input-sm ${!esNombreValido ? 'input-error' : ''}`}
            style={{ outline: !esNombreValido ? '1px solid #ff4444' : undefined }}
            placeholder="nombre"
            value={name}
            size={Math.max(10, name.length)}
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
          <ExpressionSlot
            value={value}
            onChange={(v) => updateNodeData(id, { value: v })}
            placeholder="valor"
            categoryColor={esValorValido ? 'var(--accent-var)' : '#ff4444'}
          />
        </div>
      }
      category="var"
    />
  );
};
