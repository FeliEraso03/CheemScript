import React from 'react';
import { useAST } from '../context/ASTContext';
import { buildVariableOptions } from '../types/ast';

interface VariableSelectorProps {
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
}

export const VariableSelector: React.FC<VariableSelectorProps> = ({
  value,
  onChange,
  placeholder = 'variable...',
}) => {
  const { variables } = useAST();
  const options = buildVariableOptions(variables);

  return (
    <select
      className="scratch-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {!value && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.name} value={opt.name}>{opt.label}</option>
      ))}
    </select>
  );
};
