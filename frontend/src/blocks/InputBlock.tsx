import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { esString } from '../automata/afd_var_infer';
import { VariableSelector } from '../components/VariableSelector';

interface InputBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const InputBlock: React.FC<InputBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const question = node.data.question ?? '';
  const variable = node.data.variable ?? '';

  const validationQuestion = esString(question);
  const esQuestionValida = validationQuestion.valid;

  const validationVar = variable === '' ? { valid: false, mensaje: 'Debe seleccionar una variable' } : { valid: true, mensaje: 'Variable seleccionada' };
  const esVarValida = validationVar.valid;

  const hasError = !esQuestionValida || !esVarValida;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800 }}>preguntar</span>
          <input
            type="text"
            className={`block-input ${!esQuestionValida ? 'input-error' : ''}`}
            style={{ width: '160px', outline: !esQuestionValida ? '1px solid #ff4444' : undefined }}
            placeholder='"¿Cómo te llamas?"'
            value={question}
            onChange={(e) => updateNodeData(id, { question: e.target.value })}
          />
          <span style={{ fontWeight: 800 }}>y guardar en</span>
          <VariableSelector
            value={variable}
            onChange={(v) => updateNodeData(id, { variable: v })}
            placeholder="variable..."
          />
          {!esQuestionValida && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              Pregunta: {validationQuestion.mensaje}
            </span>
          )}
          {!esVarValida && (
            <span style={{ color: '#ff4444', fontSize: '11px', whiteSpace: 'nowrap' }}>
              Variable: {validationVar.mensaje}
            </span>
          )}
        </div>
      }
      category="input"
    />
  );
};
