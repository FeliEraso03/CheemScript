import React, { useCallback, useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { ReporterDragItem, BooleanDragItem } from '../types/ast';

interface ExpressionSlotProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  shape?: 'reporter' | 'boolean';
  categoryColor?: string;
}

export const ExpressionSlot: React.FC<ExpressionSlotProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  shape = 'reporter',
  categoryColor,
}) => {
  const [{ isOver }, drop] = useDrop<ReporterDragItem | BooleanDragItem, void, { isOver: boolean }>(() => ({
    accept: ['BLOCK_REPORTER', 'BLOCK_BOOLEAN'],
    drop: (item) => {
      const textToInsert = item.text ?? '';
      if (textToInsert) {
        onChange(textToInsert);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const containerRef = useRef<HTMLDivElement | null>(null);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      drop(node);
    },
    [drop],
  );

  if (shape === 'boolean') {
    return (
      <span
        ref={setRef}
        className={`block-shape--boolean ${isOver ? 'slot-over' : ''} ${className}`}
        style={{ borderColor: isOver ? categoryColor || 'rgba(255,255,255,0.4)' : undefined }}
      >
        <svg className="block-boolean-bg" viewBox="0 0 100 28" preserveAspectRatio="none">
          <polygon
            points="14,0 100,0 86,28 0,28"
            fill="rgba(0,0,0,0.25)"
            stroke={categoryColor || 'rgba(255,255,255,0.12)'}
            strokeWidth="1"
          />
        </svg>
        <span className="block-boolean-content">
          <input
            type="text"
            className={`block-input scratch-input scratch-input-sm ${className}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </span>
      </span>
    );
  }

  return (
    <span
      ref={setRef}
      className={`block-shape--reporter ${isOver ? 'slot-over' : ''} ${className}`}
      style={{
        borderColor: isOver ? categoryColor || 'rgba(255,255,255,0.4)' : undefined,
      }}
    >
      <input
        type="text"
        className={`block-input scratch-input scratch-input-sm ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </span>
  );
};
