import { validarYInferirTipo as _validarYInferir } from '../automata/afd_var_infer';

export type BlockCategory = 'if' | 'for' | 'while' | 'switch' | 'var' | 'arr' | 'mat' | 'print' | 'input' | 'sleep' | 'repeat' | 'repeatUntil' | 'say' | 'ask' | 'wait' | 'list' | 'var_new' | 'control' | 'data' | 'io' | 'time' | 'advanced';

export type DataType = 'int' | 'float' | 'double' | 'char' | 'bool' | 'string';

export type BlockShapeType = 'stack' | 'cap' | 'hat' | 'c-shape' | 'reporter' | 'boolean';

export type InferredType = 'int' | 'float' | 'double' | 'char' | 'bool' | 'string' | 'unknown';

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

export interface DragItem {
  type: 'BLOCK';
  blockType: string;
}

// Reporter blocks (oval/hexagonal) — se arrastran DENTRO de ExpressionSlots
export interface ReporterDragItem {
  type: 'BLOCK_REPORTER';
  reporterType: string; // 'variable', 'number', 'string', 'add', 'sub', etc.
  meta?: Record<string, any>;
  text: string; // Texto que se inserta al soltar (ej: "x", "42", '"hola"')
}

export interface BooleanDragItem {
  type: 'BLOCK_BOOLEAN';
  reporterType: string;
  meta?: Record<string, any>;
  text: string;
}

// Expression tree node (para futuro anidamiento de reporters)
export type ExprNode =
  | { type: 'number'; value: string }
  | { type: 'string'; value: string }
  | { type: 'variable'; name: string }
  | { type: 'add'; left: ExprNode; right: ExprNode }
  | { type: 'sub'; left: ExprNode; right: ExprNode }
  | { type: 'mul'; left: ExprNode; right: ExprNode }
  | { type: 'div'; left: ExprNode; right: ExprNode }
  | { type: 'mod'; left: ExprNode; right: ExprNode }
  | { type: 'lt'; left: ExprNode; right: ExprNode }
  | { type: 'eq'; left: ExprNode; right: ExprNode }
  | { type: 'gt'; left: ExprNode; right: ExprNode }
  | { type: 'and'; left: ExprNode; right: ExprNode }
  | { type: 'or'; left: ExprNode; right: ExprNode }
  | { type: 'not'; child: ExprNode }
  | { type: 'random'; min: ExprNode; max: ExprNode }
  | { type: 'join'; left: ExprNode; right: ExprNode }
  | { type: 'length'; child: ExprNode }
  | { type: 'listItem'; list: string; index: ExprNode }
  | { type: 'listLength'; list: string }
  | { type: 'listContains'; list: string; value: ExprNode };

export interface VariableSelectorItem {
  name: string;
  label: string;
  type: string;
}

export function buildVariableOptions(variables: Record<string, VariableInfo> | undefined): VariableSelectorItem[] {
  if (!variables) return [];
  return Object.values(variables).map(v => ({
    name: v.name,
    label: `${v.name} (${v.inferredType})`,
    type: v.inferredType,
  }));
}

export interface VariableInfo {
  name: string;
  inferredType: InferredType;
  firstValue: string;
  blockId: string;
  createdAt: number;
}

export function inferTypeFromValue(val: string): InferredType {
  return _validarYInferir(val);
}
