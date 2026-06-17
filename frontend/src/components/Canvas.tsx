import React, { useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { DragItem } from '../types/ast';
import { IfBlock } from '../blocks/IfBlock';
import { ForBlock } from '../blocks/ForBlock';
import { WhileBlock } from '../blocks/WhileBlock';
import { SwitchBlock } from '../blocks/SwitchBlock';
import { VarBlock } from '../blocks/VarBlock';
import { ArrayBlock } from '../blocks/ArrayBlock';
import { MatrixBlock } from '../blocks/MatrixBlock';
import { PrintBlock } from '../blocks/PrintBlock';
import { InputBlock } from '../blocks/InputBlock';
import { SleepBlock } from '../blocks/SleepBlock';
import { RepeatBlock } from '../blocks/RepeatBlock';
import { RepeatUntilBlock } from '../blocks/RepeatUntilBlock';
import { SayBlock } from '../blocks/SayBlock';
import { AskBlock } from '../blocks/AskBlock';
import { WaitBlock } from '../blocks/WaitBlock';
import { ListBlock } from '../blocks/ListBlock';
import { VarBlockNew } from '../blocks/VarBlockNew';
import { SetVarBlock } from '../blocks/SetVarBlock';
import { ChangeVarBlock } from '../blocks/ChangeVarBlock';
import { ShowVarBlock } from '../blocks/ShowVarBlock';
import { RandomBlock } from '../blocks/RandomBlock';
import { useAST } from '../context/ASTContext';

const BLOCK_COMPONENT_MAP: Record<string, React.FC<{ id: string; onDelete?: () => void; onMoveUp?: () => void; onMoveDown?: () => void }>> = {
  if:     IfBlock,
  for:    ForBlock,
  while:  WhileBlock,
  switch: SwitchBlock,
  var:    VarBlock,
  arr:    ArrayBlock,
  mat:    MatrixBlock,
  print:  PrintBlock,
  input:  InputBlock,
  sleep:  SleepBlock,
  repeat: RepeatBlock,
  repeatUntil: RepeatUntilBlock,
  say:    SayBlock,
  ask:    AskBlock,
  wait:   WaitBlock,
  list:   ListBlock,
  var_new: VarBlockNew,
  set_var: SetVarBlock,
  change_var: ChangeVarBlock,
  show_var: ShowVarBlock,
  random: RandomBlock,
};

// Genera un ID unico usando la API del navegador (mas robusto que Math.random)
function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const Canvas: React.FC = () => {
  const { nodes, rootNodes, addNode, removeNode, moveNodeUp, moveNodeDown } = useAST();

  // useDrop devuelve ConnectDropTarget, que no es Ref<HTMLDivElement>.
  // La solucion correcta es pasar el elemento al conector con useCallback.
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(() => ({
    accept: 'BLOCK',
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      addNode({
        id: generateId(),
        type: item.blockType,
        data: {}
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Usamos un callback ref para combinar nuestro propio ref con el conector de react-dnd
  const containerRef = useRef<HTMLDivElement | null>(null);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      drop(node); // Conecta el nodo al sistema de drop de react-dnd
    },
    [drop],
  );

  const hasBlocks = rootNodes.length > 0;

  return (
    <div
      ref={setRef}
      className={`canvas-area${isOver ? ' canvas-area--over' : ''}`}
    >
      {!hasBlocks && (
        <div className="canvas-empty-hint">
          <p>Arrastra bloques desde la paleta</p>
        </div>
      )}

      <div className="canvas-blocks">
        {rootNodes.map((nodeId, index) => {
          const node = nodes[nodeId];
          if (!node) return null;
          
          const BlockComponent = BLOCK_COMPONENT_MAP[node.type];
          return BlockComponent ? (
            <div key={nodeId} id={`block-${nodeId}`} style={{ display: 'contents' }}>
              <BlockComponent 
                id={nodeId}
                onDelete={() => removeNode(nodeId)}
                onMoveUp={index > 0 ? () => moveNodeUp(nodeId) : undefined}
                onMoveDown={index < rootNodes.length - 1 ? () => moveNodeDown(nodeId) : undefined}
              />
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};
