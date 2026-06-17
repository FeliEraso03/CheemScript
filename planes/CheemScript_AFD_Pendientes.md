# Bloques Pendientes de Validacion por Automata — CheemScript

## Estado actual (automata existentes)

| Archivo | Proposito |
|---------|-----------|
| `afd_if.ts` | Estructura `if/else if/else` (token secuencial) |
| `afd_print.ts` | Argumentos de `print` (cadena, ID, numero, concatenacion) |
| `afd_var_infer.ts` | Inferencia de tipos, nombres de variable, tamanos, listas, amounts |
| `afd_expr.ts` | Expresiones de comparacion simples (`i < 10`) |
| `lexer_expr.ts` + `parser_expr.ts` | PDA de expresiones booleanas completas |

---

## 1. `for` — bucle clasico C++

### Archivo del bloque
`frontend/src/blocks/ForBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  init: string,       // "int i = 0"
  condition: string,  // "i < 10"
  increment: string   // "i++"
}
node.children = {
  body: string[]      // bloques hijos
}
```

### Codigo C++ generado (`generator.ts:65-76`)
```typescript
case 'for': {
  const init = node.data.init ?? 'int i = 0';
  const condition = node.data.condition ?? 'i < 10';
  const increment = node.data.increment ?? 'i++';
  code += `${indent}for (${init}; ${condition}; ${increment}) {\n`;
  // hijos...
  code += `${indent}}\n`;
  break;
}
// Genera:
// for (int i = 0; i < 10; i++) {
//     ...
// }
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `init` | `tipo id = valor;` o `id = valor` sin punto y coma | `int i = 0`, `i = 0` |
| `condition` | expresion booleana (reutilizar `parser_expr.ts`) | `i < n`, `i < 10 && x > 0` |
| `increment` | `id++`, `id--`, `id += N`, `++id`, `--id` | `i++`, `i += 2`, `++i` |

### Automata necesario: `afd_for.ts`
- **AFD para `init`**: validar declaracion C++ de variable o asignacion
- **AFD para `condition`**: reutilizar `validarExpr` de `parser_expr.ts`
- **AFD para `increment`**: validar expresion de incremento/decremento

---

## 2. `while` — bucle clasico C++

### Archivo del bloque
`frontend/src/blocks/WhileBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  condition: string  // "x < 10"
}
node.children = {
  body: string[]
}
```

### Codigo C++ generado (`generator.ts:77-86`)
```typescript
case 'while': {
  const condition = node.data.condition ?? 'true';
  code += `${indent}while (${condition}) {\n`;
  // hijos...
  code += `${indent}}\n`;
  break;
}
// Genera:
// while (x < 10) {
//     ...
// }
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `condition` | expresion booleana (reutilizar `parser_expr.ts`) | `x > 0`, `estaActivo`, `!(x == 0)` |

### Automata necesario: `afd_while.ts`
- Muy simple: reutiliza `validarExpr` de `parser_expr.ts` para la condicion
- Podria ser una validacion inline en el bloque en lugar de un AFD separado

---

## 3. `switch / case` — seleccion multiple

### Archivo del bloque
`frontend/src/blocks/SwitchBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  variable: string   // "opcion"
}
node.children = {
  body: string[]     // los bloques case se ponen como hijos
}
```

### Codigo C++ generado (`generator.ts:87-96`)
```typescript
case 'switch': {
  const variable = node.data.variable ?? 'val';
  code += `${indent}switch (${variable}) {\n`;
  // hijos (cada case block)...
  code += `${indent}}\n`;
  break;
}
// Genera:
// switch (opcion) {
//     ...
// }
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `variable` | identificador valido (`afd_id`) | `opcion`, `menu`, `tecla` |

### Automata necesario: `afd_switch.ts`
- Validar que `variable` sea un identificador valido
- Validar estructura interna de los `case` (cada `case valor:` debe tener un valor literal y un cuerpo)
- El Alfabeto seria: `case`, `default`, `break`, `VALOR`, `INSTR`, `:`

---

## 4. `repeat` — repetir N veces (Scratch-style)

### Archivo del bloque
`frontend/src/blocks/RepeatBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  count: string   // "10"
}
node.children = {
  body: string[]
}
```

### Codigo C++ generado (`generator.ts:141-149`)
```typescript
case 'repeat': {
  const count = node.data.count ?? '10';
  code += `${indent}for (int _i_${nodeId} = 0; _i_${nodeId} < ${count}; _i_${nodeId}++) {\n`;
  // hijos...
  code += `${indent}}\n`;
  break;
}
// Genera:
// for (int _i_abc123 = 0; _i_abc123 < 10; _i_abc123++) {
//     ...
// }
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `count` | entero positivo, o ID de variable, o expresion numerica | `10`, `n`, `n * 2` |

### Automata necesario: `afd_repeat.ts`
- AFD para `count`: entero positivo (`AFD5` reutilizado) o identificador de variable numerica

---

## 5. `repeatUntil` — repetir hasta que (Scratch-style)

### Archivo del bloque
`frontend/src/blocks/RepeatUntilBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  condition: string   // "x > 10"
}
node.children = {
  body: string[]
}
```

### Codigo C++ generado (`generator.ts:151-159`)
```typescript
case 'repeatUntil': {
  const conditionRU = node.data.condition ?? 'true';
  code += `${indent}while (!(${conditionRU})) {\n`;
  // hijos...
  code += `${indent}}\n`;
  break;
}
// Genera:
// while (!(x > 10)) {
//     ...
// }
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `condition` | expresion booleana (reutilizar `parser_expr.ts`) | `x > 10`, `respuesta == "si"` |

### Automata necesario: `afd_repeatUntil.ts`
- Reutiliza `validarExpr` de `parser_expr.ts`

---

## 6. `input` — entrada por consola (C++ cin)

### Archivo del bloque
`frontend/src/blocks/InputBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  question: string   // '"Ingrese un numero: "'
  variable: string   // "x"
}
```

### Codigo C++ generado (`generator.ts:134-140`)
```typescript
case 'input': {
  const question = node.data.question ?? '';
  const variable = node.data.variable ?? '';
  code += `${indent}cout << ${question};\n`;
  code += `${indent}cin >> ${variable};\n`;
  break;
}
// Genera:
// cout << "Ingrese un numero: ";
// cin >> x;
```

### Validacion actual (inline en el bloque)
```typescript
import { esString, validarNombreVariable } from '../automata/afd_var_infer';
const validationQuestion = esString(question);
const validationVar = validarNombreVariable(variable);
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `question` | string literal entre comillas dobles | `"Ingrese edad: "` |
| `variable` | identificador valido (no reservado) | `edad`, `nombre`, `respuesta` |

### Automata necesario: `afd_input.ts`
- AFD combinado que valida `question` como string literal Y `variable` como ID
- Alfabeto: `STRING`, `ID`

---

## 7. `ask` — preguntar y guardar respuesta (Scratch-style)

### Archivo del bloque
`frontend/src/blocks/AskBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  question: string   // '"Como te llamas?"'
  variable: string   // "nombre"
}
```

### Codigo C++ generado (`generator.ts:169-175`)
```typescript
case 'ask': {
  const qAsk = node.data.question ?? '';
  const varAsk = node.data.variable ?? 'respuesta';
  code += `${indent}cout << ${qAsk} << endl;\n`;
  code += `${indent}cin >> ${varAsk};\n`;
  break;
}
// Genera:
// cout << "Como te llamas?" << endl;
// cin >> nombre;
```

### Validacion actual (inline en el bloque)
```typescript
import { esString, validarNombreVariable } from '../automata/afd_var_infer';
const validationQuestion = esString(question);
const validationVar = validarNombreVariable(variable);
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `question` | string literal entre comillas dobles | `"Cuantos anyos tienes?"` |
| `variable` | identificador valido | `edad`, `respuesta` |

### Automata necesario: `afd_ask.ts`
- Identico en estructura a `afd_input.ts`
- Podria compartir automata (los bloque input y ask se diferencian en que ask anyade `<< endl`)

---

## 8. `say` — decir con duracion (Scratch-style)

### Archivo del bloque
`frontend/src/blocks/SayBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  value: string     // '"hola" o variable'
  duration: string  // "2"
}
```

### Codigo C++ generado (`generator.ts:161-168`)
```typescript
case 'say': {
  const valSay = node.data.value ?? '';
  const durSay = node.data.duration ?? '2';
  const cppValSay = printValueToCpp(valSay);
  code += `${indent}cout << ${cppValSay} << endl;\n`;
  code += `${indent}this_thread::sleep_for(chrono::seconds(${durSay}));\n`;
  break;
}
// Genera:
// cout << "hola" << endl;
// this_thread::sleep_for(chrono::seconds(2));
```

### Validacion actual (inline en el bloque)
```typescript
import { validarAmount } from '../automata/afd_var_infer';
import { validarPrintValue } from '../automata/afd_print';
const validationVal = validarPrintValue(value);
const validationDuration = validarAmount(duration);
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `value` | string, ID, NUM o concatenacion (reutilizar `afd_print`) | `"Hola " + nombre` |
| `duration` | entero positivo o decimal | `2`, `1.5`, `3` |

### Automata necesario: `afd_say.ts`
- Para `value`: reutiliza `validarPrintValue` de `afd_print.ts`
- Para `duration`: reutiliza `validarAmount` de `afd_var_infer.ts`

---

## 9. `wait` — esperar segundos/milisegundos (Scratch-style)

### Archivo del bloque
`frontend/src/blocks/WaitBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  duration: string  // "1"
  unit: string      // "s" | "ms"
}
```

### Codigo C++ generado (`generator.ts:176-184`)
```typescript
case 'wait': {
  const durWait = node.data.duration ?? '1';
  const unitWait = node.data.unit ?? 's';
  if (unitWait === 's') {
    code += `${indent}this_thread::sleep_for(chrono::seconds(${durWait}));\n`;
  } else {
    code += `${indent}this_thread::sleep_for(chrono::milliseconds(${durWait}));\n`;
  }
  break;
}
// Genera:
// this_thread::sleep_for(chrono::seconds(1));
// this_thread::sleep_for(chrono::milliseconds(500));
```

### Validacion actual (inline en el bloque)
```typescript
import { validarAmount } from '../automata/afd_var_infer';
const validationDuration = validarAmount(duration);
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `duration` | entero positivo o decimal | `1`, `0.5`, `100`, `n` |
| `unit` | selector fijo (`"s"` / `"ms"`) | sin validacion (dropdown) |

### Automata necesario: `afd_wait.ts`
- Para `duration`: reutiliza `validarAmount` de `afd_var_infer.ts` (entero positivo preferido, pero acepta decimal)
- Para `unit`: valor fijo de dropdown (no necesita AFD)

---

## 10. `sleep` — wait ms (C++ avanzado)

### Archivo del bloque
`frontend/src/blocks/SleepBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  duration: string  // "1000"
}
```

### Codigo C++ generado (`generator.ts:214-218`)
```typescript
case 'sleep': {
  const duration = node.data.duration ?? '1000';
  code += `${indent}this_thread::sleep_for(chrono::milliseconds(${duration}));\n`;
  break;
}
// Genera:
// this_thread::sleep_for(chrono::milliseconds(1000));
```

### Validacion actual (inline en el bloque)
```typescript
import { validarAmount } from '../automata/afd_var_infer';
const validationDuration = validarAmount(duration);
```

### Campos que requieren validacion

| Campo | Patron esperado | Ejemplo |
|-------|-----------------|---------|
| `duration` | entero positivo | `1000`, `500`, `2000` |

### Automata necesario: `afd_sleep.ts`
- Para `duration`: entero positivo (`AFD5` reutilizado) o variable

---

## 11. `var_new` — crear variable con inferencia (Scratch-style)

### Archivo del bloque
`frontend/src/blocks/VarBlockNew.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  name: string   // "x"
  value: string  // "42"
}
```

### Codigo C++ generado (`generator.ts:202-213`)
```typescript
case 'var_new': {
  const nameV = node.data.name ?? 'x';
  const valueV = node.data.value ?? '0';
  const inferredType = validarYInferirTipo(valueV);
  if (inferredType === 'unknown') {
    console.warn(`...se usara int como fallback`);
    code += `${indent}int ${nameV} = ${valueV};\n`;
  } else {
    code += `${indent}${inferredType} ${nameV} = ${valueV};\n`;
  }
  break;
}
// Genera:
// int x = 42;
// string nombre = "Felipe";
```

### Estado del automata
- **Nombre**: usa `validarNombreVariable` de `afd_var_infer.ts` (ya implementado como AFD)
- **Valor**: usa `validarYInferirTipo` de `afd_var_infer.ts` (ya implementado como AFD)
- **No tiene AFD de estructura propio** — la validacion se hace inline

### Automata necesario: `afd_var_new.ts`
- AFD que valide la tupla `(nombre, valor)` completa
- Alfabeto: `ID`, `LITERAL_INT`, `LITERAL_DOUBLE`, `LITERAL_BOOL`, `LITERAL_STRING`, `LITERAL_CHAR`

---

## 12. `var` — crear variable con tipo explicito (C++ avanzado)

### Archivo del bloque
`frontend/src/blocks/VarBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  dataType: string   // "int" | "float" | "double" | "char" | "bool" | "string"
  name: string       // "x"
  value: string      // "42"
}
```

### Codigo C++ generado (`generator.ts:97-107`)
```typescript
case 'var': {
  const dataType = node.data.dataType ?? 'int';
  const name = node.data.name ?? 'x';
  const val = node.data.value ?? '0';
  let formattedVal = val;
  if (dataType === 'string' && !val.startsWith('"') && !val.endsWith('"')) {
    formattedVal = `"${val}"`;
  }
  code += `${indent}${dataType} ${name} = ${formattedVal};\n`;
  break;
}
// Genera:
// int x = 42;
// string nombre = "Felipe";
```

### Estado del automata
- **Nombre**: `validarNombreVariable` de `afd_var_infer.ts`
- **Valor**: `validarValorTipado` de `afd_var_infer.ts` (valida compatibilidad tipo/valor)
- **dataType**: selector fijo (dropdown, no necesita AFD)

---

## 13. `set_var` — asignar variable

### Archivo del bloque
`frontend/src/blocks/SetVarBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  variable: string  // "x" (seleccionado de dropdown)
  value: string     // "42" o expresion
}
```

### Codigo C++ generado (`generator.ts:219-224`)
```typescript
case 'set_var': {
  const varName = node.data.variable ?? '';
  const val = node.data.value ?? '';
  code += `${indent}${varName} = ${val};\n`;
  break;
}
// Genera:
// x = 42;
// nombre = "Ana";
```

### Estado del automata
- **variable**: `VariableSelector` (dropdown con variables registradas, no necesita AFD)
- **value**: `validarValorAsignacion` de `afd_var_infer.ts`

---

## 14. `change_var` — cambiar variable en N

### Archivo del bloque
`frontend/src/blocks/ChangeVarBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  variable: string  // "x"
  amount: string    // "5"
}
```

### Codigo C++ generado (`generator.ts:225-230`)
```typescript
case 'change_var': {
  const cvName = node.data.variable ?? '';
  const amt = node.data.amount ?? '1';
  code += `${indent}${cvName} += ${amt};\n`;
  break;
}
// Genera:
// x += 5;
// contador += paso;
```

### Estado del automata
- **variable**: `VariableSelector` (dropdown)
- **amount**: `validarAmount` de `afd_var_infer.ts`

---

## 15. `show_var` — mostrar variable

### Archivo del bloque
`frontend/src/blocks/ShowVarBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  variable: string  // "x"
}
```

### Codigo C++ generado (`generator.ts:231-235`)
```typescript
case 'show_var': {
  const svName = node.data.variable ?? '';
  code += `${indent}cout << ${svName} << endl;\n`;
  break;
}
// Genera:
// cout << x << endl;
```

### Estado del automata
- **variable**: `VariableSelector` (dropdown)
- No necesita AFD propio

---

## 16. `arr` — array 1D

### Archivo del bloque
`frontend/src/blocks/ArrayBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  dataType: string  // "int"
  name: string      // "arr"
  size: string      // "5"
  values: string    // "1, 2, 3, 4, 5"
}
```

### Codigo C++ generado (`generator.ts:108-119`)
```typescript
case 'arr': {
  const dataType = node.data.dataType ?? 'int';
  const name = node.data.name ?? 'arr';
  const size = node.data.size ?? '5';
  const values = node.data.values ?? '';
  if (values.trim()) {
    code += `${indent}${dataType} ${name}[${size}] = {${values}};\n`;
  } else {
    code += `${indent}${dataType} ${name}[${size}];\n`;
  }
  break;
}
// Genera:
// int arr[5] = {1, 2, 3, 4, 5};
// int arr[5];
```

### Estado del automata
- **name**: `validarNombreVariable` de `afd_var_infer.ts`
- **size**: `validarTamanio` de `afd_var_infer.ts` (entero positivo)
- **values**: `validarListaValores` de `afd_var_infer.ts`

---

## 17. `mat` — matriz 2D

### Archivo del bloque
`frontend/src/blocks/MatrixBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  dataType: string  // "int"
  name: string      // "mat"
  rows: string      // "3"
  cols: string      // "4"
}
```

### Codigo C++ generado (`generator.ts:120-127`)
```typescript
case 'mat': {
  const dataType = node.data.dataType ?? 'int';
  const name = node.data.name ?? 'mat';
  const rows = node.data.rows ?? '3';
  const cols = node.data.cols ?? '3';
  code += `${indent}${dataType} ${name}[${rows}][${cols}];\n`;
  break;
}
// Genera:
// int mat[3][4];
```

### Estado del automata
- **name**: `validarNombreVariable` de `afd_var_infer.ts`
- **rows**: `validarTamanio` de `afd_var_infer.ts`
- **cols**: `validarTamanio` de `afd_var_infer.ts`

---

## 18. `list` — crear lista (vector)

### Archivo del bloque
`frontend/src/blocks/ListBlock.tsx`

### Estructura del nodo AST
```typescript
node.data = {
  name: string    // "lista"
  values: string  // "1, 2, 3"
}
```

### Codigo C++ generado (`generator.ts:186-201`)
```typescript
case 'list': {
  const nameList = node.data.name ?? 'lista';
  const valuesList = node.data.values ?? '';
  const elements = valuesList ? valuesList.split(',').map(s => s.trim()).filter(Boolean) : [];
  let listType = 'int';
  if (elements.length > 0) {
    const t = validarYInferirTipo(elements[0]);
    listType = t === 'unknown' ? 'int' : t;
  }
  if (elements.length > 0) {
    code += `${indent}vector<${listType}> ${nameList} = {${valuesList}};\n`;
  } else {
    code += `${indent}vector<${listType}> ${nameList};\n`;
  }
  break;
}
// Genera:
// vector<int> lista = {1, 2, 3};
```

### Estado del automata
- **name**: `validarNombreVariable` de `afd_var_infer.ts`
- **values**: `validarListaValores` de `afd_var_infer.ts`

---

## 19. `print` — cout (ya tiene AFD completo)

### Archivo del bloque
`frontend/src/blocks/PrintBlock.tsx`

### Automata existente: `afd_print.ts`
- `afd_string`: cadena literal entre comillas dobles
- `afd_id`: identificador valido
- `afd_num`: numero entero o decimal
- `afd_print`: expresion de concatenacion `ATOM ('+' ATOM)*`

---

## 20. `if / else if / else` (ya tiene AFD completo)

### Archivo del bloque
`frontend/src/blocks/IfBlock.tsx`

### Automata existente: `afd_if.ts`
- Valida estructura completa: `if (EXPR) { INSTR* } (else if (EXPR) { INSTR* })* (else { INSTR* })?`

---

## Resumen de automatas pendientes

### Automatas de estructura (orden sugerido de implementacion)

| # | Automata | Archivo destino | Bloques que cubre | Prioridad |
|---|----------|-----------------|-------------------|-----------|
| 1 | `afd_repeat.ts` | `frontend/src/automata/afd_repeat.ts` | `repeat` | ★★★★★ |
| 2 | `afd_for.ts` | `frontend/src/automata/afd_for.ts` | `for` | ★★★★☆ |
| 3 | `afd_while.ts` | `frontend/src/automata/afd_while.ts` | `while`, `repeatUntil` | ★★★★☆ |
| 4 | `afd_wait.ts` | `frontend/src/automata/afd_wait.ts` | `wait`, `sleep` | ★★★★☆ |
| 5 | `afd_input.ts` | `frontend/src/automata/afd_input.ts` | `input`, `ask` | ★★★☆☆ |
| 6 | `afd_say.ts` | `frontend/src/automata/afd_say.ts` | `say` | ★★★☆☆ |
| 7 | `afd_switch.ts` | `frontend/src/automata/afd_switch.ts` | `switch` | ★★★☆☆ |
| 8 | `afd_var_new.ts` | `frontend/src/automata/afd_var_new.ts` | `var_new`, `var` | ★★☆☆☆ |
| 9 | `validator.ts` | `frontend/src/automata/validator.ts` | Todos (orquestador) | ★★★★★ |

### Automatas de campo (ya existen como funciones en `afd_var_infer.ts` y `afd_print.ts`)

| Funcion | Archivo | Equivalente AFD |
|---------|---------|-----------------|
| `validarNombreVariable` | `afd_var_infer.ts` | AFD1 — identificadores |
| `validarYInferirTipo` | `afd_var_infer.ts` | AFD3 — literales numericos |
| `validarTamanio` | `afd_var_infer.ts` | AFD5 — tamanos enteros |
| `validarListaValores` | `afd_var_infer.ts` | AFD compuesto (lista de AFD3) |
| `validarAmount` | `afd_var_infer.ts` | AFD3 + AFD1 |
| `validarValorAsignacion` | `afd_var_infer.ts` | AFD1 + AFD3 |
| `validarPrintValue` | `afd_print.ts` | AFD4 — concatenacion |
| `validarExpr` | `parser_expr.ts` | PDA de expresiones booleanas |

## Orquestador global: `validator.ts`

Fichero unico que centraliza todas las validaciones. Por cada bloque, llama al AFD correspondiente y devuelve un resultado unificado:

```typescript
export interface ValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
}

export function validateBlock(node: UINode): ValidationResult {
  switch (node.type) {
    case 'if':     return validateIf(node);
    case 'for':    return validateFor(node);
    case 'while':  return validateWhile(node);
    case 'repeat': return validateRepeat(node);
    // ... etc
  }
}
```

Esto permite que los bloques React solo llamen a `validateBlock(node)` sin importar funciones especificas de cada automata.

---

*CheemScript · Documento tecnico — Bloques pendientes de validacion por automata*
