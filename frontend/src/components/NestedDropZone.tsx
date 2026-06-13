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
import { useAST } from '../context/ASTContext';

const getBlockComponentMap = (): Record<string, React.FC<{ id: string; onDelete?: () => void; onMoveUp?: () => void; onMoveDown?: () => void }>> => ({
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
});

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface NestedDropZoneProps {
  parentId: string;
  zoneName: string;
  placeholder?: string;
}

/**
 * Zona de drop reutilizable que acepta bloques anidados.
 * Se conecta automáticamente al ASTContext usando parentId y zoneName.
 */
export const NestedDropZone: React.FC<NestedDropZoneProps> = ({
  parentId,
  zoneName,
  placeholder = 'Arrastra bloques aqui',
}) => {
  const { nodes, addNode, removeNode, moveNodeUp, moveNodeDown } = useAST();
  
  const parentNode = nodes[parentId];
  const childrenIds = parentNode?.children?.[zoneName] || [];

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>(() => ({
    accept: 'BLOCK',
    drop: (item, monitor) => {
      // Solo procesar si el drop es directamente sobre esta zona, no sobre un hijo
      if (monitor.didDrop()) return;
      addNode({
        id: generateId(),
        type: item.blockType,
        data: {}
      }, parentId, zoneName);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [parentId, zoneName, addNode]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      drop(node);
    },
    [drop],
  );

  const hasChildren = childrenIds.length > 0;

  return (
    <div
      ref={setRef}
      className={`nested-drop-zone ${isOver ? 'nested-drop-zone--over' : ''} ${hasChildren ? 'nested-drop-zone--filled' : ''}`}
    >
      {!hasChildren && (
        <span className="drop-placeholder">{placeholder}</span>
      )}
      {childrenIds.map((childId, index) => {
        const node = nodes[childId];
        if (!node) return null;
        const BlockComponent = getBlockComponentMap()[node.type];
        return BlockComponent ? (
          <BlockComponent 
            key={childId} 
            id={childId}
            onDelete={() => removeNode(childId, parentId, zoneName)}
            onMoveUp={index > 0 ? () => moveNodeUp(childId, parentId, zoneName) : undefined}
            onMoveDown={index < childrenIds.length - 1 ? () => moveNodeDown(childId, parentId, zoneName) : undefined}
          />
        ) : null;
      })}
    </div>
  );
};
