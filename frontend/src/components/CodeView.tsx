import React, { useMemo, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useAST } from '../context/ASTContext';
import { generateCppCode } from '../codegen/generator';

export const CodeView: React.FC = () => {
  const { nodes, rootNodes, variables, activeBlockId, isTracingEnabled } = useAST();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  
  const { code: generatedCode, sourceMap } = useMemo(() => {
    return generateCppCode(nodes, rootNodes, variables, false);
  }, [nodes, rootNodes, variables]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    if (!activeBlockId || !isTracingEnabled) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      return;
    }
    
    const line = sourceMap[activeBlockId];
    if (line) {
      editorRef.current.revealLineInCenter(line);
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
        {
          range: new monacoRef.current.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: 'monaco-active-line',
          }
        }
      ]);
    }
  }, [activeBlockId, isTracingEnabled, sourceMap]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  return (
    <div className="editor-wrapper">
      <Editor
        height="100%"
        defaultLanguage="cpp"
        value={generatedCode}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          readOnly: true,
          fontSize: 14,
        }}
      />
    </div>
  );
};
