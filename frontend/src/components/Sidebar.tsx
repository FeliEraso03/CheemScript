import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import type { DragItem, BlockCategory } from '../types/ast';
import { useAST } from '../context/ASTContext';
import { buildVariableOptions } from '../types/ast';
import logoImg from '../assets/logo.png';

interface PaletteBlockProps {
  blockType: string;
  label: string;
  category: BlockCategory;
}

const PaletteBlock: React.FC<PaletteBlockProps> = ({ blockType, label, category }) => {
  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>(() => ({
    type: 'BLOCK',
    item: { type: 'BLOCK', blockType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      drag(node);
    },
    [drag],
  );

  return (
    <div
      ref={setRef}
      className="palette-block"
      style={{
        opacity: isDragging ? 0.45 : 1,
        background: `var(--bg-${category})`,
        border: `1px solid color-mix(in srgb, var(--accent-${category}), transparent 55%)`,
      }}
      title={`Arrastrar bloque: ${label}`}
    >
      <div
        className="palette-block-stripe"
        style={{ background: `var(--accent-${category})` }}
      />
      <span
        className="palette-block-label"
        style={{ color: `var(--accent-${category})` }}
      >
        {label}
      </span>
    </div>
  );
};

/*
interface ReporterPaletteBlockProps {
  reporterType: string;
  label: string;
  text: string;
  meta?: Record<string, any>;
}

const ReporterPaletteBlock: React.FC<ReporterPaletteBlockProps> = ({ reporterType, label, text, meta }) => {
  const [{ isDragging }, drag] = useDrag<ReporterDragItem, void, { isDragging: boolean }>(() => ({
    type: 'BLOCK_REPORTER',
    item: { type: 'BLOCK_REPORTER', reporterType, text, meta },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      nodeRef.current = node;
      drag(node);
    },
    [drag],
  );

  return (
    <div
      ref={setRef}
      className="palette-block reporter-palette-block"
      style={{ opacity: isDragging ? 0.45 : 1 }}
      title={`Arrastrar reporter: ${label}`}
    >
      <span className="reporter-pill">{label}</span>
    </div>
  );
};
*/

interface CollapsibleSectionProps {
  label: string;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  label,
  defaultOpen = true,
  forceOpen,
  children
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const isCurrentlyOpen = forceOpen || open;

  return (
    <div className="sidebar-section">
      <div
        className="sidebar-section-header"
        onClick={() => setOpen(o => !o)}
      >
        <span className={`sidebar-section-arrow ${isCurrentlyOpen ? 'open' : ''}`}>&#9660;</span>
        <span className="sidebar-section-label">{label}</span>
      </div>
      {isCurrentlyOpen && (
        <div className="sidebar-section-content">
          {children}
        </div>
      )}
    </div>
  );
};

interface BlockDef {
  blockType: string;
  label: string;
  category: string;
  keywords: string[];
}

interface CategoryDef {
  id: string;
  label: string;
  defaultOpen: boolean;
  blocks: BlockDef[];
}

const PALETTE_CATEGORIES: CategoryDef[] = [
  {
    id: 'control',
    label: 'Control',
    defaultOpen: true,
    blocks: [
      { blockType: 'repeat', label: 'repetir (veces)', category: 'repeat', keywords: ['bucle', 'ciclo', 'loop', 'repetir', 'veces'] },
      { blockType: 'repeatUntil', label: 'repetir hasta que', category: 'repeatUntil', keywords: ['bucle', 'ciclo', 'loop', 'hasta', 'condicion'] },
      { blockType: 'if', label: 'si / sino', category: 'if', keywords: ['si', 'sino', 'if', 'else', 'condicional', 'decision'] },
      { blockType: 'switch', label: 'segun / caso', category: 'switch', keywords: ['segun', 'caso', 'switch', 'case', 'multiple', 'decision'] }
    ]
  },
  {
    id: 'variables',
    label: 'Variables',
    defaultOpen: true,
    blocks: [
      { blockType: 'var_new', label: 'crear variable', category: 'var_new', keywords: ['crear', 'nueva', 'variable', 'var', 'declarar'] },
      { blockType: 'set_var', label: 'asignar variable', category: 'var_new', keywords: ['asignar', 'set', 'valor', 'guardar'] },
      { blockType: 'change_var', label: 'cambiar variable', category: 'var_new', keywords: ['cambiar', 'incrementar', 'sumar', 'restar', 'modificar'] },
      { blockType: 'show_var', label: 'mostrar variable', category: 'var_new', keywords: ['mostrar', 'ver', 'imprimir', 'consola'] },
      { blockType: 'random', label: 'número aleatorio', category: 'var_new', keywords: ['aleatorio', 'random', 'número', 'azar', 'rango'] },
      { blockType: 'list', label: 'crear lista', category: 'list', keywords: ['lista', 'crear lista', 'array', 'vector', 'coleccion'] },
      { blockType: 'mat', label: 'crear matriz', category: 'mat', keywords: ['matriz', 'tabla', 'mat', 'grid', '2d', 'bidimensional'] }
    ]
  },
  {
    id: 'io',
    label: 'Entrada / Salida',
    defaultOpen: true,
    blocks: [
      { blockType: 'say', label: 'decir por (segs)', category: 'say', keywords: ['decir', 'imprimir', 'mostrar', 'hablar', 'texto', 'salida'] },
      { blockType: 'ask', label: 'preguntar y esperar', category: 'ask', keywords: ['preguntar', 'esperar', 'entrada', 'leer', 'teclado', 'input'] }
    ]
  },
  {
    id: 'tiempo',
    label: 'Tiempo',
    defaultOpen: true,
    blocks: [
      { blockType: 'wait', label: 'esperar (segundos)', category: 'wait', keywords: ['esperar', 'segundos', 'pausa', 'tiempo', 'demora', 'retraso', 'sleep'] }
    ]
  },
  {
    id: 'cplusplus',
    label: 'Avanzado (C++)',
    defaultOpen: false,
    blocks: [
      { blockType: 'for', label: 'for (clasico)', category: 'for', keywords: ['for', 'bucle', 'ciclo', 'loop', 'c++', 'avanzado'] },
      { blockType: 'while', label: 'while (clasico)', category: 'while', keywords: ['while', 'bucle', 'ciclo', 'loop', 'c++', 'avanzado'] },
      { blockType: 'var', label: 'variable (tipada)', category: 'var', keywords: ['variable', 'tipo', 'entero', 'float', 'string', 'bool', 'declarar', 'c++', 'int', 'double'] },
      { blockType: 'arr', label: 'array 1D', category: 'arr', keywords: ['array', 'vector', 'arreglo', '1d', 'dimension', 'c++'] },
      { blockType: 'print', label: 'print (cout)', category: 'print', keywords: ['print', 'cout', 'escribir', 'consola', 'c++', 'salida'] },
      { blockType: 'input', label: 'input (cin)', category: 'input', keywords: ['input', 'cin', 'leer', 'consola', 'c++', 'entrada'] },
      { blockType: 'sleep', label: 'wait ms', category: 'sleep', keywords: ['wait', 'ms', 'sleep', 'milisegundos', 'tiempo', 'pausa', 'c++', 'retraso'] }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { variables } = useAST();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const varOptions = buildVariableOptions(variables);

  // Focus search input using '/' or 'Ctrl+K'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  // Filter categories and blocks
  const filteredCategories = PALETTE_CATEGORIES.map(cat => {
    // Filter static blocks
    const matchingBlocks = cat.blocks.filter(block => {
      if (!isSearching) return true;
      const q = searchQuery.toLowerCase();
      return (
        block.label.toLowerCase().includes(q) ||
        block.blockType.toLowerCase().includes(q) ||
        block.category.toLowerCase().includes(q) ||
        block.keywords.some(kw => kw.toLowerCase().includes(q))
      );
    });

    // Special case for variable reporters
    let matchingVariables: typeof varOptions = [];
    if (cat.id === 'variables') {
      matchingVariables = varOptions.filter(v => {
        if (!isSearching) return true;
        const q = searchQuery.toLowerCase();
        return v.name.toLowerCase().includes(q) || 'variable'.includes(q) || 'reporter'.includes(q);
      });
    }

    const hasMatches = matchingBlocks.length > 0 || matchingVariables.length > 0;

    return {
      ...cat,
      matchingBlocks,
      matchingVariables,
      hasMatches
    };
  });

  const hasAnyResults = filteredCategories.some(cat => cat.hasMatches);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logoImg} alt="CheemScript logo" className="sidebar-logo" />
        <span className="sidebar-title">CheemScript</span>
      </div>

      <div className="sidebar-search">
        <div className="sidebar-search-wrapper">
          <svg
            className="sidebar-search-icon"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            className="sidebar-search-input"
            placeholder="Buscar bloques..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="sidebar-search-clear"
              onClick={() => setSearchQuery('')}
              title="Limpiar búsqueda"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          {!searchQuery && (
            <kbd className="sidebar-search-kbd">/</kbd>
          )}
        </div>
      </div>

      {hasAnyResults ? (
        <div className="blocks-palette">
          {filteredCategories.map(cat => {
            if (!cat.hasMatches) return null;

            return (
              <CollapsibleSection
                key={cat.id}
                label={cat.label}
                defaultOpen={cat.defaultOpen}
                forceOpen={isSearching}
              >
                {cat.matchingBlocks.map(block => (
                  <PaletteBlock
                    key={block.blockType}
                    blockType={block.blockType}
                    label={block.label}
                    category={block.category as BlockCategory}
                  />
                ))}

                {/* 
                cat.id === 'variables' && cat.matchingVariables.length > 0 && (
                  <>
                    {(!isSearching || cat.matchingBlocks.length > 0) && (
                      <div className="sidebar-section-sub-label">Reporters de variables</div>
                    )}
                    {cat.matchingVariables.map(v => (
                      <ReporterPaletteBlock
                        key={v.name}
                        reporterType="variable"
                        label={v.name}
                        text={v.name}
                        meta={{ name: v.name, type: v.type }}
                      />
                    ))}
                  </>
                )
                */}
              </CollapsibleSection>
            );
          })}
        </div>
      ) : (
        <div className="sidebar-no-results">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <span>No se encontraron bloques</span>
          <button
            className="sidebar-clear-search-btn"
            onClick={() => setSearchQuery('')}
          >
            Limpiar búsqueda
          </button>
        </div>
      )}
    </aside>
  );
};
