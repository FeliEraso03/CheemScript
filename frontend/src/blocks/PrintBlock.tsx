import React, { useMemo } from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { validarPrintValue } from '../automata/afd_print';
import type { ValidacionPrint } from '../automata/afd_print';
import { AutocompleteInput } from '../components/AutocompleteInput';

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
      errorMessage={!esValido && value !== '' ? (validacion?.mensaje ?? 'valor inválido') : null}
      title={
        <div className="scratch-title-row">
          <span style={{ fontWeight: 800 }}>print</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>(</span>
          <AutocompleteInput
            className={`${!esValido ? 'input-error' : ''}`}
            style={{ flex: 1, minWidth: '150px' }}
            placeholder='"hola" o variable'
            value={value}
            onChange={(val) => updateNodeData(id, { value: val })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>)</span>
        </div>
      }
      category="print"
    />
  );
};
