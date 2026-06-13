// Tipos de categorias de bloque para hacer type-safe el uso de CSS vars
export type BlockCategory = 'if' | 'for' | 'while' | 'switch' | 'var' | 'arr' | 'mat' | 'print' | 'input' | 'sleep';

export type DataType = 'int' | 'float' | 'double' | 'char' | 'bool' | 'string';

// Nodo base — todos los nodos del AST tienen id y type
export interface ASTNode {
  id: string;
  type: string;
}

export interface VarNode extends ASTNode {
  type: 'variable';
  dataType: DataType;
  name: string;
  value: string;
}

export interface ArrayNode extends ASTNode {
  type: 'array1d';
  dataType: DataType;
  name: string;
  size: string;
  values?: string;
}

export interface MatrixNode extends ASTNode {
  type: 'matrix2d';
  dataType: DataType;
  name: string;
  rows: string;
  cols: string;
}

export interface IfNode extends ASTNode {
  type: 'if';
  condition: string;
  body: ASTNode[];
  elseIfs?: { condition: string; body: ASTNode[] }[];
  elseBody?: ASTNode[];
}

export interface ForNode extends ASTNode {
  type: 'for';
  init: { dataType: DataType; name: string; value: string };
  condition: { left: string; op: string; right: string };
  increment: { variable: string; op: '++' | '--' };
  body: ASTNode[];
}

export interface WhileNode extends ASTNode {
  type: 'while';
  condition: string;
  body: ASTNode[];
}

export interface SwitchNode extends ASTNode {
  type: 'switch';
  variable: string;
  cases: { value: string; body: ASTNode[] }[];
  defaultBody?: ASTNode[];
}

export type CheemScriptNode =
  | VarNode
  | ArrayNode
  | MatrixNode
  | IfNode
  | ForNode
  | WhileNode
  | SwitchNode;

// Item del drag and drop
export interface DragItem {
  type: 'BLOCK';
  blockType: string;
}
