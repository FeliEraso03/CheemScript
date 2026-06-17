import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { ExpressionSlot } from '../components/ExpressionSlot';
import { validarYInferirTipo, validarNombreVariable } from '../automata/afd_var_infer';

interface VarBlockNewProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function calcInferredLabel(value: string, blockId: string): string {
  const t = validarYInferirTipo(value);
  if (t === 'unknown') {
    console.warn(`VarBlockNew[${blockId}]: No se pudo inferir tipo para "${value}", se usara int como fallback`);
    return 'int?';
  }
  return t;
}

export const VarBlockNew: React.FC<VarBlockNewProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData, registerVariable } = useAST();
  const node = nodes[id];

  const name = node?.data.name ?? '';
  const value = node?.data.value ?? '';
  const inferred = calcInferredLabel(value, id);
  const validationName = validarNombreVariable(name);
  const esNombreValido = validationName.valid;

  React.useEffect(() => {
    if (!node) return;
    if (name && esNombreValido) {
      registerVariable(id, name, value);
    }
  }, [id, name, value, esNombreValido, registerVariable, node]);
  
  const valueType = validarYInferirTipo(value);
  const esValorValido = valueType !== 'unknown';
  const hasError = !esNombreValido || !esValorValido;

  const typeLabel: Record<string, string> = {
    int: 'int', double: 'double', bool: 'bool', string: 'string', char: 'char',
  };

  if (!node) return null;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-var_new)' }}>crear variable</span>
          <input
            type="text"
            className={`block-input scratch-input ${!esNombreValido ? 'input-error' : ''}`}
            style={{ outline: !esNombreValido ? '1px solid #ff4444' : undefined }}
            placeholder="nombre"
            value={name}
            onChange={(e) => updateNodeData(id, { name: e.target.value })}
          />
          <span className="scratch-label">=</span>
          <ExpressionSlot
            value={value}
            onChange={(v) => updateNodeData(id, { value: v })}
            placeholder="0"
            categoryColor={esValorValido ? 'var(--accent-var_new)' : '#ff4444'}
          />
          <span className="scratch-type-badge" style={{ opacity: valueType === 'unknown' ? 0.4 : 1 }}>
            {typeLabel[inferred] || inferred}
          </span>
          {!esNombreValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validationName.mensaje}
            </span>
          )}
          {!esValorValido && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {value === '' ? 'El valor no puede estar vacío' : 'Tipo no inferible'}
            </span>
          )}
        </div>
      }
      category="var_new"
    />
  );
};
