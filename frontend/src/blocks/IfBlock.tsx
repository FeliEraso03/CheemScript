import { useEffect, useState } from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { afd_if } from '../automata/afd_if';
import type { TokenIf, AfdIfResult } from '../automata/afd_if';
import { validarExpr } from '../automata/parser_expr';
import type { ParserResult } from '../automata/parser_expr';
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
  if (!node) return null;

  const condition: string = node.data.condition || '';
  const elseIfs: ElseIfBranch[] = node.data.elseIfs || [];
  const hasElse: boolean = node.data.hasElse || false;

  // Actualizar el ASTContext
  const setCondition = (val: string) => updateNodeData(id, { condition: val });
  const setElseIfs = (val: ElseIfBranch[]) => updateNodeData(id, { elseIfs: val });
  const setHasElse = (val: boolean) => updateNodeData(id, { hasElse: val });

  const [structResult, setStructResult] = useState<AfdIfResult | null>(null);
  const [mainExprResult, setMainExprResult] = useState<ParserResult | null>(null);
  const [elseIfResults, setElseIfResults] = useState<Map<string, ParserResult>>(new Map());

  useEffect(() => {
    // --- Validar la condicion principal con Parser PDA ---
    const mainRes = validarExpr(condition);
    setMainExprResult(mainRes);

    // --- Validar cada condicion de else if ---
    const eiResults = new Map<string, ParserResult>();
    for (const ei of elseIfs) {
      eiResults.set(ei.id, validarExpr(ei.condition));
    }
    setElseIfResults(eiResults);

    // --- Generar tokens estructurales para el AFD del if ---
    const tokens: TokenIf[] = ['if', '('];
    if (mainRes.valid) tokens.push('EXPR');
    tokens.push(')', '{', '}');

    for (const ei of elseIfs) {
      tokens.push('else', 'if', '(');
      const eiRes = eiResults.get(ei.id);
      if (eiRes?.valid) tokens.push('EXPR');
      tokens.push(')', '{', '}');
    }

    if (hasElse) {
      tokens.push('else', '{', '}');
    }

    setStructResult(afd_if(tokens));
  }, [condition, elseIfs, hasElse]);

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

  return (
    <div className="if-block-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <BaseBlock 
        title={
          <div className="if-title-row">
            <span className="if-keyword">if</span>
            <span className="if-paren">(</span>
            <input
              type="text"
              className={`block-input if-condition-input ${mainExprResult && !mainExprResult.valid ? 'input-error' : ''}`}
              placeholder="x > 0"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
            <span className="if-paren">)</span>
          </div>
        } 
        category="if"
        hasError={!allValid}
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      >
        <NestedDropZone parentId={id} zoneName="body" placeholder="Cuerpo del if: arrastra bloques aqui" />
      </BaseBlock>

      {/* Ramas else if convertidas en bloques separados pero adjuntos visualmente */}
      {elseIfs.map((ei) => {
        const eiRes = elseIfResults.get(ei.id);
        return (
          <BaseBlock 
            key={ei.id}
            title={
              <div className="if-title-row">
                <span className="if-keyword">else if</span>
                <span className="if-paren">(</span>
                <input
                  type="text"
                  className={`block-input if-condition-input ${eiRes && !eiRes.valid ? 'input-error' : ''}`}
                  placeholder="y != 0"
                  value={ei.condition}
                  onChange={(e) => updateElseIf(ei.id, e.target.value)}
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
          >
            <NestedDropZone parentId={id} zoneName={`elseIf_${ei.id}`} placeholder="Cuerpo else if: arrastra bloques aqui" />
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
        </BaseBlock>
      )}

      {/* Controles de bifurcacion */}
      <div className="if-controls" style={{ marginTop: '4px' }}>
        <button className="block-btn" onClick={addElseIf}>+ else if</button>
        <button className="block-btn" onClick={toggleElse}>
          {hasElse ? '- else' : '+ else'}
        </button>
      </div>

      {/* Barra de error del automata — solo visible cuando hay error */}
      {!allValid && (
        <div className="if-status-bar status-error">
          <span className="status-icon">!!!</span>
          <span className="status-text">
            {errorMsg ?? 'Error desconocido'}
          </span>
          {structResult && (
            <span className="status-state">[{structResult.estadoFinal}]</span>
          )}
        </div>
      )}
    </div>
  );
};
