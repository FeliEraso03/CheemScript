import React from 'react';
import { AutocompleteInput } from './AutocompleteInput';

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
  return (
    <AutocompleteInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isVariableOnly={true}
    />
  );
};
