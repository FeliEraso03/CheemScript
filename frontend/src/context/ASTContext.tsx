import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { validarYInferirTipo } from '../automata/afd_var_infer';
import type { InferredType } from '../automata/afd_var_infer';

// Nodo normalizado para el estado de la UI
export interface UINode {
  id: string;
  type: string; // 'if', 'for', 'while', etc.
  data: Record<string, any>; // Estado interno: condition, elseIfs, etc.
  children: Record<string, string[]>; // Zonas de drop: { body: ['id1', 'id2'], elseBody: ['id3'] }
}

export interface VariableEntry {
  name: string;
  inferredType: InferredType;
  blockId: string;
  firstValue: string;
  createdAt: number;
}

export interface ConsoleStatus {
  status: 'idle' | 'compiling' | 'success' | 'error';
  text: string;
}

interface ASTContextState {
  nodes: Record<string, UINode>;
  rootNodes: string[];
  variables: Record<string, VariableEntry>;
  consoleStatus: ConsoleStatus;
  setConsoleStatus: (status: ConsoleStatus) => void;
  registerVariable: (blockId: string, name: string, value: string) => void;
  unregisterVariable: (blockId: string) => void;
  addNode: (node: Omit<UINode, 'children'>, parentId?: string, zoneName?: string) => void;
  removeNode: (id: string, parentId?: string, zoneName?: string) => void;
  updateNodeData: (id: string, partialData: Record<string, any>) => void;
  moveNodeUp: (id: string, parentId?: string, zoneName?: string) => void;
  moveNodeDown: (id: string, parentId?: string, zoneName?: string) => void;
}

const ASTContext = createContext<ASTContextState | null>(null);

export const ASTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Record<string, UINode>>({});
  const [rootNodes, setRootNodes] = useState<string[]>([]);
  const [variables, setVariables] = useState<Record<string, VariableEntry>>({});
  const [consoleStatus, setConsoleStatus] = useState<ConsoleStatus>({ status: 'idle', text: 'Listo para compilar...' });

  const registerVariable = useCallback((blockId: string, name: string, value: string) => {
    const inferredType = validarYInferirTipo(value);
    const finalType: InferredType = inferredType === 'unknown' ? 'int' : inferredType;
    if (inferredType === 'unknown') {
      console.warn(`registerVariable[${blockId}]: No se pudo inferir tipo para "${value}", se usara int como fallback`);
    }
    setVariables(prev => ({
      ...prev,
      [name]: { name, inferredType: finalType, blockId, firstValue: value, createdAt: Date.now() },
    }));
  }, []);

  const unregisterVariable = useCallback((blockId: string) => {
    setVariables(prev => {
      const next = { ...prev };
      for (const [key, entry] of Object.entries(next)) {
        if (entry.blockId === blockId) {
          delete next[key];
        }
      }
      return next;
    });
  }, []);

  const addNode = useCallback((
    nodeInfo: Omit<UINode, 'children'>, 
    parentId?: string, 
    zoneName?: string
  ) => {
    const newNode: UINode = {
      ...nodeInfo,
      children: {}
    };

    setNodes(prev => ({
      ...prev,
      [newNode.id]: newNode
    }));

    if (parentId && zoneName) {
      setNodes(prev => {
        const parent = prev[parentId];
        if (!parent) return prev;
        const currentZone = parent.children[zoneName] || [];
        return {
          ...prev,
          [parentId]: {
            ...parent,
            children: {
              ...parent.children,
              [zoneName]: [...currentZone, newNode.id]
            }
          }
        };
      });
    } else {
      setRootNodes(prev => [...prev, newNode.id]);
    }
  }, []);

  const removeNode = useCallback((id: string, parentId?: string, zoneName?: string) => {
    // 1. Remove from parent list
    if (parentId && zoneName) {
      setNodes(prev => {
        const parent = prev[parentId];
        if (!parent) return prev;
        const currentZone = parent.children[zoneName] || [];
        return {
          ...prev,
          [parentId]: {
            ...parent,
            children: {
              ...parent.children,
              [zoneName]: currentZone.filter(childId => childId !== id)
            }
          }
        };
      });
    } else {
      setRootNodes(prev => prev.filter(rootId => rootId !== id));
    }

    // 2. We should also remove it from nodes map, and recursively remove its children.
    // For simplicity right now, we can leave orphaned nodes in the map (memory leak but safe for prototyping),
    // or we can implement a recursive delete. Let's do a simple delete.
    setNodes(prev => {
      const newNodes = { ...prev };
      const removed = prev[id];
      if (removed?.type === 'var_new' || removed?.type === 'var' || removed?.type === 'list') {
        setVariables(vPrev => {
          const vNext = { ...vPrev };
          for (const [key, entry] of Object.entries(vNext)) {
            if (entry.blockId === id) {
              delete vNext[key];
            }
          }
          return vNext;
        });
      }
      delete newNodes[id];
      return newNodes;
    });
  }, []);

  const updateNodeData = useCallback((id: string, partialData: Record<string, any>) => {
    setNodes(prev => {
      const node = prev[id];
      if (!node) return prev;
      return {
        ...prev,
        [id]: {
          ...node,
          data: {
            ...node.data,
            ...partialData
          }
        }
      };
    });
  }, []);

  const moveNodeUp = useCallback((id: string, parentId?: string, zoneName?: string) => {
    if (parentId && zoneName) {
      setNodes(prev => {
        const parent = prev[parentId];
        if (!parent) return prev;
        const currentZone = parent.children[zoneName] || [];
        const index = currentZone.indexOf(id);
        if (index <= 0) return prev;
        const newZone = [...currentZone];
        newZone[index] = newZone[index - 1];
        newZone[index - 1] = id;
        return {
          ...prev,
          [parentId]: {
            ...parent,
            children: {
              ...parent.children,
              [zoneName]: newZone
            }
          }
        };
      });
    } else {
      setRootNodes(prev => {
        const index = prev.indexOf(id);
        if (index <= 0) return prev;
        const newRoots = [...prev];
        newRoots[index] = newRoots[index - 1];
        newRoots[index - 1] = id;
        return newRoots;
      });
    }
  }, []);

  const moveNodeDown = useCallback((id: string, parentId?: string, zoneName?: string) => {
    if (parentId && zoneName) {
      setNodes(prev => {
        const parent = prev[parentId];
        if (!parent) return prev;
        const currentZone = parent.children[zoneName] || [];
        const index = currentZone.indexOf(id);
        if (index === -1 || index >= currentZone.length - 1) return prev;
        const newZone = [...currentZone];
        newZone[index] = newZone[index + 1];
        newZone[index + 1] = id;
        return {
          ...prev,
          [parentId]: {
            ...parent,
            children: {
              ...parent.children,
              [zoneName]: newZone
            }
          }
        };
      });
    } else {
      setRootNodes(prev => {
        const index = prev.indexOf(id);
        if (index === -1 || index >= prev.length - 1) return prev;
        const newRoots = [...prev];
        newRoots[index] = newRoots[index + 1];
        newRoots[index + 1] = id;
        return newRoots;
      });
    }
  }, []);

  const value = useMemo(() => ({
    nodes,
    rootNodes,
    variables,
    consoleStatus,
    setConsoleStatus,
    registerVariable,
    unregisterVariable,
    addNode,
    removeNode,
    updateNodeData,
    moveNodeUp,
    moveNodeDown
  }), [nodes, rootNodes, variables, consoleStatus, registerVariable, unregisterVariable, addNode, removeNode, updateNodeData, moveNodeUp, moveNodeDown]);

  return (
    <ASTContext.Provider value={value}>
      {children}
    </ASTContext.Provider>
  );
};

export const useAST = () => {
  const context = useContext(ASTContext);
  if (!context) {
    throw new Error('useAST must be used within an ASTProvider');
  }
  return context;
};
