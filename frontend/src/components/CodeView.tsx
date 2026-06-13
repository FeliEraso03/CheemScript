import React, { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useAST } from '../context/ASTContext';
import { generateCppCode } from '../codegen/generator';

export const CodeView: React.FC = () => {
  const { nodes, rootNodes } = useAST();
  
  const generatedCode = useMemo(() => {
    return generateCppCode(nodes, rootNodes);
  }, [nodes, rootNodes]);

  return (
    <div className="editor-wrapper">
      <Editor
        height="100%"
        defaultLanguage="cpp"
        value={generatedCode}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          readOnly: true,
          fontSize: 14,
        }}
      />
    </div>
  );
};
