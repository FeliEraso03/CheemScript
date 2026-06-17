import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { AutocompleteInput } from '../components/AutocompleteInput';
import { afd_if } from '../automata/afd_if';
import type { TokenIf } from '../automata/afd_if';
import { validarExpr } from '../automata/dpda_expr';
import type { ParserResult } from '../automata/dpda_expr';
import { useAST } from '../context/ASTContext';

interface ElseIfBranch {
  id: string;
  condition: string;
}

interface IfBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const IfBlock: React.FC<IfBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  
  // Leer del ASTContext
  const node = nodes[id];

  const condition: string = node?.data.condition || '';
  const elseIfs: ElseIfBranch[] = node?.data.elseIfs || [];
  const hasElse: boolean = node?.data.hasElse || false;

  // Actualizar el ASTContext
  const setCondition = (val: string) => updateNodeData(id, { condition: val });
  const setElseIfs = (val: ElseIfBranch[]) => updateNodeData(id, { elseIfs: val });
  const setHasElse = (val: boolean) => updateNodeData(id, { hasElse: val });

  // --- Validar la condicion principal con Parser PDA ---
  const mainExprResult = validarExpr(condition);

  // --- Validar cada condicion de else if ---
  const elseIfResults = new Map<string, ParserResult>();
  for (const ei of elseIfs) {
    elseIfResults.set(ei.id, validarExpr(ei.condition));
  }

  // --- Generar tokens estructurales para el AFD del if ---
  const tokens: TokenIf[] = ['if', '('];
  if (mainExprResult.valid) tokens.push('EXPR');
  tokens.push(')', '{', '}');

  for (const ei of elseIfs) {
    tokens.push('else', 'if', '(');
    const eiRes = elseIfResults.get(ei.id);
    if (eiRes?.valid) tokens.push('EXPR');
    tokens.push(')', '{', '}');
  }

  if (hasElse) {
    tokens.push('else', '{', '}');
  }

  const structResult = afd_if(tokens);

  const addElseIf = () => {
    setElseIfs([...elseIfs, { id: crypto.randomUUID(), condition: '' }]);
  };

  const removeElseIf = (eiId: string) => {
    setElseIfs(elseIfs.filter(ei => ei.id !== eiId));
  };

  const toggleElse = () => setHasElse(!hasElse);

  const updateElseIf = (eiId: string, val: string) => {
    setElseIfs(elseIfs.map(ei => ei.id === eiId ? { ...ei, condition: val } : ei));
  };

  // Determinar si todo el bloque es valido
  const allValid = structResult?.valid === true
    && mainExprResult?.valid === true
    && Array.from(elseIfResults.values()).every(r => r.valid);

  // Obtener el primer mensaje de error relevante
  const getErrorMessage = (): string | null => {
    if (!mainExprResult) return null;
    if (!mainExprResult.valid) {
      return `if: ${mainExprResult.mensaje}`;
    }
    for (const [, res] of elseIfResults) {
      if (!res.valid) {
        return `else if: ${res.mensaje}`;
      }
    }
    if (structResult && !structResult.valid) {
      return `Estructura: ${structResult.mensaje}`;
    }
    return null;
  };

  const errorMsg = getErrorMessage();

  const renderControls = () => (
    <div className="if-controls" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
      <button className="block-btn" onClick={addElseIf}>+ else if</button>
      <button className="block-btn" onClick={toggleElse}>
        {hasElse ? '- else' : '+ else'}
      </button>
    </div>
  );

  if (!node) return null;

  return (
    <div className="if-block-group" style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      <BaseBlock 
        title={
          <div className="if-title-row">
            <span className="if-keyword">if</span>
            <span className="if-paren">(</span>
            <AutocompleteInput
              className={`if-condition-input ${mainExprResult && !mainExprResult.valid ? 'input-error' : ''}`}
              placeholder="x > 0"
              value={condition}
              onChange={(val) => setCondition(val)}
            />
            <span className="if-paren">)</span>
          </div>
        } 
        category="if"
        hasError={!allValid}
        errorMessage={!allValid ? `${errorMsg ?? 'Error desconocido'} ${structResult ? `[${structResult.estadoFinal}]` : ''}` : null}
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      >
        <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del if: arrastra bloques aqui" />
        {elseIfs.length === 0 && !hasElse && renderControls()}
      </BaseBlock>

      {/* Ramas else if convertidas en bloques separados pero adjuntos visualmente */}
      {elseIfs.map((ei, index) => {
        const isLast = index === elseIfs.length - 1 && !hasElse;
        const eiRes = elseIfResults.get(ei.id);
        return (
          <BaseBlock 
            key={ei.id}
            title={
              <div className="if-title-row">
                <span className="if-keyword">else if</span>
                <span className="if-paren">(</span>
                <AutocompleteInput
                  className={`if-condition-input ${eiRes && !eiRes.valid ? 'input-error' : ''}`}
                  placeholder="y != 0"
                  value={ei.condition}
                  onChange={(val) => updateElseIf(ei.id, val)}
                />
                <span className="if-paren">)</span>
                <button
                  className="block-btn if-remove-btn"
                  onClick={() => removeElseIf(ei.id)}
                  title="Eliminar rama"
                >x</button>
              </div>
            }
            category="if"
            hasError={eiRes && !eiRes.valid}
            errorMessage={eiRes && !eiRes.valid ? eiRes.mensaje : null}
          >
            <NestedDropZone parentId={id} zoneName={`elseIf_${ei.id}`} placeholder="Cuerpo else if: arrastra bloques aqui" />
            {isLast && renderControls()}
          </BaseBlock>
        );
      })}

      {/* Rama else como bloque separado */}
      {hasElse && (
        <BaseBlock 
          title={
            <div className="if-title-row">
              <span className="if-keyword">else</span>
            </div>
          }
          category="if"
        >
          <NestedDropZone parentId={id} zoneName="elseBody" placeholder="Cuerpo else: arrastra bloques aqui" />
          {renderControls()}
        </BaseBlock>
      )}

    </div>
  );
};
