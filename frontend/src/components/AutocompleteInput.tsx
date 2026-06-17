import React, { useState, useRef, useEffect } from 'react';
import { useAST } from '../context/ASTContext';

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  isVariableOnly?: boolean;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  style,
  isVariableOnly = false
}) => {
  const { variables } = useAST();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract unique variable names
  const varNames = Array.from(new Set(Object.values(variables).map(v => v.name)));
  
  // Get the last word of the input string
  const words = value.split(/[^a-zA-Z0-9_]/);
  const activeWord = words[words.length - 1] || '';

  // Check if current position is inside quotes to avoid showing autocomplete inside string literals
  const doubleQuotesCount = (value.match(/"/g) || []).length;
  const singleQuotesCount = (value.match(/'/g) || []).length;
  const insideString = (doubleQuotesCount % 2 === 1) || (singleQuotesCount % 2 === 1);

  // Filter variables that match the active word (case insensitive)
  // If activeWord is empty, we only show all variables if value is empty or ends with a space/operator
  const shouldShowAll = value.trim() === '' || /[^a-zA-Z0-9_]\s*$/.test(value);
  
  const filtered = insideString ? [] : varNames.filter(name => {
    if (isVariableOnly) {
      if (activeWord === '' || varNames.includes(value)) {
        return true;
      }
      return name.toLowerCase().includes(activeWord.toLowerCase());
    }

    if (activeWord === '') {
      return shouldShowAll;
    }
    return name.toLowerCase().includes(activeWord.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSelectSuggestion = (suggestion: string) => {
    const lastWordIndex = value.lastIndexOf(activeWord);
    let newValue = value;
    if (lastWordIndex !== -1 && activeWord !== '') {
      newValue = value.substring(0, lastWordIndex) + suggestion;
    } else {
      newValue = value + suggestion;
    }
    onChange(newValue);
    setShowSuggestions(false);
  };

  return (
    <div className="autocomplete-container" ref={containerRef} style={{ ...style }}>
      <textarea
        ref={inputRef}
        className={`block-input scratch-input ${className}`}
        value={value}
        style={{ resize: 'none', overflow: 'hidden', minHeight: '32px', lineHeight: '1.4' }}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); // Prevent multiline enters
          }
        }}
      />
      {showSuggestions && filtered.length > 0 && (
        <ul className="autocomplete-list">
          {filtered.map(name => (
            <li 
              key={name}
              className="autocomplete-item"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevents input onBlur from firing before onClick
                handleSelectSuggestion(name);
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
