import React from 'react';
import { BaseBlock } from './BaseBlock';
import { VariableSelector } from '../components/VariableSelector';
import { useAST } from '../context/ASTContext';
import { esEntero, esDouble, validarValorTipado } from '../automata/afd_var_infer';

interface RandomBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const RandomBlock: React.FC<RandomBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const variable = node.data.variable ?? '';
  const min = node.data.min ?? '1';
  const max = node.data.max ?? '100';
  const dataType = node.data.dataType ?? 'int';
  const decimals = node.data.decimals ?? '2';

  // Validaciones
  const validationVar = variable === '' 
    ? { valid: false, mensaje: 'Debe seleccionar una variable' } 
    : { valid: true, mensaje: '' };

  const validationMin = validarValorTipado(dataType === 'double' ? 'double' : 'int', min);
  const validationMax = validarValorTipado(dataType === 'double' ? 'double' : 'int', max);

  // Validar decimales si es double
  const esDoubleType = dataType === 'double';
  const validationDecimals = esDoubleType
    ? (esEntero(decimals).valid && parseInt(decimals, 10) >= 0
        ? { valid: true, mensaje: '' }
        : { valid: false, mensaje: 'Decimales debe ser un entero >= 0' })
    : { valid: true, mensaje: '' };

  // Validar rango si ambos son números literales
  const isMinNumeric = esEntero(min).valid || esDouble(min).valid;
  const isMaxNumeric = esEntero(max).valid || esDouble(max).valid;
  const rangeOk = !isMinNumeric || !isMaxNumeric || parseFloat(min) <= parseFloat(max);
  const validationRange = rangeOk
    ? { valid: true, mensaje: '' }
    : { valid: false, mensaje: 'Rango inválido (min > max)' };

  const hasError = !validationVar.valid || !validationMin.valid || !validationMax.valid || !validationDecimals.valid || !validationRange.valid;

  const getErrorMessage = (): string | null => {
    if (!validationVar.valid) return validationVar.mensaje;
    if (!validationMin.valid) return `Mínimo: ${validationMin.mensaje}`;
    if (!validationMax.valid) return `Máximo: ${validationMax.mensaje}`;
    if (!validationRange.valid) return validationRange.mensaje;
    if (!validationDecimals.valid) return validationDecimals.mensaje;
    return null;
  };

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      errorMessage={getErrorMessage()}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-var_new)' }}>aleatorio</span>
          <span className="scratch-label">rango</span>
          <input
            type="text"
            className={`block-input scratch-input ${!validationMin.valid ? 'input-error' : ''}`}
            style={{ width: '60px', outline: !validationMin.valid ? '1px solid #ff4444' : undefined }}
            placeholder="min"
            value={min}
            onChange={(e) => updateNodeData(id, { min: e.target.value })}
          />
          <span className="scratch-label">a</span>
          <input
            type="text"
            className={`block-input scratch-input ${!validationMax.valid ? 'input-error' : ''}`}
            style={{ width: '60px', outline: !validationMax.valid ? '1px solid #ff4444' : undefined }}
            placeholder="max"
            value={max}
            onChange={(e) => updateNodeData(id, { max: e.target.value })}
          />
          <span className="scratch-label">tipo</span>
          <select
            className="block-input scratch-select"
            style={{ width: '90px' }}
            value={dataType}
            onChange={(e) => updateNodeData(id, { dataType: e.target.value })}
          >
            <option value="int">int</option>
            <option value="double">double</option>
          </select>

          {esDoubleType && (
            <>
              <span className="scratch-label">con</span>
              <input
                type="text"
                className={`block-input scratch-input ${!validationDecimals.valid ? 'input-error' : ''}`}
                style={{ width: '40px', outline: !validationDecimals.valid ? '1px solid #ff4444' : undefined }}
                placeholder="2"
                value={decimals}
                onChange={(e) => updateNodeData(id, { decimals: e.target.value })}
              />
              <span className="scratch-label">decimales</span>
            </>
          )}

          <span className="scratch-label">guardar en</span>
          <VariableSelector
            value={variable}
            onChange={(v) => updateNodeData(id, { variable: v })}
            placeholder="variable..."
          />
        </div>
      }
      category="var_new"
    />
  );
};
