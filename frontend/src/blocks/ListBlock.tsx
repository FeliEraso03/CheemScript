import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarYInferirTipo, validarNombreVariable, validarListaValores, type TipoExplicito } from '../automata/afd_var_infer';

interface ListBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ListBlock: React.FC<ListBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData, registerVariable } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const name = node.data.name ?? '';
  const values = node.data.values ?? '';

  const validationName = validarNombreVariable(name);
  const esNombreValido = validationName.valid;

  React.useEffect(() => {
    if (name && esNombreValido) {
      registerVariable(id, name, values);
    }
  }, [id, name, values, esNombreValido, registerVariable]);

  const firstVal = values.split(',')[0]?.trim();
  const inferredType = firstVal ? validarYInferirTipo(firstVal) : null;
  const targetType = inferredType && inferredType !== 'unknown' ? (inferredType as TipoExplicito) : undefined;
  const validationVal = validarListaValores(values, targetType);
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
          <span className="scratch-keyword" style={{ color: 'var(--accent-list)' }}>crear lista</span>
          <input
            type="text"
            className={`block-input scratch-input ${!esNombreValido ? 'input-error' : ''}`}
            style={{ outline: !esNombreValido ? '1px solid #ff4444' : undefined }}
            placeholder="lista"
            value={name}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
          />
          <span className="scratch-label">con</span>
          <input
            type="text"
            className={`block-input scratch-input ${!esValorValido ? 'input-error' : ''}`}
            style={{ width: '180px', outline: !esValorValido ? '1px solid #ff4444' : undefined }}
            placeholder="1, 2, 3"
            value={values}
            onChange={(e) => updateNodeData(id, { values: e.target.value })}
          />
          {inferredType && inferredType !== 'unknown' && (
            <span className="scratch-type-badge">{inferredType}</span>
          )}
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
      category="list"
    />
  );
};
