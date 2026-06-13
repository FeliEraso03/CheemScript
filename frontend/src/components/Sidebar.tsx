import React, { useState, useCallback, useRef } from 'react';
import { useDrag } from 'react-dnd';
import type { DragItem, BlockCategory, ReporterDragItem } from '../types/ast';
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

interface CollapsibleSectionProps {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ label, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="sidebar-section">
      <div
        className="sidebar-section-header"
        onClick={() => setOpen(o => !o)}
      >
        <span className={`sidebar-section-arrow ${open ? 'open' : ''}`}>&#9660;</span>
        <span className="sidebar-section-label">{label}</span>
      </div>
      {open && (
        <div className="sidebar-section-content">
          {children}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { variables } = useAST();
  const [searchQuery, setSearchQuery] = useState('');

  const varOptions = buildVariableOptions(variables);

  const filterBySearch = (label: string): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return label.toLowerCase().includes(q);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logoImg} alt="CheemScript logo" className="sidebar-logo" />
        <span className="sidebar-title">CheemScript</span>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="Buscar bloques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="blocks-palette">
        <CollapsibleSection label="Control" defaultOpen={true}>
          {filterBySearch('repetir') && <PaletteBlock blockType="repeat"      label="repetir (veces)"   category="repeat" />}
          {filterBySearch('repetir hasta') && <PaletteBlock blockType="repeatUntil" label="repetir hasta que"  category="repeatUntil" />}
          {filterBySearch('si') && <PaletteBlock blockType="if"          label="si / sino"          category="if" />}
          {filterBySearch('segun') && <PaletteBlock blockType="switch"      label="segun / caso"       category="switch" />}
        </CollapsibleSection>

        <CollapsibleSection label="Variables" defaultOpen={true}>
          {filterBySearch('crear') && <PaletteBlock blockType="var_new"     label="crear variable"     category="var_new" />}
          {filterBySearch('asignar') && <PaletteBlock blockType="set_var"    label="asignar variable"   category="var_new" />}
          {filterBySearch('cambiar') && <PaletteBlock blockType="change_var" label="cambiar variable"   category="var_new" />}
          {filterBySearch('mostrar') && <PaletteBlock blockType="show_var"   label="mostrar variable"   category="var_new" />}
          {filterBySearch('lista') && <PaletteBlock blockType="list"        label="crear lista"        category="list" />}
          {filterBySearch('matriz') && <PaletteBlock blockType="mat"         label="crear matriz"       category="mat" />}
          {varOptions.length > 0 && (
            <div className="sidebar-section-sub-label">Reporters de variables</div>
          )}
          {varOptions.map(v => (
            filterBySearch(v.name) && (
              <ReporterPaletteBlock
                key={v.name}
                reporterType="variable"
                label={v.name}
                text={v.name}
                meta={{ name: v.name, type: v.type }}
              />
            )
          ))}
        </CollapsibleSection>

        <CollapsibleSection label="Entrada / Salida" defaultOpen={true}>
          {filterBySearch('decir') && <PaletteBlock blockType="say"         label="decir por (segs)"   category="say" />}
          {filterBySearch('preguntar') && <PaletteBlock blockType="ask"         label="preguntar y esperar" category="ask" />}
        </CollapsibleSection>

        <CollapsibleSection label="Tiempo" defaultOpen={true}>
          {filterBySearch('esperar') && <PaletteBlock blockType="wait"        label="esperar (segundos)" category="wait" />}
        </CollapsibleSection>

        <CollapsibleSection label="Avanzado (C++)" defaultOpen={false}>
          <PaletteBlock blockType="for"         label="for (clasico)"      category="for" />
          <PaletteBlock blockType="while"       label="while (clasico)"    category="while" />
          <PaletteBlock blockType="var"         label="variable (tipada)"  category="var" />
          <PaletteBlock blockType="arr"         label="array 1D"           category="arr" />
          <PaletteBlock blockType="print"       label="print (cout)"       category="print" />
          <PaletteBlock blockType="input"       label="input (cin)"        category="input" />
          <PaletteBlock blockType="sleep"       label="wait ms"            category="sleep" />
        </CollapsibleSection>
      </div>
    </aside>
  );
};
