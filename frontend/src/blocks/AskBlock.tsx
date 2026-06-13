import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { esString, validarNombreVariable } from '../automata/afd_var_infer';

interface AskBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const AskBlock: React.FC<AskBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const question = node.data.question ?? '';
  const variable = node.data.variable ?? '';

  const validationQuestion = esString(question);
  const esQuestionValida = validationQuestion.valid;

  const validationVar = validarNombreVariable(variable);
  const esVarValida = validationVar.valid;

  const hasError = !esQuestionValida || !esVarValida;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-ask)' }}>preguntar</span>
          <input
            type="text"
            className={`block-input scratch-input ${!esQuestionValida ? 'input-error' : ''}`}
            style={{ width: '140px', outline: !esQuestionValida ? '1px solid #ff4444' : undefined }}
            placeholder='"Como te llamas?"'
            value={question}
            onChange={(e) => updateNodeData(id, { question: e.target.value })}
          />
          <span className="scratch-label">y guardar respuesta en</span>
          <input
            type="text"
            className={`block-input scratch-input ${!esVarValida ? 'input-error' : ''}`}
            style={{ width: '80px', outline: !esVarValida ? '1px solid #ff4444' : undefined }}
            placeholder="variable"
            value={variable}
            onChange={(e) => updateNodeData(id, { variable: e.target.value })}
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
      category="ask"
    />
  );
};
