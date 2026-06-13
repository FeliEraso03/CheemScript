import React, { useCallback, useRef } from 'react';
import { useDrag } from 'react-dnd';
import type { DragItem, BlockCategory } from '../types/ast';
import logoImg from '../assets/logo.png';

interface PaletteBlockProps {
  blockType: string;
  label: string;
  category: BlockCategory;
}

// Renderiza un bloque arrastrable en la paleta lateral.
// Usa callback ref para compatibilidad con ConnectDragSource de react-dnd.
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
      drag(node); // Conecta el nodo al sistema de drag de react-dnd
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

export const Sidebar: React.FC = () => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <img src={logoImg} alt="CheemScript logo" className="sidebar-logo" />
      <span className="sidebar-title">CheemScript</span>
    </div>

    <div className="blocks-palette">
      <div className="sidebar-section-label">Condicionales</div>
      <PaletteBlock blockType="if"     label="if / else"    category="if"     />

      <div className="sidebar-section-label">Bucles</div>
      <PaletteBlock blockType="for"    label="for"          category="for"    />
      <PaletteBlock blockType="while"  label="while"        category="while"  />

      <div className="sidebar-section-label">Control de flujo</div>
      <PaletteBlock blockType="switch" label="switch / case" category="switch" />

      <div className="sidebar-section-label">Datos</div>
      <PaletteBlock blockType="var"    label="Variable"     category="var"    />
      <PaletteBlock blockType="arr"    label="Array 1D"     category="arr"    />
      <PaletteBlock blockType="mat"    label="Matriz 2D"    category="mat"    />

      <div className="sidebar-section-label">Entrada / Salida</div>
      <PaletteBlock blockType="print"  label="print"        category="print"  />
      <PaletteBlock blockType="input"  label="ask / wait"   category="input"  />

      <div className="sidebar-section-label">Sistema</div>
      <PaletteBlock blockType="sleep"  label="wait ms"      category="sleep"  />
    </div>
  </aside>
);
