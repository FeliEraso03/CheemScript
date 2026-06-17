# AFD de cadenas de texto y bloque `print` — CheemScript

## Contexto

El bloque `print` en CheemScript acepta un único argumento que puede ser:

- Una **cadena literal**: `"hola mundo"`, `"42"`, `""` (vacía)
- Una **variable**: `nombre`, `x`, `miVar123`
- Una **expresión de cadena** con concatenación: `"hola " + nombre`

El generador de código ya emite:

```cpp
cout << <valor> << endl;
```

Este documento define el AFD que valida lo que puede ir como `<valor>` en ese `cout`.

---

## Qué se necesita reconocer

### Cadenas literales

Una cadena literal en CheemScript sigue las mismas reglas que en C++/JS:

```
"..."          comillas dobles, contenido arbitrario
""             cadena vacía válida
"hola mundo"   espacios permitidos adentro
"x < 10"       símbolos permitidos adentro
"\n"  "\t"     secuencias de escape válidas
```

Caracteres **no permitidos** sin escapar dentro de una cadena:

- `"` (cerraría la cadena)
- `\` solo (inicio de escape incompleto)

### Variables

Un identificador válido:

```
letra (letra | dígito | _)*
```

Donde `letra` = `[a-zA-Z_]` y `dígito` = `[0-9]`.

### Expresiones de concatenación

```
ATOM ('+' ATOM)*
ATOM ::= STRING_LITERAL | ID | NUMBER
```

Ejemplos:

```
"hola " + nombre
"resultado: " + x + "!"
nombre + " tiene " + edad + " años"
```

---

## AFD 1 — Cadena literal

Reconoce el lexema de una cadena entre comillas dobles.

### Alfabeto

```
Σ_str = { '"', CHAR, ESC_SEQ, '\' }

CHAR    = cualquier carácter excepto '"' y '\'
ESC_SEQ = '\n' | '\t' | '\\' | '\"' | '\r' | '\0'
```

### Estados

```
Q_str = { s0, s_dentro, s_escape, s_cerrada, sERR }

q₀ = s0
F  = { s_cerrada }
```

### Tabla de transición δ

| Estado | `"` | `CHAR` | `\` | `ESC_SEQ` (completa) | otro |
|---|---|---|---|---|---|
| s0 | s_dentro | sERR | sERR | sERR | sERR |
| s_dentro | s_cerrada | s_dentro | s_escape | sERR | sERR |
| s_escape | sERR | sERR | sERR | s_dentro | sERR |
| s_cerrada | sERR | sERR | sERR | sERR | sERR |
| sERR | sERR | sERR | sERR | sERR | sERR |

### Diagrama

```
        "            CHAR (loop)
  s0 ──► s_dentro ◄──────────────┐
              │                  │
              │ CHAR             │
              └──────────────────┘
              │
              │ \
              ▼
           s_escape
              │
              │ ESC_SEQ ('\n', '\t', '\\', '\"' …)
              └──────────────────► s_dentro
              │
              │ " (cierra)
              ▼
           s_cerrada (✓)
```

### Implementación TypeScript

```typescript
type TokenStr =
  | { tipo: 'COMILLA' }         // "
  | { tipo: 'CHAR'; valor: string }   // cualquier carácter simple
  | { tipo: 'BARRA' }           // \
  | { tipo: 'ESC_SEQ'; valor: string }; // \n \t \\ \" etc.

type EstadoStr = 's0' | 's_dentro' | 's_escape' | 's_cerrada' | 'sERR';

function afd_string(tokens: TokenStr[]): boolean {
  let estado: EstadoStr = 's0';

  for (const t of tokens) {
    switch (estado) {
      case 's0':
        estado = t.tipo === 'COMILLA' ? 's_dentro' : 'sERR';
        break;

      case 's_dentro':
        if      (t.tipo === 'COMILLA')  estado = 's_cerrada';
        else if (t.tipo === 'CHAR')     estado = 's_dentro';
        else if (t.tipo === 'BARRA')    estado = 's_escape';
        else                            estado = 'sERR';
        break;

      case 's_escape':
        estado = t.tipo === 'ESC_SEQ' ? 's_dentro' : 'sERR';
        break;

      case 's_cerrada':
        estado = 'sERR'; // nada puede venir después de la comilla de cierre
        break;

      case 'sERR':
        return false;
    }
  }

  return estado === 's_cerrada';
}
```

---

## AFD 2 — Identificador (variable)

### Alfabeto

```
Σ_id = { LETRA, DIGITO }

LETRA  = [a-zA-Z_]
DIGITO = [0-9]
```

### Estados

```
Q_id = { i0, i_id, iERR }

q₀ = i0
F  = { i_id }
```

### Tabla de transición δ

| Estado | `LETRA` | `DIGITO` | otro |
|---|---|---|---|
| i0 | i_id | iERR | iERR |
| i_id | i_id | i_id | iERR |
| iERR | iERR | iERR | iERR |

### Diagrama

```
         LETRA
  i0 ──► i_id (✓)
           │  ▲
           │  │ LETRA | DIGITO (loop)
           └──┘
```

### Implementación TypeScript

```typescript
type TokenId = { tipo: 'LETRA' } | { tipo: 'DIGITO' };
type EstadoId = 'i0' | 'i_id' | 'iERR';

function afd_id(tokens: TokenId[]): boolean {
  let estado: EstadoId = 'i0';

  for (const t of tokens) {
    switch (estado) {
      case 'i0':
        estado = t.tipo === 'LETRA' ? 'i_id' : 'iERR';
        break;
      case 'i_id':
        estado = (t.tipo === 'LETRA' || t.tipo === 'DIGITO') ? 'i_id' : 'iERR';
        break;
      case 'iERR':
        return false;
    }
  }

  return estado === 'i_id';
}
```

---

## AFD 3 — Número literal (para concatenación)

Reconoce enteros y decimales: `42`, `3.14`, `0`.

### Alfabeto

```
Σ_num = { DIGITO, PUNTO }
```

### Estados

```
Q_num = { n0, n_entero, n_punto, n_decimal, nERR }

q₀ = n0
F  = { n_entero, n_decimal }
```

### Tabla de transición δ

| Estado | `DIGITO` | `PUNTO` | otro |
|---|---|---|---|
| n0 | n_entero | nERR | nERR |
| n_entero | n_entero | n_punto | nERR |
| n_punto | n_decimal | nERR | nERR |
| n_decimal | n_decimal | nERR | nERR |
| nERR | nERR | nERR | nERR |

### Diagrama

```
          DIGITO (loop)
  n0 ──► n_entero (✓) ──► n_punto ──► n_decimal (✓)
              ▲  │  PUNTO              ▲    │
              └──┘                     └────┘ DIGITO (loop)
```

### Implementación TypeScript

```typescript
type TokenNum = { tipo: 'DIGITO' } | { tipo: 'PUNTO' };
type EstadoNum = 'n0' | 'n_entero' | 'n_punto' | 'n_decimal' | 'nERR';

function afd_num(tokens: TokenNum[]): boolean {
  let estado: EstadoNum = 'n0';

  for (const t of tokens) {
    switch (estado) {
      case 'n0':
        estado = t.tipo === 'DIGITO' ? 'n_entero' : 'nERR';
        break;
      case 'n_entero':
        if      (t.tipo === 'DIGITO') estado = 'n_entero';
        else if (t.tipo === 'PUNTO')  estado = 'n_punto';
        else                          estado = 'nERR';
        break;
      case 'n_punto':
        estado = t.tipo === 'DIGITO' ? 'n_decimal' : 'nERR';
        break;
      case 'n_decimal':
        estado = t.tipo === 'DIGITO' ? 'n_decimal' : 'nERR';
        break;
      case 'nERR':
        return false;
    }
  }

  return estado === 'n_entero' || estado === 'n_decimal';
}
```

---

## AFD 4 — Argumento del `print` (expresión de concatenación)

Combina los tres AFD anteriores. El argumento del `print` es una secuencia de
átomos (`STRING | ID | NUM`) separados por `+`.

### Alfabeto

```
Σ_print = { STRING, ID, NUM, '+' }

STRING = token ya validado por afd_string
ID     = token ya validado por afd_id
NUM    = token ya validado por afd_num
```

### Estados

```
Q_print = { p0, p_atom, p_plus, pERR }

q₀ = p0
F  = { p_atom }
```

### Tabla de transición δ

| Estado | `STRING` | `ID` | `NUM` | `'+'` | otro |
|---|---|---|---|---|---|
| p0 | p_atom | p_atom | p_atom | pERR | pERR |
| p_atom | pERR | pERR | pERR | p_plus | pERR |
| p_plus | p_atom | p_atom | p_atom | pERR | pERR |
| pERR | pERR | pERR | pERR | pERR | pERR |

> `p_atom` es el único estado de aceptación, lo que impide que la expresión
> termine con un `+` colgante: `"hola" +` sería rechazado.

### Diagrama

```
     STRING|ID|NUM        STRING|ID|NUM
  p0 ───────────► p_atom (✓) ◄──────────── p_plus
                     │                        ▲
                     └──────── '+' ───────────┘
```

### Implementación TypeScript

```typescript
type TokenPrint = 'STRING' | 'ID' | 'NUM' | '+';
type EstadoPrint = 'p0' | 'p_atom' | 'p_plus' | 'pERR';

const ATOMS: TokenPrint[] = ['STRING', 'ID', 'NUM'];

function afd_print(tokens: TokenPrint[]): boolean {
  let estado: EstadoPrint = 'p0';

  for (const t of tokens) {
    switch (estado) {
      case 'p0':
        estado = ATOMS.includes(t) ? 'p_atom' : 'pERR';
        break;
      case 'p_atom':
        estado = t === '+' ? 'p_plus' : 'pERR';
        break;
      case 'p_plus':
        estado = ATOMS.includes(t) ? 'p_atom' : 'pERR';
        break;
      case 'pERR':
        return false;
    }
  }

  return estado === 'p_atom';
}
```

---

## Pipeline de validación completo

El `PrintBlock` recibe el texto del `<input>` como string crudo. La validación
ocurre en dos fases antes de pasarlo al generador de código:

```
input: string crudo del usuario
       │
       ▼
  1. Lexer liviano
     ├─ detecta tokens: STRING_LITERAL | ID | NUMBER | '+'
     └─ dentro de cada STRING_LITERAL corre afd_string()
       │
       ▼
  2. afd_print(tokens)
     ├─ true  → valor válido → se pasa al generador → cout << val << endl;
     └─ false → UI muestra error en el input
```

### Lexer liviano en TypeScript

```typescript
/**
 * Tokeniza el valor del campo print en tokens de alto nivel.
 * Retorna null si encuentra un lexema inválido.
 */
function lexPrintValue(raw: string): TokenPrint[] | null {
  const tokens: TokenPrint[] = [];
  let i = 0;

  while (i < raw.length) {
    // Espacios: ignorar
    if (raw[i] === ' ') { i++; continue; }

    // Operador de concatenación
    if (raw[i] === '+') {
      tokens.push('+');
      i++;
      continue;
    }

    // Cadena literal
    if (raw[i] === '"') {
      let j = i + 1;
      while (j < raw.length && raw[j] !== '"') {
        if (raw[j] === '\\') j++; // saltar carácter escapado
        j++;
      }
      if (j >= raw.length) return null; // comilla sin cerrar
      // Validar con afd_string (opcional: tokenizar chars internos)
      tokens.push('STRING');
      i = j + 1;
      continue;
    }

    // Número
    if (/[0-9]/.test(raw[i])) {
      let j = i;
      while (j < raw.length && /[0-9.]/.test(raw[j])) j++;
      tokens.push('NUM');
      i = j;
      continue;
    }

    // Identificador
    if (/[a-zA-Z_]/.test(raw[i])) {
      let j = i;
      while (j < raw.length && /[a-zA-Z0-9_]/.test(raw[j])) j++;
      tokens.push('ID');
      i = j;
      continue;
    }

    // Carácter desconocido
    return null;
  }

  return tokens;
}

/**
 * Punto de entrada: valida el valor que va en el print.
 */
function validarPrintValue(raw: string): boolean {
  if (raw.trim() === '') return false;
  const tokens = lexPrintValue(raw);
  if (tokens === null) return false;
  return afd_print(tokens);
}
```

---

## Integración con `PrintBlock`

```tsx
export const PrintBlock: React.FC<PrintBlockProps> = ({ id, onDelete, onMoveUp, onMoveDown }) => {
  const { nodes, updateNodeData } = useAST();
  const node = nodes[id];
  if (!node) return null;

  const value = node.data.value ?? '';
  const esValido = value === '' || validarPrintValue(value);

  return (
    <BaseBlock
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 800 }}>print</span>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>(</span>
          <input
            type="text"
            className="block-input"
            style={{
              width: '140px',
              outline: esValido ? undefined : '1px solid #ff4444',
            }}
            placeholder='"hola" o variable'
            value={value}
            onChange={(e) => updateNodeData(id, { value: e.target.value })}
          />
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>)</span>
          {!esValido && value !== '' && (
            <span style={{ color: '#ff4444', fontSize: '11px' }}>valor inválido</span>
          )}
        </div>
      }
      category="print"
    />
  );
};
```

---

## Casos de prueba

```typescript
// ── Cadenas literales ────────────────────────────────────────────
validarPrintValue('"hola mundo"')          // → true
validarPrintValue('""')                    // → true   (cadena vacía)
validarPrintValue('"con \\n escape"')      // → true
validarPrintValue('"sin cerrar')           // → false  (comilla abierta)

// ── Variables ────────────────────────────────────────────────────
validarPrintValue('nombre')                // → true
validarPrintValue('_miVar123')             // → true
validarPrintValue('123abc')               // → false  (empieza con dígito)

// ── Números ──────────────────────────────────────────────────────
validarPrintValue('42')                    // → true
validarPrintValue('3.14')                  // → true
validarPrintValue('3.')                    // → false  (punto sin decimales)

// ── Concatenaciones ──────────────────────────────────────────────
validarPrintValue('"hola " + nombre')      // → true
validarPrintValue('"val: " + x + "!"')    // → true
validarPrintValue('nombre + " tiene " + edad + " años"') // → true

// ── Inválidos ────────────────────────────────────────────────────
validarPrintValue('"hola" +')              // → false  (+ colgante)
validarPrintValue('+ nombre')              // → false  (empieza con +)
validarPrintValue('')                      // → false  (vacío)
validarPrintValue('"a" + + "b"')           // → false  (doble +)
```

---

## Por qué cuatro AFD en lugar de uno

Cada AFD tiene una responsabilidad clara:

| AFD | Reconoce | Estado final |
|---|---|---|
| `afd_string` | Lexema de cadena literal con escapes | `s_cerrada` |
| `afd_id` | Identificador válido | `i_id` |
| `afd_num` | Número entero o decimal | `n_entero` / `n_decimal` |
| `afd_print` | Argumento completo del print | `p_atom` |

Separarlos permite reutilizarlos: `afd_id` también se usa en la validación de
declaraciones de variables; `afd_string` en cualquier asignación de cadena;
`afd_num` en expresiones aritméticas. El `afd_print` solo orquesta.

---

*CheemScript · Documento técnico AFD — cadenas de texto y bloque print*
