import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarNombreVariable, validarTamanioOVariable, validarListaValores, type TipoExplicito } from '../automata/afd_var_infer';

interface ArrayBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ArrayBlock: React.FC<ArrayBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const dataType = node.data.dataType ?? 'int';
  const name = node.data.name ?? '';
  const size = node.data.size ?? '';
  const values = node.data.values ?? '';

  const validationName = validarNombreVariable(name);
  const esNombreValido = validationName.valid;

  const validationSize = validarTamanioOVariable(size);
  const esTamanioValido = validationSize.valid;

  const validationVal = validarListaValores(values, dataType as TipoExplicito);
  const esValorValido = validationVal.valid;

  const hasError = !esNombreValido || !esTamanioValido || !esValorValido;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
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
            className={`block-input ${!esNombreValido ? 'input-error' : ''}`}
            style={{ width: '80px', outline: !esNombreValido ? '1px solid #ff4444' : undefined }}
            placeholder="arr"
            value={name}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>[</span>
          <input
            type="text"
            className={`block-input ${!esTamanioValido ? 'input-error' : ''}`}
            style={{ width: '60px', outline: !esTamanioValido ? '1px solid #ff4444' : undefined }}
            placeholder="size"
            value={size}
            onChange={(e) => updateNodeData(id, { size: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>]</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>= {'{'}</span>
          <input
            type="text"
            className={`block-input ${!esValorValido ? 'input-error' : ''}`}
            style={{ width: '110px', outline: !esValorValido ? '1px solid #ff4444' : undefined }}
            placeholder="1, 2, 3"
            value={values}
            onChange={(e) => updateNodeData(id, { values: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{'}'}</span>
          {!esNombreValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationName.mensaje}
            </span>
          )}
          {!esTamanioValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationSize.mensaje}
            </span>
          )}
          {!esValorValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationVal.mensaje}
            </span>
          )}
        </div>
      }
      category="arr"
    />
  );
};
