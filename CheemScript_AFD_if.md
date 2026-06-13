# AFD del bloque `if` — CheemScript

## El problema con la versión anterior

La implementación básica del AFD del `if` solo cubre dos casos:

```
if ( cond ) { }
if ( cond ) { } else { }
```

Pero **no cubre** el encadenamiento con `else if`:

```
if ( cond ) { }
else if ( cond ) { }
else if ( cond ) { }
else { }
```

Si se intentara pasar esa cadena al AFD anterior, fallaría en cuanto encontrara
el segundo `if` después del `else`, porque desde `q_else` solo se acepta `{` — no otro `if`.

Además, el token `EXPR` era atómico: no distinguía entre una condición simple como `x`
y una compleja como `x < a || !(y >= 10 && z == 0)`. Eso se corrige en esta versión.

---

## Qué hay de nuevo: expresiones reales

### El problema de las expresiones anidadas

Un AFD puro no puede contar paréntesis anidados arbitrarios — eso requiere una pila
(autómata de pila, PDA). Sin embargo, lo que sí hace todo parser real es usar un
**sub-autómata con un contador de profundidad**: un entero que sube con cada `(` y
baja con cada `)`. Cuando llega a cero, la expresión cerró.

Esto es técnicamente un PDA con pila de un solo valor entero. En la práctica es
exactamente lo que se implementa, y el AFD externo (el del `if`) lo trata como
una caja negra que devuelve un solo token: `EXPR`.

### Gramática de expresiones soportadas

```
EXPR     ::= OR_EXPR
OR_EXPR  ::= AND_EXPR  ( "||" AND_EXPR )*
AND_EXPR ::= NOT_EXPR  ( "&&" NOT_EXPR )*
NOT_EXPR ::= "!" NOT_EXPR
           | ATOM
ATOM     ::= ID OP_REL VALOR
           | ID
           | "(" OR_EXPR ")"
OP_REL   ::= "<" | ">" | "<=" | ">=" | "==" | "!="
VALOR    ::= NUMBER | STRING | BOOL | ID
```

Ejemplos válidos:

```
x < 10
x < a || x > 10
!(x == 0)
(x > 0 && y > 0) || z == "ok"
!( (a < b) && !(c >= d) )
```

### Sub-autómata de expresiones (PDA simplificado)

El parser de expresiones se implementa separado del AFD del `if`. Recibe el flujo
de tokens interno de la expresión (los que están entre los paréntesis del `if`) y
devuelve `true` si es una expresión válida, `false` si no.

La profundidad de paréntesis se maneja con un contador, no con estados individuales,
porque el anidamiento puede ser arbitrario.

```typescript
type TokenExpr =
  | { tipo: 'ID';     valor: string }
  | { tipo: 'NUM';    valor: number }
  | { tipo: 'STR';    valor: string }
  | { tipo: 'BOOL';   valor: boolean }
  | { tipo: 'OP_REL'; valor: '<' | '>' | '<=' | '>=' | '==' | '!=' }
  | { tipo: 'OP_LOG'; valor: '&&' | '||' }
  | { tipo: 'NOT' }
  | { tipo: 'PAREN_A' }   // (
  | { tipo: 'PAREN_C' };  // )

/**
 * Parser recursivo descendente para expresiones booleanas.
 * Devuelve [esValida, tokensConsumidos].
 */
function parseExpr(tokens: TokenExpr[], pos = 0): [boolean, number] {
  return parseOr(tokens, pos);
}

function parseOr(tokens: TokenExpr[], pos: number): [boolean, number] {
  let [ok, cur] = parseAnd(tokens, pos);
  if (!ok) return [false, pos];
  while (cur < tokens.length && tokens[cur].tipo === 'OP_LOG' &&
         (tokens[cur] as any).valor === '||') {
    const [ok2, cur2] = parseAnd(tokens, cur + 1);
    if (!ok2) return [false, pos];
    cur = cur2;
  }
  return [true, cur];
}

function parseAnd(tokens: TokenExpr[], pos: number): [boolean, number] {
  let [ok, cur] = parseNot(tokens, pos);
  if (!ok) return [false, pos];
  while (cur < tokens.length && tokens[cur].tipo === 'OP_LOG' &&
         (tokens[cur] as any).valor === '&&') {
    const [ok2, cur2] = parseNot(tokens, cur + 1);
    if (!ok2) return [false, pos];
    cur = cur2;
  }
  return [true, cur];
}

function parseNot(tokens: TokenExpr[], pos: number): [boolean, number] {
  if (pos < tokens.length && tokens[pos].tipo === 'NOT') {
    return parseNot(tokens, pos + 1);
  }
  return parseAtom(tokens, pos);
}

function parseAtom(tokens: TokenExpr[], pos: number): [boolean, number] {
  if (pos >= tokens.length) return [false, pos];
  const t = tokens[pos];

  // Subexpresión entre paréntesis: ( OR_EXPR )
  if (t.tipo === 'PAREN_A') {
    const [ok, cur] = parseOr(tokens, pos + 1);
    if (!ok || cur >= tokens.length || tokens[cur].tipo !== 'PAREN_C')
      return [false, pos];
    return [true, cur + 1];
  }

  // ID opcionalmente seguido de operador relacional y valor
  if (t.tipo === 'ID') {
    const next = tokens[pos + 1];
    if (next && next.tipo === 'OP_REL') {
      const val = tokens[pos + 2];
      if (!val || !['ID','NUM','STR','BOOL'].includes(val.tipo))
        return [false, pos];
      return [true, pos + 3];
    }
    return [true, pos + 1];   // ID solo, como booleano
  }

  return [false, pos];
}

/**
 * Punto de entrada: valida que los tokens formen una EXPR completa.
 */
function validarExpr(tokens: TokenExpr[]): boolean {
  const [ok, consumidos] = parseExpr(tokens, 0);
  return ok && consumidos === tokens.length;
}
```

---

## Integración con el AFD del `if`

El AFD externo no cambia su estructura de estados. La diferencia es que ahora,
en lugar de recibir un token atómico `'EXPR'`, recibe el resultado de `validarExpr`.

El flujo de trabajo del parser completo es:

```
Token stream completo
        │
        ▼
  Lexer / tokenizador
        │
        ├─ tokens del if: if, (, ..., ), {, ...INSTR..., }
        │
        ├─► sub-parser de EXPR consume los tokens entre ( y )
        │        │
        │        └─ devuelve true/false → se convierte en token 'EXPR' o error
        │
        └─► AFD del if recibe el stream ya clasificado
```

---

## Definición formal actualizada

El alfabeto ahora separa los operadores de expresión, pero el AFD del `if`
los ve ya empaquetados como `EXPR` gracias al sub-parser:

```
Q = {
  q0, q_if,
  q_abreParen, q_cond, q_cierraParen,
  q_abreLlave, q_cuerpo, q_cierraLlave,    ← aceptación parcial
  q_else,
  q_elseif,
  q_abreParen2, q_cond2, q_cierraParen2,
  q_abreLlave2, q_cuerpo2, q_cierraLlave2, ← aceptación parcial (loop)
  q_abreLlaveF, q_cuerpoF, q_fin,          ← aceptación final
  qERR
}

Σ_if  = { "if", "else", "(", ")", "{", "}", EXPR, INSTR }
Σ_exp = { ID, NUM, STR, BOOL, OP_REL, "&&", "||", "!", "(", ")" }

q₀ = q0

F  = { q_cierraLlave, q_cierraLlave2, q_fin }
```

> `EXPR` en `Σ_if` es el token compuesto que emite el sub-parser luego de
> validar toda la expresión booleana, incluyendo operadores y paréntesis anidados.

---

## Tabla de transición δ (AFD del `if`)

| Estado | `if` | `(` | `EXPR` | `)` | `{` | `INSTR` | `}` | `else` | otro |
|---|---|---|---|---|---|---|---|---|---|
| q0 | q_if | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| q_if | qERR | q_abreParen | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| q_abreParen | qERR | qERR | q_cond | qERR | qERR | qERR | qERR | qERR | qERR |
| q_cond | qERR | qERR | qERR | q_cierraParen | qERR | qERR | qERR | qERR | qERR |
| q_cierraParen | qERR | qERR | qERR | qERR | q_abreLlave | qERR | qERR | qERR | qERR |
| q_abreLlave | qERR | qERR | qERR | qERR | qERR | q_cuerpo | q_cierraLlave | qERR | qERR |
| q_cuerpo | qERR | qERR | qERR | qERR | qERR | q_cuerpo | q_cierraLlave | qERR | qERR |
| **q_cierraLlave** ✓ | qERR | qERR | qERR | qERR | qERR | qERR | qERR | q_else | — |
| q_else | q_elseif | qERR | qERR | qERR | q_abreLlaveF | qERR | qERR | qERR | qERR |
| q_elseif | qERR | q_abreParen2 | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| q_abreParen2 | qERR | qERR | q_cond2 | qERR | qERR | qERR | qERR | qERR | qERR |
| q_cond2 | qERR | qERR | qERR | q_cierraParen2 | qERR | qERR | qERR | qERR | qERR |
| q_cierraParen2 | qERR | qERR | qERR | qERR | q_abreLlave2 | qERR | qERR | qERR | qERR |
| q_abreLlave2 | qERR | qERR | qERR | qERR | qERR | q_cuerpo2 | q_cierraLlave2 | qERR | qERR |
| q_cuerpo2 | qERR | qERR | qERR | qERR | qERR | q_cuerpo2 | q_cierraLlave2 | qERR | qERR |
| **q_cierraLlave2** ✓ | qERR | qERR | qERR | qERR | qERR | qERR | qERR | q_else | — |
| q_abreLlaveF | qERR | qERR | qERR | qERR | qERR | q_cuerpoF | q_fin | qERR | qERR |
| q_cuerpoF | qERR | qERR | qERR | qERR | qERR | q_cuerpoF | q_fin | qERR | qERR |
| **q_fin** ✓ | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |

> La fila `q_cierraLlave2` apunta de vuelta a `q_else` — eso es el ciclo
> que permite encadenar cualquier cantidad de `else if`.

---

## Diagrama de estados

```
         if        (      EXPR      )        {
  q0 ──► q_if ──► q_AP ─────► q_cond ──► q_CP ──► q_AL
                                                      │
                                         INSTR(loop)  │ } (vacío)
                                      ┌───────────┐   │
                                      ▼           │   ▼
                                    q_cuerpo ─────┘  q_cierraLlave (✓)
                                      │                    │
                                      └──── } ────────────►│
                                                           │ else
                                                           ▼
                                                         q_else
                                                        /       \
                                                      if         {
                                                      ▼           ▼
                                                  q_elseif     q_abreLlaveF
                                                      │             │
                                              (  EXPR  )  {      INSTR(loop)
                                                      │             │
                                                   q_AL2         q_cuerpoF
                                              INSTR(loop)│          │
                                           ┌────────┐   │          └── } ──► q_fin (✓)
                                           ▼        │   ▼
                                         q_cuerpo2 ─┘  q_cierraLlave2 (✓)
                                                              │
                                                    else ◄────┘  (ciclo: permite
                                                     │            más else if)
                                                     └──────────────────────►
                                                        (vuelve a q_else)
```

Donde `EXPR` es ahora el resultado del sub-parser de expresiones:

```
                     sub-parser de EXPR
                     ┌─────────────────────────────────────────┐
  tokens entre ( )   │                                         │
  ─────────────────► │  parseOr → parseAnd → parseNot → ATOM  │ ──► EXPR ✓ / ERR
                     │                                         │
                     │  ATOM puede ser:                        │
                     │    ID                                   │
                     │    ID OP_REL VALOR                      │
                     │    ( OR_EXPR )   ← recursivo            │
                     └─────────────────────────────────────────┘
```

---

## Implementación TypeScript completa

```typescript
// ── Tipos ────────────────────────────────────────────────────────────────────

type TokenExpr =
  | { tipo: 'ID';     valor: string }
  | { tipo: 'NUM';    valor: number }
  | { tipo: 'STR';    valor: string }
  | { tipo: 'BOOL';   valor: boolean }
  | { tipo: 'OP_REL'; valor: '<' | '>' | '<=' | '>=' | '==' | '!=' }
  | { tipo: 'OP_LOG'; valor: '&&' | '||' }
  | { tipo: 'NOT' }
  | { tipo: 'PAREN_A' }
  | { tipo: 'PAREN_C' };

type TokenIf = 'if' | 'else' | '(' | ')' | '{' | '}' | 'EXPR' | 'INSTR';

type EstadoIf =
  | 'q0' | 'q_if'
  | 'q_abreParen'  | 'q_cond'  | 'q_cierraParen'
  | 'q_abreLlave'  | 'q_cuerpo'  | 'q_cierraLlave'
  | 'q_else' | 'q_elseif'
  | 'q_abreParen2' | 'q_cond2' | 'q_cierraParen2'
  | 'q_abreLlave2' | 'q_cuerpo2' | 'q_cierraLlave2'
  | 'q_abreLlaveF' | 'q_cuerpoF' | 'q_fin'
  | 'qERR';

// ── Sub-parser de expresiones ─────────────────────────────────────────────────

function parseOr(tokens: TokenExpr[], pos: number): [boolean, number] {
  let [ok, cur] = parseAnd(tokens, pos);
  if (!ok) return [false, pos];
  while (
    cur < tokens.length &&
    tokens[cur].tipo === 'OP_LOG' &&
    (tokens[cur] as { tipo: 'OP_LOG'; valor: string }).valor === '||'
  ) {
    const [ok2, cur2] = parseAnd(tokens, cur + 1);
    if (!ok2) return [false, pos];
    cur = cur2;
  }
  return [true, cur];
}

function parseAnd(tokens: TokenExpr[], pos: number): [boolean, number] {
  let [ok, cur] = parseNot(tokens, pos);
  if (!ok) return [false, pos];
  while (
    cur < tokens.length &&
    tokens[cur].tipo === 'OP_LOG' &&
    (tokens[cur] as { tipo: 'OP_LOG'; valor: string }).valor === '&&'
  ) {
    const [ok2, cur2] = parseNot(tokens, cur + 1);
    if (!ok2) return [false, pos];
    cur = cur2;
  }
  return [true, cur];
}

function parseNot(tokens: TokenExpr[], pos: number): [boolean, number] {
  if (pos < tokens.length && tokens[pos].tipo === 'NOT') {
    return parseNot(tokens, pos + 1);
  }
  return parseAtom(tokens, pos);
}

function parseAtom(tokens: TokenExpr[], pos: number): [boolean, number] {
  if (pos >= tokens.length) return [false, pos];
  const t = tokens[pos];

  // Subexpresión entre paréntesis
  if (t.tipo === 'PAREN_A') {
    const [ok, cur] = parseOr(tokens, pos + 1);
    if (!ok || cur >= tokens.length || tokens[cur].tipo !== 'PAREN_C')
      return [false, pos];
    return [true, cur + 1];
  }

  // ID con operador relacional: x < 10, y >= z
  if (t.tipo === 'ID') {
    const next = tokens[pos + 1];
    if (next && next.tipo === 'OP_REL') {
      const val = tokens[pos + 2];
      if (!val || !['ID', 'NUM', 'STR', 'BOOL'].includes(val.tipo))
        return [false, pos];
      return [true, pos + 3];
    }
    // ID solo (como booleano)
    return [true, pos + 1];
  }

  return [false, pos];
}

/**
 * Valida que un array de TokenExpr forme una expresión booleana completa.
 * Soporta: ||, &&, !, comparaciones, paréntesis anidados arbitrariamente.
 */
function validarExpr(tokens: TokenExpr[]): boolean {
  const [ok, consumidos] = parseOr(tokens, 0);
  return ok && consumidos === tokens.length;
}

// ── AFD del bloque if ─────────────────────────────────────────────────────────

function afd_if(tokens: TokenIf[]): boolean {
  let estado: EstadoIf = 'q0';

  for (const token of tokens) {
    switch (estado) {

      // ── Bloque if principal ─────────────────────────────────────
      case 'q0':
        estado = token === 'if' ? 'q_if' : 'qERR';
        break;

      case 'q_if':
        estado = token === '(' ? 'q_abreParen' : 'qERR';
        break;

      case 'q_abreParen':
        // 'EXPR' aquí ya pasó por validarExpr() antes de llegar al AFD
        estado = token === 'EXPR' ? 'q_cond' : 'qERR';
        break;

      case 'q_cond':
        estado = token === ')' ? 'q_cierraParen' : 'qERR';
        break;

      case 'q_cierraParen':
        estado = token === '{' ? 'q_abreLlave' : 'qERR';
        break;

      case 'q_abreLlave':
        if      (token === 'INSTR') estado = 'q_cuerpo';
        else if (token === '}')     estado = 'q_cierraLlave';
        else                        estado = 'qERR';
        break;

      case 'q_cuerpo':
        if      (token === 'INSTR') estado = 'q_cuerpo';
        else if (token === '}')     estado = 'q_cierraLlave';
        else                        estado = 'qERR';
        break;

      // ── Aceptación 1: solo if ────────────────────────────────────
      case 'q_cierraLlave':
        estado = token === 'else' ? 'q_else' : 'qERR';
        break;

      // ── Bifurcación: else if vs else { } ────────────────────────
      case 'q_else':
        if      (token === 'if') estado = 'q_elseif';
        else if (token === '{')  estado = 'q_abreLlaveF';
        else                     estado = 'qERR';
        break;

      // ── Bloque else if (puede repetirse n veces) ─────────────────
      case 'q_elseif':
        estado = token === '(' ? 'q_abreParen2' : 'qERR';
        break;

      case 'q_abreParen2':
        estado = token === 'EXPR' ? 'q_cond2' : 'qERR';
        break;

      case 'q_cond2':
        estado = token === ')' ? 'q_cierraParen2' : 'qERR';
        break;

      case 'q_cierraParen2':
        estado = token === '{' ? 'q_abreLlave2' : 'qERR';
        break;

      case 'q_abreLlave2':
        if      (token === 'INSTR') estado = 'q_cuerpo2';
        else if (token === '}')     estado = 'q_cierraLlave2';
        else                        estado = 'qERR';
        break;

      case 'q_cuerpo2':
        if      (token === 'INSTR') estado = 'q_cuerpo2';
        else if (token === '}')     estado = 'q_cierraLlave2';
        else                        estado = 'qERR';
        break;

      // ── Aceptación 2: if + else if(s) ────────────────────────────
      // Cicla a q_else para permitir otro else if
      case 'q_cierraLlave2':
        estado = token === 'else' ? 'q_else' : 'qERR';
        break;

      // ── Bloque else final ────────────────────────────────────────
      case 'q_abreLlaveF':
        if      (token === 'INSTR') estado = 'q_cuerpoF';
        else if (token === '}')     estado = 'q_fin';
        else                        estado = 'qERR';
        break;

      case 'q_cuerpoF':
        if      (token === 'INSTR') estado = 'q_cuerpoF';
        else if (token === '}')     estado = 'q_fin';
        else                        estado = 'qERR';
        break;

      case 'qERR':
        return false;
    }
  }

  return estado === 'q_cierraLlave'
      || estado === 'q_cierraLlave2'
      || estado === 'q_fin';
}
```

---

## Casos de prueba

### Sub-parser de expresiones

```typescript
// ✓ Expresión simple
validarExpr([
  { tipo: 'ID', valor: 'x' }, { tipo: 'OP_REL', valor: '<' }, { tipo: 'NUM', valor: 10 }
])
// → true

// ✓ Disyunción: x < a || x > 10
validarExpr([
  { tipo: 'ID', valor: 'x' }, { tipo: 'OP_REL', valor: '<' },  { tipo: 'ID',  valor: 'a' },
  { tipo: 'OP_LOG', valor: '||' },
  { tipo: 'ID', valor: 'x' }, { tipo: 'OP_REL', valor: '>' },  { tipo: 'NUM', valor: 10 }
])
// → true

// ✓ Negación: !(x == 0)
validarExpr([
  { tipo: 'NOT' },
  { tipo: 'PAREN_A' },
  { tipo: 'ID', valor: 'x' }, { tipo: 'OP_REL', valor: '==' }, { tipo: 'NUM', valor: 0 },
  { tipo: 'PAREN_C' }
])
// → true

// ✓ Paréntesis anidados: !( (a < b) && !(c >= d) )
validarExpr([
  { tipo: 'NOT' },
  { tipo: 'PAREN_A' },
    { tipo: 'PAREN_A' },
      { tipo: 'ID', valor: 'a' }, { tipo: 'OP_REL', valor: '<' }, { tipo: 'ID', valor: 'b' },
    { tipo: 'PAREN_C' },
    { tipo: 'OP_LOG', valor: '&&' },
    { tipo: 'NOT' },
    { tipo: 'PAREN_A' },
      { tipo: 'ID', valor: 'c' }, { tipo: 'OP_REL', valor: '>=' }, { tipo: 'ID', valor: 'd' },
    { tipo: 'PAREN_C' },
  { tipo: 'PAREN_C' }
])
// → true

// ✗ Operador relacional sin valor derecho
validarExpr([
  { tipo: 'ID', valor: 'x' }, { tipo: 'OP_REL', valor: '<' }
])
// → false

// ✗ Doble operador lógico seguido: x && || y
validarExpr([
  { tipo: 'ID', valor: 'x' },
  { tipo: 'OP_LOG', valor: '&&' },
  { tipo: 'OP_LOG', valor: '||' },
  { tipo: 'ID', valor: 'y' }
])
// → false
```

### AFD del `if` completo

```typescript
// ✓ Solo if con expresión simple
afd_if(['if', '(', 'EXPR', ')', '{', '}'])
// → true

// ✓ if + else
afd_if(['if', '(', 'EXPR', ')', '{', '}', 'else', '{', '}'])
// → true

// ✓ if + else if + else (expresiones complejas ya validadas por sub-parser)
afd_if([
  'if',  '(', 'EXPR', ')', '{', 'INSTR', '}',
  'else', 'if', '(', 'EXPR', ')', '{', 'INSTR', '}',
  'else', '{', 'INSTR', '}'
])
// → true

// ✓ if + tres else if sin else final
afd_if([
  'if',   '(', 'EXPR', ')', '{', '}',
  'else', 'if', '(', 'EXPR', ')', '{', '}',
  'else', 'if', '(', 'EXPR', ')', '{', '}',
  'else', 'if', '(', 'EXPR', ')', '{', '}'
])
// → true  (q_cierraLlave2 es estado de aceptación)

// ✗ else if sin if previo
afd_if(['else', 'if', '(', 'EXPR', ')', '{', '}'])
// → false  (q0 no acepta 'else')

// ✗ else duplicado
afd_if(['if', '(', 'EXPR', ')', '{', '}', 'else', '{', '}', 'else', '{', '}'])
// → false  (desde q_fin no hay transición válida)

// ✗ expresión inválida (el sub-parser rechaza antes de llegar al AFD)
validarExpr([{ tipo: 'OP_REL', valor: '<' }])
// → false  → no se genera token 'EXPR' → el AFD nunca ve q_abreParen→q_cond
```

---

## Por qué este diseño es correcto

### El AFD del `if` sigue siendo un AFD

Desde cada estado, para cada símbolo de `Σ_if`, hay exactamente una transición.
El ciclo `q_cierraLlave2 → q_else → q_elseif → ...` es determinista y no introduce
ambigüedad. La cantidad de `else if` encadenados la maneja el ciclo naturalmente.

### El sub-parser de expresiones es un PDA mínimo

El anidamiento de paréntesis no es reconocible por un AFD puro — requiere memoria
no acotada. El parser recursivo descendente implícitamente usa la pila de llamadas
del lenguaje anfitrión para rastrear la profundidad. Esto es un PDA, pero:

- Es la solución estándar en compiladores reales.
- El AFD externo lo trata como caja negra: solo ve `EXPR` o error.
- No hay ambigüedad: `&&` tiene mayor precedencia que `||`, y `!` más que ambos,
  todo codificado en el orden de las llamadas `parseOr → parseAnd → parseNot`.

### Precedencia de operadores

```
mayor precedencia  !  (NOT)
                   &&  (AND)
menor precedencia  ||  (OR)
```

Esto significa que `a || b && c` se parsea como `a || (b && c)`,
y `!a && b` como `(!a) && b`, igual que en la mayoría de lenguajes.

---

*CheemScript · Documento técnico AFD — bloque if/else if/else con expresiones complejas*
