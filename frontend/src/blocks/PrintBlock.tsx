import React, { useMemo } from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarPrintValue } from '../automata/afd_print';
import type { ValidacionPrint } from '../automata/afd_print';

interface PrintBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const PrintBlock: React.FC<PrintBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const value = node.data.value ?? '';

  // Validar con el AFD solo cuando hay contenido
  const validacion: ValidacionPrint | null = useMemo(() => {
    if (value === '') return null;
    return validarPrintValue(value);
  }, [value]);

  const esValido = value === '' || (validacion?.valid ?? true);

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={!esValido}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 800 }}>print</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>(</span>
          <input
            type="text"
            className={`block-input ${!esValido ? 'input-error' : ''}`}
            style={{ width: '140px' }}
            placeholder='"hola" o variable'
            value={value}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>)</span>
          {!esValido && value !== '' && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {validacion?.mensaje ?? 'valor inválido'}
            </span>
          )}
        </div>
      }
      category="print"
    />
  );
};
