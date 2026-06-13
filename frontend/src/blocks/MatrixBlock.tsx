import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarNombreVariable, validarTamanio } from '../automata/afd_var_infer';

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
  const name = node.data.name ?? '';
  const rows = node.data.rows ?? '';
  const cols = node.data.cols ?? '';

  const validationName = validarNombreVariable(name);
  const esNombreValido = validationName.valid;

  const validationRows = validarTamanio(rows);
  const esRowsValido = validationRows.valid;

  const validationCols = validarTamanio(cols);
  const esColsValido = validationCols.valid;

  const hasError = !esNombreValido || !esRowsValido || !esColsValido;

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
            style={{ width: '60px', outline: !esNombreValido ? '1px solid #ff4444' : undefined }}
            placeholder="mat"
            value={name}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>[</span>
          <input
            type="text"
            className={`block-input ${!esRowsValido ? 'input-error' : ''}`}
            style={{ width: '30px', outline: !esRowsValido ? '1px solid #ff4444' : undefined }}
            placeholder="filas"
            value={rows}
            onChange={(e) => updateNodeData(id, { rows: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>][</span>
          <input
            type="text"
            className={`block-input ${!esColsValido ? 'input-error' : ''}`}
            style={{ width: '30px', outline: !esColsValido ? '1px solid #ff4444' : undefined }}
            placeholder="cols"
            value={cols}
            onChange={(e) => updateNodeData(id, { cols: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>]</span>
          {!esNombreValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationName.mensaje}
            </span>
          )}
          {!esRowsValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              Fila: {validationRows.mensaje}
            </span>
          )}
          {!esColsValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              Columna: {validationCols.mensaje}
            </span>
          )}
        </div>
      }
      category="mat"
    />
  );
};
