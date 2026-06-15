# AFD del bloque `repeat` — CheemScript

## Contexto

El bloque `repeat` es el equivalente Scratch de un `for` simple. El usuario
escribe cuántas veces quiere repetir, y el generador produce:

```cpp
for (int _i_<uuid> = 0; _i_<uuid> < <count>; _i_<uuid>++) {
    // cuerpo
}
```

El único campo editable es `count`. Sin embargo, "cuántas veces" puede
expresarse de varias formas:

```
10              → entero literal positivo
n               → variable numérica
n * 2           → expresión aritmética
(n + 1) * 3    → expresión con paréntesis
```

Este documento define los AFDs necesarios para validar las cuatro formas.

---

## Gramática completa del campo `count`

```
COUNT       ::= EXPR_ARIT
EXPR_ARIT   ::= TERM ( OP_ADD TERM )*
TERM        ::= FACTOR ( OP_MUL FACTOR )*
FACTOR      ::= SIGNO? ATOM
ATOM        ::= NUM_POS
              | ID
              | '(' EXPR_ARIT ')'

OP_ADD  ::= '+' | '-'
OP_MUL  ::= '*' | '/' | '%'
SIGNO   ::= '-'           ← solo negativo (no tendría sentido +n como count)
NUM_POS ::= DIGITO+       ← entero sin signo (el signo lo maneja FACTOR)
ID      ::= LETRA (LETRA | DIGITO | '_')*
```

Ejemplos válidos:

```
10
n
n * 2
(n + 1) * 3
largo - 1
filas * columnas
(a + b) / 2
```

Ejemplos inválidos:

```
-10          → count negativo (semánticamente inválido)
3.14         → decimal (los índices de for son enteros)
"hola"       → string
n * * 2      → doble operador
(n + 1       → paréntesis sin cerrar
```

> **Nota sobre decimales:** aunque C++ aceptaría `for(...; i < 3.14; ...)`,
> en CheemScript el count debe ser un entero o expresión de enteros porque
> el generador usa el tipo `int` para el contador interno `_i_`.

---

## Tokenizador de `count`

Antes de los AFDs, el string crudo se convierte en tokens de alto nivel.
El tokenizador ya conoce los AFDs de `afd_var_infer.ts` para reconocer
cada lexema.

### Tipos de token

```typescript
type TokenCount =
  | { tipo: 'NUM';    valor: string }   // dígitos: 10, 42, 0
  | { tipo: 'ID';     valor: string }   // identificador: n, filas, _aux
  | { tipo: 'OP_ADD'; valor: '+' | '-' }
  | { tipo: 'OP_MUL'; valor: '*' | '/' | '%' }
  | { tipo: 'PAREN_A' }                 // (
  | { tipo: 'PAREN_C' }                 // )
  | { tipo: 'ERR';    valor: string };  // carácter no reconocido
```

### Reglas del tokenizador (en orden de precedencia)

| Patrón de entrada | Token producido |
|---|---|
| Secuencia de dígitos `[0-9]+` | `NUM` |
| Letra o `_` seguida de letras/dígitos/`_` | `ID` |
| `+` | `OP_ADD { valor: '+' }` |
| `-` | `OP_ADD { valor: '-' }` |
| `*` | `OP_MUL { valor: '*' }` |
| `/` | `OP_MUL { valor: '/' }` |
| `%` | `OP_MUL { valor: '%' }` |
| `(` | `PAREN_A` |
| `)` | `PAREN_C` |
| Espacio / tab | ignorado |
| Cualquier otro | `ERR` |

---

## AFD 1 — Número entero positivo (`afd_num_pos`)

Reconoce: `DIGITO+` — uno o más dígitos, sin signo, sin punto.

### Estados

```
Q = { n0, n_digito, nERR }
q₀ = n0
F  = { n_digito }
```

### Tabla de transición δ

| Estado | `DIGITO` | cualquier otro |
|---|---|---|
| `n0` | `n_digito` | `nERR` |
| `n_digito` | `n_digito` | `nERR` |
| `nERR` | `nERR` | `nERR` |

**Lectura de la tabla:**

- `n0` es el estado inicial. Solo acepta un primer dígito para arrancar; cualquier
  otro símbolo (letra, operador, punto) lleva directo a `nERR`.
- `n_digito` es el único estado de aceptación. Desde aquí, otro dígito extiende
  el número (loop); cualquier otra cosa rompe la cadena.
- `nERR` es trampa — una vez aquí no hay salida.

### Diagrama

```
          DIGITO (loop)
          ┌──────┐
          │      ▼
  n0 ───► n_digito (✓)
  │
  └── otro ──► nERR (trampa)
```

### Acepta / Rechaza

| Entrada | Resultado | Razón |
|---|---|---|
| `10` | ✓ | dos dígitos → `n_digito` |
| `0` | ✓ | un dígito |
| `42` | ✓ | |
| `` (vacío) | ✗ | nunca sale de `n0` |
| `3.14` | ✗ | el punto no es `DIGITO` |
| `n` | ✗ | letra no es `DIGITO` |
| `-5` | ✗ | el signo lo maneja `FACTOR`, no este AFD |

---

## AFD 2 — Identificador (`afd_id_count`)

Reutiliza `afd_id` de `afd_var_infer.ts`. Se documenta aquí para completitud.

Reconoce: `LETRA (LETRA | DIGITO | '_')*` donde `LETRA = [a-zA-Z_]`.

### Estados

```
Q = { i0, i_id, iERR }
q₀ = i0
F  = { i_id }
```

### Tabla de transición δ

| Estado | `LETRA` | `DIGITO` | `'_'` (ya en LETRA) | cualquier otro |
|---|---|---|---|---|
| `i0` | `i_id` | `iERR` | `i_id` | `iERR` |
| `i_id` | `i_id` | `i_id` | `i_id` | `iERR` |
| `iERR` | `iERR` | `iERR` | `iERR` | `iERR` |

**Lectura de la tabla:**

- `i0` exige que el primer carácter sea letra o `_`. Un dígito al inicio es
  ilegal en C++ y en CheemScript.
- `i_id` admite cualquier combinación de letras, dígitos y `_` para los
  caracteres siguientes.

### Acepta / Rechaza

| Entrada | Resultado |
|---|---|
| `n` | ✓ |
| `filas` | ✓ |
| `_aux` | ✓ |
| `var2` | ✓ |
| `2var` | ✗ — empieza con dígito |
| `` (vacío) | ✗ |

---

## Parser de expresión aritmética (PDA mínimo)

Al igual que con las expresiones booleanas del `if`, el anidamiento de
paréntesis requiere una pila — no es reconocible por un AFD puro.
Se usa un **parser recursivo descendente** que implícitamente usa la pila
del lenguaje anfitrión.

### Precedencia de operadores (mayor a menor)

```
( )          paréntesis → mayor precedencia
- (unario)   negación de FACTOR
* / %        multiplicación / división / módulo
+ -          suma / resta
```

Esta precedencia queda codificada en la jerarquía de llamadas:

```
parseExprArit   →  parseSum
parseSum        →  parseTerm  ('+' | '-'  parseTerm)*
parseTerm       →  parseFactor ('*' | '/' | '%'  parseFactor)*
parseFactor     →  '-'? parseAtom
parseAtom       →  NUM | ID | '(' parseSum ')'
```

### Tabla de primeros y siguientes por no-terminal

Esta tabla define qué token puede arrancar cada regla (FIRST) y qué
puede venir después de que la regla termina (FOLLOW). Es la base para
entender por qué el parser toma cada decisión sin ambigüedad.

| No-terminal | FIRST | FOLLOW |
|---|---|---|
| `EXPR_ARIT` | `NUM`, `ID`, `(`, `-` | `$` (fin), `)` |
| `SUM` | `NUM`, `ID`, `(`, `-` | `$`, `)` |
| `TERM` | `NUM`, `ID`, `(`, `-` | `+`, `-`, `$`, `)` |
| `FACTOR` | `NUM`, `ID`, `(`, `-` | `*`, `/`, `%`, `+`, `-`, `$`, `)` |
| `ATOM` | `NUM`, `ID`, `(` | `*`, `/`, `%`, `+`, `-`, `$`, `)` |

**Lectura:** cuando el parser está en `TERM` y el token actual es `+` o `-`,
sabe que `TERM` terminó (el `+`/`-` pertenece al nivel superior `SUM`).
No hay ambigüedad porque los conjuntos FIRST de cada alternativa son disjuntos.

### AFD interno de `parseAtom`

Aunque `parseAtom` es parte del parser recursivo, su lógica de decisión
local sí es un AFD de un paso:

```
Q_atom = { a0, a_num, a_id, a_paren, aERR }
q₀ = a0
F  = { a_num, a_id, a_paren }   ← cada uno delega a su sub-parser
```

| Estado | `NUM` | `ID` | `PAREN_A` | `-` | otro |
|---|---|---|---|---|---|
| `a0` | `a_num` | `a_id` | `a_paren` | `aERR`* | `aERR` |

> *El `-` unario lo consume `parseFactor` antes de llegar a `parseAtom`.
> Si `a0` ve un `-` directamente es un error.

| Desde `a_num` | Acción |
|---|---|
| consume el token `NUM` | llama `afd_num_pos`, retorna si válido |

| Desde `a_id` | Acción |
|---|---|
| consume el token `ID` | llama `afd_id`, retorna si válido |

| Desde `a_paren` | Acción |
|---|---|
| consume `PAREN_A` | llama `parseSum` recursivamente, luego espera `PAREN_C` |

### Implementación TypeScript

```typescript
// ── Tipos ────────────────────────────────────────────────────────────────────

type TokenCount =
  | { tipo: 'NUM';    valor: string }
  | { tipo: 'ID';     valor: string }
  | { tipo: 'OP_ADD'; valor: '+' | '-' }
  | { tipo: 'OP_MUL'; valor: '*' | '/' | '%' }
  | { tipo: 'PAREN_A' }
  | { tipo: 'PAREN_C' }
  | { tipo: 'ERR';    valor: string };

// ── AFD 1: número entero positivo ────────────────────────────────────────────

type EstadoNumPos = 'n0' | 'n_digito' | 'nERR';

function afd_num_pos(raw: string): boolean {
  let estado: EstadoNumPos = 'n0';

  for (const c of raw) {
    const esDigito = c >= '0' && c <= '9';
    switch (estado) {
      case 'n0':
        estado = esDigito ? 'n_digito' : 'nERR';
        break;
      case 'n_digito':
        estado = esDigito ? 'n_digito' : 'nERR';
        break;
      case 'nERR':
        return false;
    }
  }

  return estado === 'n_digito';
}

// ── AFD 2: identificador (reutilizado de afd_var_infer) ──────────────────────

type EstadoId = 'i0' | 'i_id' | 'iERR';

function afd_id_count(raw: string): boolean {
  let estado: EstadoId = 'i0';

  for (const c of raw) {
    const esLetra  = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    const esDigito = c >= '0' && c <= '9';
    switch (estado) {
      case 'i0':
        estado = esLetra ? 'i_id' : 'iERR';
        break;
      case 'i_id':
        estado = (esLetra || esDigito) ? 'i_id' : 'iERR';
        break;
      case 'iERR':
        return false;
    }
  }

  return estado === 'i_id';
}

// ── Tokenizador de expresión aritmética ──────────────────────────────────────

function tokenizarCount(raw: string): TokenCount[] {
  const tokens: TokenCount[] = [];
  let i = 0;

  while (i < raw.length) {
    const c = raw[i];

    // Espacios: ignorar
    if (c === ' ' || c === '\t') { i++; continue; }

    // Número entero positivo
    if (c >= '0' && c <= '9') {
      let j = i;
      while (j < raw.length && raw[j] >= '0' && raw[j] <= '9') j++;
      tokens.push({ tipo: 'NUM', valor: raw.slice(i, j) });
      i = j;
      continue;
    }

    // Identificador
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
      let j = i;
      while (j < raw.length &&
             ((raw[j] >= 'a' && raw[j] <= 'z') ||
              (raw[j] >= 'A' && raw[j] <= 'Z') ||
              (raw[j] >= '0' && raw[j] <= '9') ||
              raw[j] === '_')) j++;
      tokens.push({ tipo: 'ID', valor: raw.slice(i, j) });
      i = j;
      continue;
    }

    // Operadores y paréntesis
    if (c === '+') { tokens.push({ tipo: 'OP_ADD', valor: '+' }); i++; continue; }
    if (c === '-') { tokens.push({ tipo: 'OP_ADD', valor: '-' }); i++; continue; }
    if (c === '*') { tokens.push({ tipo: 'OP_MUL', valor: '*' }); i++; continue; }
    if (c === '/') { tokens.push({ tipo: 'OP_MUL', valor: '/' }); i++; continue; }
    if (c === '%') { tokens.push({ tipo: 'OP_MUL', valor: '%' }); i++; continue; }
    if (c === '(') { tokens.push({ tipo: 'PAREN_A' }); i++; continue; }
    if (c === ')') { tokens.push({ tipo: 'PAREN_C' }); i++; continue; }

    // Carácter no reconocido
    tokens.push({ tipo: 'ERR', valor: c });
    i++;
  }

  return tokens;
}

// ── Parser recursivo descendente ─────────────────────────────────────────────
// Retorna [esValido, posiciónFinal] para cada nivel de la gramática.

function parseSum(tokens: TokenCount[], pos: number): [boolean, number] {
  // SUM → TERM ( ('+' | '-') TERM )*
  let [ok, cur] = parseTerm(tokens, pos);
  if (!ok) return [false, pos];

  while (cur < tokens.length && tokens[cur].tipo === 'OP_ADD') {
    const [ok2, cur2] = parseTerm(tokens, cur + 1);
    if (!ok2) return [false, pos];
    cur = cur2;
  }

  return [true, cur];
}

function parseTerm(tokens: TokenCount[], pos: number): [boolean, number] {
  // TERM → FACTOR ( ('*' | '/' | '%') FACTOR )*
  let [ok, cur] = parseFactor(tokens, pos);
  if (!ok) return [false, pos];

  while (cur < tokens.length && tokens[cur].tipo === 'OP_MUL') {
    const [ok2, cur2] = parseFactor(tokens, cur + 1);
    if (!ok2) return [false, pos];
    cur = cur2;
  }

  return [true, cur];
}

function parseFactor(tokens: TokenCount[], pos: number): [boolean, number] {
  // FACTOR → '-'? ATOM
  let cur = pos;

  // Signo unario opcional (solo negativo)
  if (cur < tokens.length &&
      tokens[cur].tipo === 'OP_ADD' &&
      (tokens[cur] as { tipo: 'OP_ADD'; valor: string }).valor === '-') {
    cur++;
  }

  return parseAtom(tokens, cur);
}

function parseAtom(tokens: TokenCount[], pos: number): [boolean, number] {
  // ATOM → NUM | ID | '(' SUM ')'
  if (pos >= tokens.length) return [false, pos];

  const t = tokens[pos];

  // Número entero positivo
  if (t.tipo === 'NUM') {
    // El tokenizador ya garantizó que es dígitos puros, pero validamos con el AFD
    return afd_num_pos(t.valor) ? [true, pos + 1] : [false, pos];
  }

  // Identificador de variable
  if (t.tipo === 'ID') {
    return afd_id_count(t.valor) ? [true, pos + 1] : [false, pos];
  }

  // Subexpresión entre paréntesis
  if (t.tipo === 'PAREN_A') {
    const [ok, cur] = parseSum(tokens, pos + 1);
    if (!ok) return [false, pos];
    // Debe cerrar con ')'
    if (cur >= tokens.length || tokens[cur].tipo !== 'PAREN_C') return [false, pos];
    return [true, cur + 1];
  }

  // Cualquier otro token (operador, ERR, PAREN_C suelto) → error
  return [false, pos];
}

// ── Punto de entrada público ──────────────────────────────────────────────────

/**
 * Valida que `raw` sea una expresión aritmética entera válida para usar
 * como count de un bloque repeat.
 *
 * Acepta: literales enteros positivos, identificadores de variable,
 * y expresiones aritméticas con +, -, *, /, % y paréntesis anidados.
 *
 * Rechaza: decimales, strings, conteos negativos literales (-10),
 * operadores mal formados, paréntesis sin cerrar.
 */
export function validarCount(raw: string): boolean {
  if (raw.trim() === '') return false;

  const tokens = tokenizarCount(raw.trim());

  // Si hay algún token ERR, el lexema contiene caracteres inválidos
  if (tokens.some(t => t.tipo === 'ERR')) return false;

  // El parser debe consumir todos los tokens
  const [ok, consumidos] = parseSum(tokens, 0);
  return ok && consumidos === tokens.length;
}
```

---

## Tabla de transición completa del parser (vista como AFD de tokens)

Aunque el parser es recursivo, su comportamiento a nivel de token es
determinista. Esta tabla muestra qué decisión toma cada función según
el token actual:

### `parseSum` — decide continuar o delegar

| Token actual | Acción |
|---|---|
| `NUM`, `ID`, `PAREN_A`, `-` | delega a `parseTerm` (arrancar un TERM) |
| `OP_ADD` (`+`/`-`) después de un TERM | consume y pide otro `parseTerm` |
| `PAREN_C`, fin de tokens | termina el SUM (retorna lo acumulado) |
| `OP_MUL`, `ERR` | retorna false |

### `parseTerm` — decide continuar o delegar

| Token actual | Acción |
|---|---|
| `NUM`, `ID`, `PAREN_A`, `-` | delega a `parseFactor` |
| `OP_MUL` (`*`/`/`/`%`) después de un FACTOR | consume y pide otro `parseFactor` |
| `OP_ADD`, `PAREN_C`, fin | termina el TERM |
| `ERR` | retorna false |

### `parseFactor` — maneja signo unario

| Token actual | Acción |
|---|---|
| `-` | consume el signo, delega a `parseAtom` |
| `NUM`, `ID`, `PAREN_A` | delega directamente a `parseAtom` (sin signo) |
| `+` como unario | **rechaza** — `+n` no tiene sentido como count |
| cualquier otro | retorna false |

### `parseAtom` — estado de decisión terminal

| Token actual | Estado interno | Siguiente acción |
|---|---|---|
| `NUM` | `a_num` | valida con `afd_num_pos`, consume 1 token |
| `ID` | `a_id` | valida con `afd_id_count`, consume 1 token |
| `PAREN_A` | `a_paren` | consume `(`, llama `parseSum`, espera `)` |
| `PAREN_C` suelto | `aERR` | retorna false |
| `OP_ADD`, `OP_MUL` | `aERR` | retorna false |
| fin de tokens | `aERR` | retorna false (nada que parsear) |

---

## Restricción semántica: count negativo literal

El AFD acepta `-n` (negativo de variable) porque `n` podría ser negativa
ya en runtime — eso es responsabilidad del programador. Pero `-10` literal
siempre es inválido como count porque el ciclo nunca ejecutaría.

```typescript
/**
 * Validación semántica adicional: si el count es un literal numérico,
 * debe ser mayor a cero.
 */
export function validarCountSemantico(raw: string): boolean {
  const s = raw.trim();
  // Si es un literal entero puro, verificar que sea positivo
  if (/^\d+$/.test(s)) {
    return parseInt(s, 10) > 0;
  }
  // Literal negativo explícito: siempre inválido
  if (/^-\d+$/.test(s)) return false;
  // Cualquier otra cosa (variable, expresión) pasa la validación sintáctica
  return validarCount(s);
}
```

---

## Diagrama de flujo del parser

```
validarCount("n * (filas + 1)")
        │
        ▼
tokenizarCount()
        │
        ▼
[ ID:"n", OP_MUL:"*", PAREN_A, ID:"filas", OP_ADD:"+", NUM:"1", PAREN_C ]
        │
        ▼
parseSum(pos=0)
  └─► parseTerm(pos=0)
        └─► parseFactor(pos=0)         ← no hay '-' unario
              └─► parseAtom(pos=0)     ← token es ID
                    └─► afd_id("n")    → true
                    └─► retorna [true, 1]
        ← cur=1, token[1]=OP_MUL:"*"  → entra al loop de TERM
        └─► parseFactor(pos=2)         ← token[2]=PAREN_A
              └─► parseAtom(pos=2)
                    └─► token es PAREN_A → consume, llama parseSum(pos=3)
                          └─► parseTerm(pos=3)
                                └─► parseFactor(pos=3) → parseAtom → ID:"filas" → [true,4]
                          ← cur=4, token[4]=OP_ADD:"+" → loop de SUM
                                └─► parseTerm(pos=5)
                                      └─► parseFactor → parseAtom → NUM:"1" → [true,6]
                          ← cur=6, token[6]=PAREN_C → termina SUM → [true, 6]
                    └─► token[6]=PAREN_C ✓ → retorna [true, 7]
        ← cur=7, fin de tokens → termina TERM → [true, 7]
  ← cur=7, fin de tokens → termina SUM → [true, 7]
        │
        ▼
consumidos(7) === tokens.length(7) → true ✓
```

---

## Casos de prueba

```typescript
// ── Literales enteros ─────────────────────────────────────────────────────────
validarCount('10')           // → true
validarCount('1')            // → true
validarCount('100')          // → true
validarCount('0')            // → true   (for no ejecuta, pero sintácticamente válido)
validarCount('')             // → false  (vacío)
validarCount('3.14')         // → false  (decimal)
validarCount('-10')          // → false  (negativo literal)

// ── Identificadores ───────────────────────────────────────────────────────────
validarCount('n')            // → true
validarCount('filas')        // → true
validarCount('_aux')         // → true
validarCount('var2')         // → true
validarCount('2var')         // → false  (empieza con dígito)

// ── Expresiones aritméticas simples ──────────────────────────────────────────
validarCount('n * 2')        // → true
validarCount('largo - 1')    // → true
validarCount('a + b')        // → true
validarCount('n / 2')        // → true
validarCount('n % 3')        // → true
validarCount('n * * 2')      // → false  (doble operador)
validarCount('n +')          // → false  (operador colgante)
validarCount('* n')          // → false  (empieza con operador)

// ── Expresiones con paréntesis ────────────────────────────────────────────────
validarCount('(n + 1) * 3')  // → true
validarCount('(a + b) / 2')  // → true
validarCount('((n))')        // → true   (paréntesis anidados vacíos)
validarCount('(n + 1')       // → false  (paréntesis sin cerrar)
validarCount('n + 1)')       // → false  (paréntesis sobrante)
validarCount('()')           // → false  (expresión vacía entre paréntesis)

// ── Signo unario ──────────────────────────────────────────────────────────────
validarCount('-n')           // → true   (variable podría ser positiva en runtime)
validarCount('-(n + 1)')     // → true   (negación de expresión)
validarCount('+n')           // → false  (+ unario no soportado)

// ── Caracteres inválidos ──────────────────────────────────────────────────────
validarCount('"hola"')       // → false  (string)
validarCount('n == 2')       // → false  (operador relacional)
validarCount('n && m')       // → false  (operador lógico)

// ── Validación semántica ──────────────────────────────────────────────────────
validarCountSemantico('10')  // → true
validarCountSemantico('0')   // → false  (cero: el ciclo nunca ejecuta)
validarCountSemantico('-5')  // → false  (negativo literal)
validarCountSemantico('n')   // → true   (variable: se asume positiva)
validarCountSemantico('n * 2') // → true
```

---

## Integración con `RepeatBlock`

```tsx
import { validarCountSemantico } from '../automata/afd_repeat';

export const RepeatBlock: React.FC<RepeatBlockProps> = ({ id, ... }) => {
  const count  = node.data.count ?? '';
  const esValido = count === '' || validarCountSemantico(count);

  return (
    <BaseBlock ... title={
      <div className="scratch-title-row">
        <span className="scratch-keyword">repetir</span>
        <input
          type="text"
          className="block-input scratch-input"
          style={{
            width: '80px',
            outline: !esValido && count !== '' ? '1px solid #ff4444' : undefined,
          }}
          placeholder="10"
          value={count}
          onChange={(e) => updateNodeData(id, { count: e.target.value })}
        />
        <span className="scratch-label">veces</span>
      </div>
    } category="repeat" />
  );
};
```

---

## Archivos a crear en `automata/`

| Archivo | Exporta |
|---------|---------|
| `afd_repeat.ts` | `validarCount`, `validarCountSemantico`, `afd_num_pos`, `tokenizarCount` |

`afd_id_count` reutiliza la lógica de `afd_id` de `afd_var_infer.ts` —
se importa desde allí para no duplicar código.

---

*CheemScript · Documento técnico AFD — bloque repeat / count con expresiones aritméticas*
