import React, { useEffect } from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';
import { validarFor } from '../automata/afd_for';

interface ForBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const ForBlock: React.FC<ForBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData, registerVariable, unregisterVariable } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const init = node.data.init ?? 'int i = 0';
  const condition = node.data.condition ?? 'i < 10';
  const increment = node.data.increment ?? 'i++';

  useEffect(() => {
    const match = init.match(/^\s*(?:int|float|double|string|char|auto|long)\s+([a-zA-Z_]\w*)\s*(?:=|$)/);
    if (match) {
      registerVariable(id, match[1], '0');
    } else {
      unregisterVariable(id);
    }
    return () => unregisterVariable(id);
  }, [init, id, registerVariable, unregisterVariable]);

  const resultado = validarFor(init, condition, increment);

  const esInitValido = init === '' || resultado.init.valid;
  const esConditionValida = condition === '' || resultado.condition.valid;
  const esIncrementValido = increment === '' || resultado.increment.valid;
  const allValid = esInitValido && esConditionValida && esIncrementValido;

  const getErrorMessage = (): string | null => {
    if (init !== '' && !resultado.init.valid) {
      return `Inicialización: ${resultado.init.mensaje}`;
    }
    if (condition !== '' && !resultado.condition.valid) {
      return `Condición: ${resultado.condition.mensaje}`;
    }
    if (increment !== '' && !resultado.increment.valid) {
      return `Incremento: ${resultado.increment.mensaje}`;
    }
    return null;
  };

  const errorMsg = getErrorMessage();

  return (
    <BaseBlock
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        category="for"
        hasError={!allValid}
        errorMessage={!allValid ? errorMsg : null}
        title={
          <div className="scratch-title-col">
            <div className="scratch-title-row">
              <span className="scratch-keyword" style={{ color: 'var(--accent-for)' }}>repetir</span>
              <span className="scratch-label">desde</span>
              <input
                type="text"
                className={`block-input scratch-input ${!esInitValido ? 'input-error' : ''}`}
                placeholder="int i = 0"
                value={init}
                onChange={(e) => updateNodeData(id, { init: e.target.value })}
              />
            </div>
            <div className="scratch-title-row">
              <span className="scratch-label">mientras</span>
              <input
                type="text"
                className={`block-input scratch-input ${!esConditionValida ? 'input-error' : ''}`}
                placeholder="i < 10"
                value={condition}
                onChange={(e) => updateNodeData(id, { condition: e.target.value })}
              />
              <span className="scratch-label">luego</span>
              <input
                type="text"
                className={`block-input scratch-input scratch-input-sm ${!esIncrementValido ? 'input-error' : ''}`}
                placeholder="i++"
                value={increment}
                onChange={(e) => updateNodeData(id, { increment: e.target.value })}
              />
            </div>
          </div>
        }
      >
        <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del for: arrastra bloques aquí" />
      </BaseBlock>
  );
};
