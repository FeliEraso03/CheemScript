import React from 'react';
import type { BlockShapeType } from '../types/ast';

interface BlockShapeProps {
  shape: BlockShapeType;
  children: React.ReactNode;
}

export const BlockShape: React.FC<BlockShapeProps> = ({ shape, children }) => {
  if (shape === 'c-shape') {
    return (
      <div className="block-shape block-shape--c">
        <svg className="block-c-svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M6 2h88a4 4 0 0 1 4 4v88a4 4 0 0 1-4 4H6" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
        </svg>
        {children}
      </div>
    );
  }

  if (shape === 'reporter') {
    return (
      <span className="block-shape--reporter">
        {children}
      </span>
    );
  }

  if (shape === 'boolean') {
    return (
      <span className="block-shape--boolean">
        <svg className="block-boolean-bg" width="100%" height="100%" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="16,2 104,2 118,16 104,30 16,30 2,16" fill="rgba(0,0,0,0.25)" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
        </svg>
        <span className="block-boolean-content">{children}</span>
      </span>
    );
  }

  return <>{children}</>;
};
