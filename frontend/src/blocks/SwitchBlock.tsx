import React from 'react';
import { BaseBlock } from './BaseBlock';
import { NestedDropZone } from '../components/NestedDropZone';
import { useAST } from '../context/ASTContext';
import { VariableSelector } from '../components/VariableSelector';
import { AutocompleteInput } from '../components/AutocompleteInput';
import { afd_switch } from '../automata/afd_switch';
import type { TokenSwitch } from '../automata/afd_switch';
import { validarNombreVariable, validarYInferirTipo } from '../automata/afd_var_infer';

interface SwitchCase {
  id: string;
  value: string;
}

interface SwitchBlockProps {
  id: string;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const SwitchBlock: React.FC<SwitchBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];

  const variable = node?.data.variable ?? '';
  const cases: SwitchCase[] = node?.data.cases || [];
  const hasDefault: boolean = node?.data.hasDefault || false;

  const setCases = (val: SwitchCase[]) => updateNodeData(id, { cases: val });
  const setHasDefault = (val: boolean) => updateNodeData(id, { hasDefault: val });

  // Validaciones individuales
  const varValida = variable !== '' && validarNombreVariable(variable).valid;
  const casesValidos = cases.map(c => {
    const tipo = validarYInferirTipo(c.value);
    return c.value !== '' && (tipo === 'int' || tipo === 'char');
  });
  const allCasesValid = casesValidos.every(v => v);

  const tokens: TokenSwitch[] = ['switch', '(', varValida ? 'VAR' : 'VAR', ')', '{'];
  
  cases.forEach(c => {
    const tipo = validarYInferirTipo(c.value);
    const isValido = c.value !== '' && (tipo === 'int' || tipo === 'char');
    tokens.push('case');
    if (isValido) tokens.push('VAL');
    tokens.push(':');
    tokens.push('INSTR'); // Simulamos que el cuerpo tiene instrucciones validas
  });

  if (hasDefault) {
    tokens.push('default', ':', 'INSTR');
  }

  tokens.push('}');
  const structResult = afd_switch(tokens);

  const addCase = () => {
    setCases([...cases, { id: crypto.randomUUID(), value: '' }]);
  };

  const removeCase = (caseId: string) => {
    setCases(cases.filter(c => c.id !== caseId));
  };

  const toggleDefault = () => setHasDefault(!hasDefault);

  const updateCase = (caseId: string, val: string) => {
    setCases(cases.map(c => c.id === caseId ? { ...c, value: val } : c));
  };

  const allValid = structResult?.valid === true && varValida && allCasesValid;

  const getErrorMessage = (): string | null => {
    if (!varValida) return 'Variable inválida o vacía';
    for (let i = 0; i < cases.length; i++) {
      if (!casesValidos[i]) return `El caso ${i + 1} debe ser un entero o carácter válido`;
    }
    if (structResult && !structResult.valid) {
      return `switch: ${structResult.mensaje}`;
    }
    return null;
  };

  const renderControls = () => (
    <div className="switch-controls" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
      <button className="block-btn" onClick={addCase}>+ caso</button>
      <button className="block-btn" onClick={toggleDefault}>
        {hasDefault ? '- default' : '+ default'}
      </button>
    </div>
  );

  if (!node) return null;

  return (
    <div className="switch-block-group" style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
      <BaseBlock
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        hasError={!allValid}
        errorMessage={getErrorMessage()}
        title={
          <div className="scratch-title-row">
            <span className="scratch-keyword" style={{ color: 'var(--accent-switch)' }}>según el valor de</span>
            <VariableSelector
              value={variable}
              onChange={(v) => updateNodeData(id, { variable: v })}
              placeholder="variable..."
            />
            <span className="scratch-label">hacer</span>
          </div>
        }
        category="switch"
      >
        {cases.length === 0 && !hasDefault && renderControls()}
      </BaseBlock>

      {cases.map((c, index) => {
        const isLast = index === cases.length - 1 && !hasDefault;
        return (
          <BaseBlock
            key={c.id}
            category="switch"
            hasError={!casesValidos[index]}
            errorMessage={!casesValidos[index] ? 'Debe ser un entero o carácter válido' : null}
            title={
              <div className="scratch-title-row">
                <span className="scratch-keyword" style={{ marginLeft: '16px' }}>caso</span>
                <AutocompleteInput
                  className={!casesValidos[index] ? 'input-error' : ''}
                  style={{ width: '80px' }}
                  placeholder="valor"
                  value={c.value}
                  onChange={(val) => updateCase(c.id, val)}
                />
                <span className="scratch-label">:</span>
                <button
                  className="block-btn"
                  style={{ marginLeft: 'auto', padding: '2px 6px', background: 'transparent', color: '#ff4444' }}
                  onClick={() => removeCase(c.id)}
                  title="Eliminar caso"
                >
                  x
                </button>
              </div>
            }
          >
            <NestedDropZone parentId={id} zoneName={`case_${c.id}`} placeholder={`Cuerpo del caso ${c.value || index + 1}`} />
            {isLast && renderControls()}
          </BaseBlock>
        );
      })}

      {hasDefault && (
        <BaseBlock
          category="switch"
          title={
            <div className="scratch-title-row">
              <span className="scratch-keyword" style={{ marginLeft: '16px' }}>default</span>
              <span className="scratch-label">:</span>
              <button
                className="block-btn"
                style={{ marginLeft: 'auto', padding: '2px 6px', background: 'transparent', color: '#ff4444' }}
                onClick={toggleDefault}
                title="Eliminar default"
              >
                x
              </button>
            </div>
          }
        >
          <NestedDropZone parentId={id} zoneName="default" placeholder="Cuerpo por defecto" />
          {renderControls()}
        </BaseBlock>
      )}

    </div>
  );
};
