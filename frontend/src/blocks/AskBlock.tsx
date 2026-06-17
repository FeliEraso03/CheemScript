import React from 'react';
import { BaseBlock } from './BaseBlock';
import { useAST } from '../context/ASTContext';
import { esString } from '../automata/afd_var_infer';
import { VariableSelector } from '../components/VariableSelector';
import { AutocompleteInput } from '../components/AutocompleteInput';

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

  const validationVar = variable === '' ? { valid: false, mensaje: 'Debe seleccionar una variable' } : { valid: true, mensaje: 'Variable seleccionada' };
  const esVarValida = validationVar.valid;

  const hasError = !esQuestionValida || !esVarValida;

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      hasError={hasError}
      errorMessage={!esQuestionValida ? validationQuestion.mensaje : (!esVarValida ? validationVar.mensaje : null)}
      title={
        <div className="scratch-title-row">
          <span className="scratch-keyword" style={{ color: 'var(--accent-ask)' }}>preguntar</span>
          <AutocompleteInput
            className={`${!esQuestionValida ? 'input-error' : ''}`}
            style={{ width: '180px', outline: !esQuestionValida ? '1px solid #ff4444' : undefined }}
            placeholder='"Como te llamas?"'
            value={question}
            onChange={(val) => updateNodeData(id, { question: val })}
          />
          <span className="scratch-label">y guardar respuesta en</span>
          <VariableSelector
            value={variable}
            onChange={(v) => updateNodeData(id, { variable: v })}
            placeholder="variable..."
          />
        </div>
      }
      category="ask"
    />
  );
};
