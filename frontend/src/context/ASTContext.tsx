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

export interface ConsoleLine {
  type: 'stdout' | 'stderr' | 'stdin' | 'system';
  text: string;
}

export interface ConsoleStatus {
  status: 'idle' | 'compiling' | 'running' | 'success' | 'error';
  lines: ConsoleLine[];
  isWaitingForInput: boolean;
  sendInput?: (text: string) => void;
  killProcess?: () => void;
}

export interface CheemsMessage {
  id: string;
  text: string;
  type: 'speech' | 'error' | 'success';
}

interface ASTContextState {
  nodes: Record<string, UINode>;
  rootNodes: string[];
  variables: Record<string, VariableEntry>;
  consoleStatus: ConsoleStatus;
  cheemsMessages: CheemsMessage[];
  blockErrors: Record<string, boolean>;
  activeBlockId: string | null;
  isTracingEnabled: boolean;
  setConsoleStatus: React.Dispatch<React.SetStateAction<ConsoleStatus>>;
  setActiveBlockId: React.Dispatch<React.SetStateAction<string | null>>;
  setIsTracingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  addCheemsMessage: (text: string, type: 'speech' | 'error' | 'success') => void;
  clearCheemsMessages: () => void;
  registerVariable: (blockId: string, name: string, value: string) => void;
  unregisterVariable: (blockId: string) => void;
  addNode: (node: Omit<UINode, 'children'>, parentId?: string, zoneName?: string) => void;
  removeNode: (id: string, parentId?: string, zoneName?: string) => void;
  updateNodeData: (id: string, partialData: Record<string, any>) => void;
  setNodeError: (id: string, hasError: boolean) => void;
  loadState: (newNodes: Record<string, UINode>, newRootNodes: string[], newVariables: Record<string, VariableEntry>) => void;
  moveNodeUp: (id: string, parentId?: string, zoneName?: string) => void;
  moveNodeDown: (id: string, parentId?: string, zoneName?: string) => void;
}

const ASTContext = createContext<ASTContextState | null>(null);

export const ASTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Record<string, UINode>>({});
  const [rootNodes, setRootNodes] = useState<string[]>([]);
  const [variablesByBlockId, setVariablesByBlockId] = useState<Record<string, VariableEntry>>({});
  const variables = useMemo(() => {
    const map: Record<string, VariableEntry> = {};
    const entries = Object.values(variablesByBlockId).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    for (const entry of entries) {
      if (entry.name) {
        map[entry.name] = entry;
      }
    }
    return map;
  }, [variablesByBlockId]);
  const [consoleStatus, setConsoleStatus] = useState<ConsoleStatus>({ 
    status: 'idle', 
    lines: [{ type: 'system', text: 'Listo para compilar...' }],
    isWaitingForInput: false
  });
  const [cheemsMessages, setCheemsMessages] = useState<CheemsMessage[]>([]);
  const [blockErrors, setBlockErrors] = useState<Record<string, boolean>>({});
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isTracingEnabled, setIsTracingEnabled] = useState<boolean>(true);

  const setNodeError = useCallback((id: string, hasError: boolean) => {
    setBlockErrors(prev => {
      if (prev[id] === hasError) return prev;
      return { ...prev, [id]: hasError };
    });
  }, []);

  const addCheemsMessage = useCallback((text: string, type: 'speech' | 'error' | 'success') => {
    if (!text.trim()) return;
    const newMsg: CheemsMessage = { id: crypto.randomUUID(), text: text.trim(), type };
    setCheemsMessages([newMsg]);
  }, []);

  const clearCheemsMessages = useCallback(() => {
    setCheemsMessages([]);
  }, []);

  const loadState = useCallback((newNodes: Record<string, UINode>, newRootNodes: string[], newVariables: Record<string, VariableEntry>) => {
    setNodes(newNodes);
    setRootNodes(newRootNodes);
    const variablesByBlock: Record<string, VariableEntry> = {};
    for (const entry of Object.values(newVariables)) {
      if (entry.blockId) {
        variablesByBlock[entry.blockId] = entry;
      }
    }
    setVariablesByBlockId(variablesByBlock);
    setBlockErrors({});
    setActiveBlockId(null);
    clearCheemsMessages();
  }, [clearCheemsMessages]);

  const registerVariable = useCallback((blockId: string, name: string, value: string) => {
    const inferredType = validarYInferirTipo(value);
    const finalType: InferredType = inferredType === 'unknown' ? 'int' : inferredType;
    if (inferredType === 'unknown') {
      console.warn(`registerVariable[${blockId}]: No se pudo inferir tipo para "${value}", se usara int como fallback`);
    }
    setVariablesByBlockId(prev => {
      const next = { ...prev };
      next[blockId] = { name, inferredType: finalType, blockId, firstValue: value, createdAt: prev[blockId]?.createdAt || Date.now() };
      return next;
    });
  }, []);

  const unregisterVariable = useCallback((blockId: string) => {
    setVariablesByBlockId(prev => {
      const next = { ...prev };
      delete next[blockId];
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
        setVariablesByBlockId(vPrev => {
          const vNext = { ...vPrev };
          delete vNext[id];
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
    cheemsMessages,
    blockErrors,
    activeBlockId,
    isTracingEnabled,
    setConsoleStatus,
    setActiveBlockId,
    setIsTracingEnabled,
    addCheemsMessage,
    clearCheemsMessages,
    registerVariable,
    unregisterVariable,
    addNode,
    removeNode,
    updateNodeData,
    setNodeError,
    loadState,
    moveNodeUp,
    moveNodeDown
  }), [nodes, rootNodes, variables, consoleStatus, cheemsMessages, blockErrors, activeBlockId, isTracingEnabled, setConsoleStatus, addCheemsMessage, clearCheemsMessages, registerVariable, unregisterVariable, addNode, removeNode, updateNodeData, setNodeError, loadState, moveNodeUp, moveNodeDown]);

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
