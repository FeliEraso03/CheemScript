import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
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
  if (!node) return null;

  const dataType = (node.data.dataType ?? 'int') as TipoExplicito;
  const name = node.data.name ?? '';
  const value = node.data.value ?? '';
  const validationName = validarNombreVariable(name);
  const esNombreValido = validationName.valid;

  React.useEffect(() => {
    if (name && esNombreValido) {
      registerVariable(id, name, value);
    }
  }, [id, name, value, esNombreValido, registerVariable]);
  const validationVal = validarValorTipado(dataType, value);
  const esValorValido = validationVal.valid;
  const hasError = !esNombreValido || !esValorValido;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-var)' }}>crear variable</span>
          <input
            type="text"
            className={`block-input scratch-input scratch-input-sm ${!esNombreValido ? 'input-error' : ''}`}
            style={{ outline: !esNombreValido ? '1px solid #ff4444' : undefined }}
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
            className={`block-input scratch-input scratch-input-sm ${!esValorValido ? 'input-error' : ''}`}
            style={{ outline: !esValorValido ? '1px solid #ff4444' : undefined }}
            placeholder="valor"
            value={value}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
          />
          {!esNombreValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationName.mensaje}
            </span>
          )}
          {!esValorValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationVal.mensaje}
            </span>
          )}
        </div>
      }
      category="var"
    />
  );
};
