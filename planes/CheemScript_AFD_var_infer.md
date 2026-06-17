# AFD de variables — CheemScript

## Bloques cubiertos

| Bloque | Tipo AST | Genera C++ |
|--------|----------|------------|
| crear variable (Scratch) | `var_new` | `tipo nombre = valor;` (tipo inferido) |
| crear variable (C++) | `var` | `tipo nombre = valor;` (tipo explícito) |
| asignar variable | `set_var` | `nombre = valor;` |
| cambiar variable en N | `change_var` | `nombre += N;` |
| mostrar variable | `show_var` | `cout << nombre << endl;` |

---

## Qué necesita validarse en cada bloque

### `var_new` — crear variable (Scratch-style)

```
nombre : identificador válido         → afd_id
valor  : literal (int, double, bool, string, char)
         o expresión aritmética       → afd_valor_literal + inferTypeFromValue
tipo   : inferido automáticamente     → no lo ingresa el usuario
```

El tipo se infiere con `inferTypeFromValue(value)`. Si devuelve `'unknown'`, el
generador hace fallback a `int` con `console.warn`.

### `var` — crear variable (C++ explícito)

```
nombre   : identificador válido       → afd_id
dataType : 'int'|'float'|'double'|'char'|'bool'|'string'  → selector fijo (sin AFD)
valor    : literal compatible con el tipo declarado         → afd_valor_tipado
```

Aquí el tipo no se infiere — lo elige el usuario. El AFD debe verificar que el
valor sea compatible con el tipo elegido.

### `set_var` — asignar

```
variable : nombre de variable existente (VariableSelector)  → afd_id
valor    : expresión aritmética o literal                   → afd_valor_expr
```

### `change_var` — cambiar en N

```
variable : nombre de variable existente  → afd_id
amount   : número entero o decimal       → afd_num (reutilizado de afd_print)
```

### `show_var` — mostrar

```
variable : nombre de variable existente  → afd_id (ya validado por VariableSelector)
```

`show_var` no necesita AFD propio — `VariableSelector` solo expone variables
registradas, el campo no es texto libre.

---

## AFD 1 — Valor literal con inferencia (`var_new`)

Reconoce los literales que `inferTypeFromValue` puede clasificar.

### Tipos reconocidos

| Patrón | Tipo inferido |
|--------|---------------|
| `42`, `-7`, `0` | `int` |
| `3.14`, `-0.5`, `1.0` | `double` |
| `true`, `false` | `bool` |
| `"..."` | `string` |
| `'a'`, `'\n'` | `char` |
| cualquier otra cosa | `unknown` → fallback `int` |

### Alfabeto

```
Σ_val = { DIGITO, SIGNO, PUNTO, COMILLA_D, COMILLA_S, LETRA, CHAR, BARRA, ESC_SEQ }

SIGNO    = '+' | '-'
DIGITO   = [0-9]
PUNTO    = '.'
COMILLA_D = '"'
COMILLA_S = '\''
LETRA    = [a-zA-Z_]
```

### Sub-AFD: entero con signo opcional

```
Estados: v_int_0, v_int_signo, v_int_digito, vERR
F = { v_int_digito }
```

| Estado | SIGNO | DIGITO | otro |
|---|---|---|---|
| v_int_0 | v_int_signo | v_int_digito | vERR |
| v_int_signo | vERR | v_int_digito | vERR |
| v_int_digito | vERR | v_int_digito | vERR |

### Sub-AFD: double (extiende el entero con punto decimal)

```
Estados: v_dbl_0, v_dbl_signo, v_dbl_entero, v_dbl_punto, v_dbl_decimal, vERR
F = { v_dbl_decimal }
```

| Estado | SIGNO | DIGITO | PUNTO | otro |
|---|---|---|---|---|
| v_dbl_0 | v_dbl_signo | v_dbl_entero | vERR | vERR |
| v_dbl_signo | vERR | v_dbl_entero | vERR | vERR |
| v_dbl_entero | vERR | v_dbl_entero | v_dbl_punto | vERR |
| v_dbl_punto | vERR | v_dbl_decimal | vERR | vERR |
| v_dbl_decimal | vERR | v_dbl_decimal | vERR | vERR |

> El entero y el double comparten prefijo. En la implementación se corre primero
> el intento de double; si no hay punto, se valida como int.

### Sub-AFD: bool

```
Tokens: secuencia de LETRA que forma "true" o "false"
```

Implementado como comparación directa de string (no vale la pena un AFD de 5-6 estados
para dos palabras fijas):

```typescript
function esBool(s: string): boolean {
  return s === 'true' || s === 'false';
}
```

### Sub-AFD: string literal

Reutiliza `afd_string` del documento `CheemScript_AFD_string_print.md`.

### Sub-AFD: char literal

```
Estados: ch0, ch_abre, ch_char, ch_escape, ch_contenido, ch_cierra, chERR
F = { ch_cierra }
```

| Estado | `'` | CHAR | `\` | ESC_SEQ | otro |
|---|---|---|---|---|---|
| ch0 | ch_abre | chERR | chERR | chERR | chERR |
| ch_abre | chERR | ch_contenido | ch_escape | chERR | chERR |
| ch_escape | chERR | chERR | chERR | ch_contenido | chERR |
| ch_contenido | ch_cierra | chERR | chERR | chERR | chERR |
| ch_cierra | chERR | chERR | chERR | chERR | chERR |

Diagrama:

```
        '         CHAR|\      ESC_SEQ    '
  ch0 ──► ch_abre ──────► ch_escape ──► ch_contenido ──► ch_cierra (✓)
               │                             ▲
               └──── CHAR (no \) ────────────┘
```

### Implementación TypeScript

```typescript
// ── Tipos ────────────────────────────────────────────────────────────────────

type TokenValor =
  | { tipo: 'DIGITO';    valor: string }
  | { tipo: 'SIGNO';     valor: '+' | '-' }
  | { tipo: 'PUNTO' }
  | { tipo: 'COMILLA_D' }  // "
  | { tipo: 'COMILLA_S' }  // '
  | { tipo: 'LETRA';     valor: string }
  | { tipo: 'CHAR';      valor: string }
  | { tipo: 'BARRA' }
  | { tipo: 'ESC_SEQ';   valor: string };

// ── Sub-validadores ───────────────────────────────────────────────────────────

function esEntero(raw: string): boolean {
  return /^[+-]?\d+$/.test(raw.trim());
}

function esDouble(raw: string): boolean {
  return /^[+-]?\d+\.\d+$/.test(raw.trim());
}

function esBool(raw: string): boolean {
  return raw.trim() === 'true' || raw.trim() === 'false';
}

function esChar(raw: string): boolean {
  // '  x  '  o  '  \n  '  (un solo carácter o secuencia de escape)
  return /^'([^\\']|\\[ntr\\'"0])'\s*$/.test(raw.trim());
}

// esString reutiliza la lógica de afd_string (ver afd_string_print.md)
function esString(raw: string): boolean {
  const s = raw.trim();
  if (!s.startsWith('"') || !s.endsWith('"') || s.length < 2) return false;
  // Verificar escapes internos: recorrer sin comillas envolventes
  const inner = s.slice(1, -1);
  let i = 0;
  while (i < inner.length) {
    if (inner[i] === '"') return false;     // comilla sin escapar
    if (inner[i] === '\\') {
      i++;
      if (!'\\"ntr0'.includes(inner[i])) return false; // escape inválido
    }
    i++;
  }
  return true;
}

// ── Función principal de inferencia + validación ──────────────────────────────

type InferredType = 'int' | 'double' | 'bool' | 'string' | 'char' | 'unknown';

function validarYInferirTipo(raw: string): InferredType {
  if (raw.trim() === '') return 'unknown';
  if (esBool(raw))   return 'bool';
  if (esChar(raw))   return 'char';
  if (esString(raw)) return 'string';
  if (esDouble(raw)) return 'double';
  if (esEntero(raw)) return 'int';
  return 'unknown';
}
```

---

## AFD 2 — Valor tipado explícito (`var`)

Cuando el usuario elige el tipo manualmente, el valor debe ser compatible.

### Tabla de compatibilidad

| Tipo elegido | Valores aceptados | Validador |
|---|---|---|
| `int` | `42`, `-7`, `0` | `esEntero` |
| `float` / `double` | `3.14`, `-0.5`, `42` (entero también válido) | `esDouble \|\| esEntero` |
| `bool` | `true`, `false` | `esBool` |
| `string` | `"texto"`, `""` | `esString` |
| `char` | `'a'`, `'\n'` | `esChar` |

### Implementación TypeScript

```typescript
type TipoExplicito = 'int' | 'float' | 'double' | 'char' | 'bool' | 'string';

function validarValorTipado(tipo: TipoExplicito, raw: string): boolean {
  switch (tipo) {
    case 'int':                return esEntero(raw);
    case 'float':
    case 'double':             return esDouble(raw) || esEntero(raw);
    case 'bool':               return esBool(raw);
    case 'string':             return esString(raw);
    case 'char':               return esChar(raw);
  }
}
```

---

## AFD 3 — Expresión de valor para `set_var` y `change_var`

`set_var` acepta cualquier expresión válida como valor derecho:
literal, variable, o expresión aritmética.

`change_var` acepta solo un número (el delta de `+=`), que puede ser
entero, decimal o una variable numérica.

### Para `set_var` — valor

Reutiliza `validarPrintValue` del documento `afd_string_print.md`, que ya maneja:
- literales de cualquier tipo
- identificadores de variable
- concatenaciones con `+` (relevante para string)

Para valores numéricos o mixtos, el campo usa `ExpressionSlot` que acepta
reporters del árbol de expresiones — no requiere AFD adicional, la validación
semántica la hace el árbol.

### Para `change_var` — delta (amount)

```
AMOUNT ::= [+-]? DIGITO+ ('.' DIGITO+)?   -- número literal
         | ID                              -- variable numérica
```

```typescript
function validarAmount(raw: string): boolean {
  const s = raw.trim();
  return esEntero(s) || esDouble(s) || /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s);
}
```

---

## AFD 4 — Nombre de variable (`afd_id`, reutilizado)

Todos los bloques de variable usan el mismo validador de identificador
definido en `afd_string_print.md`:

```
LETRA (LETRA | DIGITO | _)*

donde LETRA = [a-zA-Z_]
      DIGITO = [0-9]
```

```typescript
function validarNombre(raw: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(raw.trim());
}
```

Restricción adicional: el nombre no debe ser una palabra reservada de C++.

```typescript
const RESERVED_CPP = new Set([
  'int','float','double','char','bool','string','void','return',
  'if','else','for','while','do','switch','case','break','continue',
  'true','false','nullptr','class','struct','enum','namespace',
  'cout','cin','endl','auto','const','static'
]);

function validarNombreVariable(raw: string): boolean {
  const s = raw.trim();
  return validarNombre(s) && !RESERVED_CPP.has(s);
}
```

---

## Diagrama general del pipeline por bloque

### `var_new`

```
┌─────────────┐        ┌────────────────────────────┐
│ nombre      │──────► │ validarNombreVariable()     │──► ✓/✗
└─────────────┘        └────────────────────────────┘

┌─────────────┐        ┌────────────────────────────┐        ┌──────────────┐
│ valor       │──────► │ validarYInferirTipo()       │──────► │ tipo inferido│
└─────────────┘        │ bool > char > string >      │        │ badge en UI  │
                       │ double > int > unknown      │        └──────────────┘
                       └────────────────────────────┘
```

### `var`

```
┌─────────────┐        ┌────────────────────────────┐
│ nombre      │──────► │ validarNombreVariable()     │──► ✓/✗
└─────────────┘        └────────────────────────────┘

┌─────────────┐
│ tipo        │──────► selector fijo (int/float/double/char/bool/string)
└─────────────┘

┌─────────────┐        ┌────────────────────────────┐
│ valor       │──────► │ validarValorTipado(tipo, v) │──► ✓/✗
└─────────────┘        └────────────────────────────┘
```

### `set_var`

```
┌─────────────┐
│ variable    │──────► VariableSelector (solo variables registradas, sin AFD)
└─────────────┘

┌─────────────┐        ┌────────────────────────────┐
│ valor       │──────► │ validarPrintValue() o       │──► ✓/✗
└─────────────┘        │ ExpressionSlot (reporter)   │
                       └────────────────────────────┘
```

### `change_var`

```
┌─────────────┐
│ variable    │──────► VariableSelector
└─────────────┘

┌─────────────┐        ┌────────────────────────────┐
│ amount      │──────► │ validarAmount()             │──► ✓/✗
└─────────────┘        │ entero | decimal | id       │
                       └────────────────────────────┘
```

### `show_var`

```
┌─────────────┐
│ variable    │──────► VariableSelector (sin validación extra necesaria)
└─────────────┘
```

---

## Orden de precedencia en `validarYInferirTipo`

La función prueba los tipos en este orden para evitar ambigüedades:

```
1. bool    — "true"/"false" son strings que también pasarían otros tests sin esto
2. char    — 'a' podría confundirse con string si no se verifica primero
3. string  — "..." captura todo lo que empiece y termine con comilla doble
4. double  — número con punto decimal
5. int     — número sin punto
6. unknown — fallback (genera console.warn en el generador)
```

---

## Integración con los bloques React

### `VarBlockNew` — badge de tipo en tiempo real

```tsx
const inferred = validarYInferirTipo(value);

<input
  className="block-input scratch-input"
  style={{ outline: inferred === 'unknown' && value !== '' ? '1px solid #ff4444' : undefined }}
  value={value}
  onChange={(e) => updateNodeData(id, { value: e.target.value })}
/>
<span className="scratch-type-badge"
  style={{ opacity: inferred === 'unknown' ? 0.4 : 1 }}>
  {inferred === 'unknown' ? 'int?' : inferred}
</span>
```

### `VarBlock` — validación cruzada tipo + valor

```tsx
const esValido = validarValorTipado(dataType as TipoExplicito, value);

<input
  className="block-input scratch-input scratch-input-sm"
  style={{ outline: !esValido && value !== '' ? '1px solid #ff4444' : undefined }}
  value={value}
  onChange={(e) => updateNodeData(id, { value: e.target.value })}
/>
```

### `ChangeVarBlock` — validación del delta

```tsx
const esValidoAmount = validarAmount(amount);

<ExpressionSlot
  value={amount}
  onChange={(v) => updateNodeData(id, { amount: v })}
  placeholder="N"
  categoryColor={esValidoAmount ? 'var(--accent-var_new)' : '#ff4444'}
/>
```

---

## Casos de prueba

### `validarYInferirTipo`

```typescript
validarYInferirTipo('42')        // → 'int'
validarYInferirTipo('-7')        // → 'int'
validarYInferirTipo('3.14')      // → 'double'
validarYInferirTipo('-0.5')      // → 'double'
validarYInferirTipo('true')      // → 'bool'
validarYInferirTipo('false')     // → 'bool'
validarYInferirTipo('"hola"')    // → 'string'
validarYInferirTipo('""')        // → 'string'
validarYInferirTipo("'a'")       // → 'char'
validarYInferirTipo("'\\n'")     // → 'char'
validarYInferirTipo('')          // → 'unknown'
validarYInferirTipo('abc')       // → 'unknown'
validarYInferirTipo('3.')        // → 'unknown'   (punto sin decimales)
validarYInferirTipo('"sin cerrar') // → 'unknown'
```

### `validarValorTipado`

```typescript
validarValorTipado('int',    '42')      // → true
validarValorTipado('int',    '3.14')    // → false
validarValorTipado('double', '3.14')    // → true
validarValorTipado('double', '42')      // → true  (entero compatible)
validarValorTipado('bool',   'true')    // → true
validarValorTipado('bool',   '1')       // → false
validarValorTipado('string', '"hola"')  // → true
validarValorTipado('string', 'hola')    // → false  (sin comillas)
validarValorTipado('char',   "'a'")     // → true
validarValorTipado('char',   '"a"')     // → false  (comillas dobles)
```

### `validarNombreVariable`

```typescript
validarNombreVariable('x')        // → true
validarNombreVariable('miVar123') // → true
validarNombreVariable('_aux')     // → true
validarNombreVariable('123abc')   // → false  (empieza con dígito)
validarNombreVariable('int')      // → false  (reservada)
validarNombreVariable('cout')     // → false  (reservada)
validarNombreVariable('')         // → false
```

### `validarAmount`

```typescript
validarAmount('5')     // → true
validarAmount('-3')    // → true
validarAmount('1.5')   // → true
validarAmount('paso')  // → true   (variable numérica)
validarAmount('"hola"')// → false
validarAmount('')      // → false
```

---

## Archivos a crear en `automata/`

| Archivo | Exporta |
|---------|---------|
| `afd_var_infer.ts` | `validarYInferirTipo`, `validarValorTipado`, `validarNombreVariable`, `validarAmount`, `esEntero`, `esDouble`, `esBool`, `esChar`, `esString` |

Los bloques `afd_string` (para `esString`) y `afd_id` (para `validarNombre`)
se importan desde `afd_print.ts` y `afd_string_print.ts` para no duplicar lógica.

---

*CheemScript · Documento técnico AFD — variables (var, var_new, set_var, change_var, show_var)*
