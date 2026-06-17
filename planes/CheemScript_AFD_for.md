# AFD del bloque `for` — CheemScript

## Contexto

El bloque `for` es el bucle clásico de C++. El generador produce:

```cpp
for (<init>; <condition>; <increment>) {
    // cuerpo
}
```

Los tres campos son independientes y cada uno tiene su propia gramática:

| Campo | Ejemplo | Complejidad |
|---|---|---|
| `init` | `int i = 0`, `i = 0` | declaración o asignación |
| `condition` | `i < 10`, `i < n && x > 0` | expresión booleana (PDA) |
| `increment` | `i++`, `i += 2`, `++i` | expresión de incremento/decremento |

---

## Campo 1 — `init`

### Gramática

```
INIT        ::= DECL_VAR | ASIGNACION
DECL_VAR    ::= TIPO ID '=' EXPR_ARIT
ASIGNACION  ::= ID '=' EXPR_ARIT

TIPO        ::= 'int' | 'long' | 'size_t'    ← tipos enteros válidos para índices
ID          ::= LETRA (LETRA | DIGITO | '_')*
EXPR_ARIT   ::= (reutiliza parser de afd_repeat.ts)
```

Ejemplos válidos:

```
int i = 0
int j = n - 1
i = 0
contador = inicio
long k = 0
```

Ejemplos inválidos:

```
float i = 0      → float no es tipo válido para índice de for
int 2i = 0       → identificador inválido
int i            → falta la asignación
= 0              → falta el identificador
int i = 0.5      → decimal como valor inicial (índice debe ser entero)
```

> **Por qué solo `int`, `long`, `size_t`:** el generador usa el contador como
> índice de array. Tipos flotantes como `float` o `double` producen
> comportamiento indefinido en bucles de conteo.

### AFD del `init`

Este AFD opera sobre tokens de alto nivel. El tokenizador de `init` produce:

```typescript
type TokenInit =
  | { tipo: 'TIPO';    valor: 'int' | 'long' | 'size_t' }
  | { tipo: 'ID';      valor: string }
  | { tipo: 'ASIGNA'  }   // '='
  | { tipo: 'EXPR' }      // resultado del sub-parser aritmético
  | { tipo: 'ERR' };
```

#### Estados

```
Q_init = {
  in0,            ← estado inicial
  in_tipo,        ← se leyó TIPO (declaración)
  in_id,          ← se leyó ID (puede ser declaración o asignación)
  in_id_decl,     ← ID después de TIPO (nombre de la variable)
  in_asigna,      ← se leyó '=' esperando expresión
  in_expr,        ← se leyó EXPR (estado de aceptación)
  inERR
}

q₀ = in0
F  = { in_expr }
```

#### Tabla de transición δ

| Estado | `TIPO` | `ID` | `ASIGNA` | `EXPR` | `ERR` | otro |
|---|---|---|---|---|---|---|
| `in0` | `in_tipo` | `in_id` | `inERR` | `inERR` | `inERR` | `inERR` |
| `in_tipo` | `inERR` | `in_id_decl` | `inERR` | `inERR` | `inERR` | `inERR` |
| `in_id` | `inERR` | `inERR` | `in_asigna` | `inERR` | `inERR` | `inERR` |
| `in_id_decl` | `inERR` | `inERR` | `in_asigna` | `inERR` | `inERR` | `inERR` |
| `in_asigna` | `inERR` | `inERR` | `inERR` | `in_expr` | `inERR` | `inERR` |
| `in_expr` ✓ | `inERR` | `inERR` | `inERR` | `inERR` | `inERR` | `inERR` |
| `inERR` | `inERR` | `inERR` | `inERR` | `inERR` | `inERR` | `inERR` |

**Lectura de la tabla:**

- `in0` acepta `TIPO` (camino de declaración) o `ID` (camino de asignación simple).
  Cualquier otro token al inicio es error inmediato.
- `in_tipo` exige un `ID` a continuación — el nombre de la variable declarada.
  No puede haber otro `TIPO` ni un `=` directo.
- `in_id` (variable sin tipo) solo puede ir seguido de `=`. No puede haber
  otro `ID` ni `TIPO` porque eso sería una redeclaración sin sentido.
- `in_id_decl` se comporta igual que `in_id`: después del nombre declarado
  solo puede venir `=`.
- `in_asigna` solo acepta `EXPR` — la expresión aritmética ya validada por
  el sub-parser de `afd_repeat.ts`.
- `in_expr` es el único estado de aceptación. Una vez que se leyó la
  expresión, no puede haber más tokens.

#### Diagrama

```
         TIPO            ID
  in0 ──────────► in_tipo ──────► in_id_decl ──┐
   │                                             │ ASIGNA (=)
   │ ID                                          ▼
   └──────────────────────────► in_id ──────► in_asigna ──► in_expr (✓)
                                              (EXPR del
                                           sub-parser de count)
```

#### Implementación TypeScript

```typescript
import { validarCount } from './afd_repeat';
import { afd_id } from './afd_var_infer';

type TipoForInit = 'int' | 'long' | 'size_t';
const TIPOS_VALIDOS_FOR = new Set<TipoForInit>(['int', 'long', 'size_t']);

type TokenInit =
  | { tipo: 'TIPO';   valor: string }
  | { tipo: 'ID';     valor: string }
  | { tipo: 'ASIGNA' }
  | { tipo: 'EXPR';   valor: string }
  | { tipo: 'ERR' };

type EstadoInit =
  | 'in0' | 'in_tipo' | 'in_id' | 'in_id_decl'
  | 'in_asigna' | 'in_expr' | 'inERR';

function tokenizarInit(raw: string): TokenInit[] {
  const tokens: TokenInit[] = [];
  const partes = raw.trim().split(/\s+/);   // dividir por espacios
  let i = 0;

  while (i < partes.length) {
    const p = partes[i];

    // TIPO
    if (TIPOS_VALIDOS_FOR.has(p as TipoForInit)) {
      tokens.push({ tipo: 'TIPO', valor: p });
      i++;
      continue;
    }

    // ASIGNA — el '=' puede aparecer pegado a otros tokens: 'i=0'
    if (p === '=') {
      tokens.push({ tipo: 'ASIGNA' });
      i++;
      continue;
    }

    // ID — puede ser 'i' o 'i=' (pegado)
    if (p.includes('=')) {
      // Separar 'i=0' → 'i', '=', '0'
      const idx = p.indexOf('=');
      const before = p.slice(0, idx);
      const after  = p.slice(idx + 1);
      if (before && afd_id(before)) tokens.push({ tipo: 'ID', valor: before });
      else if (before)               tokens.push({ tipo: 'ERR' });
      tokens.push({ tipo: 'ASIGNA' });
      if (after) {
        // Lo que queda después del = es el inicio de la expresión
        // Recolectar hasta el final y validar como EXPR
        const exprRaw = [after, ...partes.slice(i + 1)].join(' ');
        tokens.push(validarCount(exprRaw)
          ? { tipo: 'EXPR', valor: exprRaw }
          : { tipo: 'ERR' });
        break;
      }
      i++;
      continue;
    }

    // ID puro
    if (afd_id(p)) {
      tokens.push({ tipo: 'ID', valor: p });
      i++;
      continue;
    }

    // Todo lo demás: intentar como inicio de expresión aritmética
    const exprRaw = partes.slice(i).join(' ');
    tokens.push(validarCount(exprRaw)
      ? { tipo: 'EXPR', valor: exprRaw }
      : { tipo: 'ERR' });
    break;
  }

  return tokens;
}

export function validarInit(raw: string): boolean {
  if (raw.trim() === '') return false;

  const tokens = tokenizarInit(raw.trim());
  if (tokens.some(t => t.tipo === 'ERR')) return false;

  let estado: EstadoInit = 'in0';

  for (const t of tokens) {
    switch (estado) {
      case 'in0':
        if      (t.tipo === 'TIPO') estado = 'in_tipo';
        else if (t.tipo === 'ID')   estado = 'in_id';
        else                        estado = 'inERR';
        break;
      case 'in_tipo':
        estado = t.tipo === 'ID' ? 'in_id_decl' : 'inERR';
        break;
      case 'in_id':
      case 'in_id_decl':
        estado = t.tipo === 'ASIGNA' ? 'in_asigna' : 'inERR';
        break;
      case 'in_asigna':
        estado = t.tipo === 'EXPR' ? 'in_expr' : 'inERR';
        break;
      case 'in_expr':
        estado = 'inERR';
        break;
      case 'inERR':
        return false;
    }
  }

  return estado === 'in_expr';
}
```

---

## Campo 2 — `condition`

### Gramática

Reutiliza `validarExpr` de `parser_expr.ts` — el PDA de expresiones
booleanas completas ya definido para el bloque `if`.

```
CONDITION ::= EXPR_BOOL
            (reutiliza: parser_expr.ts → validarExpr)
```

Ejemplos válidos:

```
i < 10
i < n
i < n && x > 0
!(i == fin)
(i >= inicio) && (i <= fin)
activo
```

No se define un AFD nuevo para este campo — el PDA de `parser_expr.ts`
ya lo cubre completamente.

```typescript
import { validarExpr } from './parser_expr';

export function validarConditionFor(raw: string): boolean {
  if (raw.trim() === '') return false;
  return validarExpr(raw.trim());
}
```

---

## Campo 3 — `increment`

### Gramática

```
INCREMENT ::= POSTFIJO | PREFIJO | COMPUESTO | ASIGNACION_SIMPLE

POSTFIJO         ::= ID ('++' | '--')
PREFIJO          ::= ('++' | '--') ID
COMPUESTO        ::= ID OP_COMPUESTO EXPR_ARIT
ASIGNACION_SIMPLE::= ID '=' EXPR_ARIT

OP_COMPUESTO ::= '+=' | '-=' | '*=' | '/=' | '%='
ID           ::= LETRA (LETRA | DIGITO | '_')*
EXPR_ARIT    ::= (reutiliza parser de afd_repeat.ts)
```

Ejemplos válidos:

```
i++
i--
++i
--i
i += 2
i -= 1
i *= 2
i /= 2
i %= 3
i = i + 1       → asignación explícita
```

Ejemplos inválidos:

```
++              → sin identificador
i++ ++          → doble incremento
i +             → operador incompleto
i += 0.5        → decimal en incremento
++ 2            → operador sobre literal
```

### AFD del `increment`

El tokenizador de `increment` produce:

```typescript
type TokenIncr =
  | { tipo: 'ID';          valor: string }
  | { tipo: 'OP_POST';     valor: '++' | '--' }   // postfijo y prefijo
  | { tipo: 'OP_COMP';     valor: '+=' | '-=' | '*=' | '/=' | '%=' }
  | { tipo: 'ASIGNA' }                             // '=' simple
  | { tipo: 'EXPR';        valor: string }
  | { tipo: 'ERR' };
```

#### Estados

```
Q_incr = {
  ic0,            ← estado inicial
  ic_id,          ← se leyó ID (puede continuar como postfijo, compuesto o asignación)
  ic_op_pre,      ← se leyó '++' o '--' al inicio (prefijo)
  ic_postfijo,    ← ID + '++' o '--' (aceptación)
  ic_prefijo,     ← '++' o '--' + ID (aceptación)
  ic_comp_asigna, ← se leyó OP_COMP o ASIGNA, esperando EXPR
  ic_expr,        ← se leyó EXPR tras compuesto/asignación (aceptación)
  icERR
}

q₀ = ic0
F  = { ic_postfijo, ic_prefijo, ic_expr }
```

#### Tabla de transición δ

| Estado | `ID` | `OP_POST` | `OP_COMP` | `ASIGNA` | `EXPR` | `ERR` | otro |
|---|---|---|---|---|---|---|---|
| `ic0` | `ic_id` | `ic_op_pre` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |
| `ic_id` | `icERR` | `ic_postfijo` | `ic_comp_asigna` | `ic_comp_asigna` | `icERR` | `icERR` | `icERR` |
| `ic_op_pre` | `ic_prefijo` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |
| `ic_postfijo` ✓ | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |
| `ic_prefijo` ✓ | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |
| `ic_comp_asigna` | `icERR` | `icERR` | `icERR` | `icERR` | `ic_expr` | `icERR` | `icERR` |
| `ic_expr` ✓ | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |
| `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |

**Lectura de la tabla:**

- `ic0` solo acepta `ID` (para postfijo, compuesto o asignación) o `OP_POST`
  (para prefijo). Cualquier otra cosa al inicio es error.
- `ic_id` es el estado de bifurcación principal: desde aquí el autómata
  distingue los tres caminos posibles según el siguiente token:
  - `OP_POST` (`++`/`--`) → termina en `ic_postfijo` ✓
  - `OP_COMP` (`+=`, `-=`, etc.) → va a `ic_comp_asigna`
  - `ASIGNA` (`=`) → también va a `ic_comp_asigna` (misma ruta)
  - cualquier otro → error. Dos `ID` seguidos no tienen sentido aquí.
- `ic_op_pre` espera exactamente un `ID` después del operador prefijo.
  Un `OP_POST` doble (`++ ++`) o un literal son errores.
- `ic_postfijo` y `ic_prefijo` son estados de aceptación terminales:
  nada puede venir después de `i++` o `++i`.
- `ic_comp_asigna` solo acepta `EXPR` — la expresión ya validada.
  Si el usuario escribió `i += ` sin expresión, se queda aquí y falla.
- `ic_expr` es el tercer estado de aceptación: `i += 2`, `i = i + 1`.

#### Diagrama

```
                OP_POST(++/--)
         ID ──────────────────► ic_postfijo (✓)
          │
          │ OP_COMP(+=,-=,*=,/=,%=)  ┐
  ic0 ───►ic_id                      ├──► ic_comp_asigna ──► ic_expr (✓)
          │ ASIGNA(=)                ┘         EXPR
          │
          └── (nada más válido desde ic_id)

  ic0 ───► ic_op_pre(++/--) ──► ic_prefijo (✓)
                 ID
```

#### Implementación TypeScript

```typescript
import { validarCount } from './afd_repeat';
import { afd_id } from './afd_var_infer';

type TokenIncr =
  | { tipo: 'ID';      valor: string }
  | { tipo: 'OP_POST'; valor: '++' | '--' }
  | { tipo: 'OP_COMP'; valor: string }
  | { tipo: 'ASIGNA' }
  | { tipo: 'EXPR';    valor: string }
  | { tipo: 'ERR' };

type EstadoIncr =
  | 'ic0' | 'ic_id' | 'ic_op_pre'
  | 'ic_postfijo' | 'ic_prefijo'
  | 'ic_comp_asigna' | 'ic_expr' | 'icERR';

const OPS_COMPUESTOS = new Set(['+=', '-=', '*=', '/=', '%=']);

function tokenizarIncrement(raw: string): TokenIncr[] {
  const tokens: TokenIncr[] = [];
  let i = 0;
  const s = raw.trim();

  while (i < s.length) {
    // Espacios
    if (s[i] === ' ' || s[i] === '\t') { i++; continue; }

    // OP_POST o OP_COMP de dos caracteres
    if (i + 1 < s.length) {
      const dos = s.slice(i, i + 2);
      if (dos === '++' || dos === '--') {
        tokens.push({ tipo: 'OP_POST', valor: dos as '++' | '--' });
        i += 2;
        continue;
      }
      if (OPS_COMPUESTOS.has(dos)) {
        tokens.push({ tipo: 'OP_COMP', valor: dos });
        i += 2;
        // Resto de la cadena es la expresión
        const exprRaw = s.slice(i).trim();
        if (exprRaw) {
          tokens.push(validarCount(exprRaw)
            ? { tipo: 'EXPR', valor: exprRaw }
            : { tipo: 'ERR' });
        }
        break;
      }
    }

    // ASIGNA simple '='
    if (s[i] === '=') {
      tokens.push({ tipo: 'ASIGNA' });
      i++;
      const exprRaw = s.slice(i).trim();
      if (exprRaw) {
        tokens.push(validarCount(exprRaw)
          ? { tipo: 'EXPR', valor: exprRaw }
          : { tipo: 'ERR' });
      }
      break;
    }

    // ID
    if ((s[i] >= 'a' && s[i] <= 'z') || (s[i] >= 'A' && s[i] <= 'Z') || s[i] === '_') {
      let j = i;
      while (j < s.length &&
             ((s[j] >= 'a' && s[j] <= 'z') || (s[j] >= 'A' && s[j] <= 'Z') ||
              (s[j] >= '0' && s[j] <= '9') || s[j] === '_')) j++;
      const id = s.slice(i, j);
      tokens.push(afd_id(id)
        ? { tipo: 'ID', valor: id }
        : { tipo: 'ERR' });
      i = j;
      continue;
    }

    tokens.push({ tipo: 'ERR' });
    i++;
  }

  return tokens;
}

export function validarIncrement(raw: string): boolean {
  if (raw.trim() === '') return false;

  const tokens = tokenizarIncrement(raw.trim());
  if (tokens.some(t => t.tipo === 'ERR')) return false;

  let estado: EstadoIncr = 'ic0';

  for (const t of tokens) {
    switch (estado) {
      case 'ic0':
        if      (t.tipo === 'ID')      estado = 'ic_id';
        else if (t.tipo === 'OP_POST') estado = 'ic_op_pre';
        else                           estado = 'icERR';
        break;
      case 'ic_id':
        if      (t.tipo === 'OP_POST') estado = 'ic_postfijo';
        else if (t.tipo === 'OP_COMP') estado = 'ic_comp_asigna';
        else if (t.tipo === 'ASIGNA')  estado = 'ic_comp_asigna';
        else                           estado = 'icERR';
        break;
      case 'ic_op_pre':
        estado = t.tipo === 'ID' ? 'ic_prefijo' : 'icERR';
        break;
      case 'ic_postfijo':
      case 'ic_prefijo':
        estado = 'icERR';
        break;
      case 'ic_comp_asigna':
        estado = t.tipo === 'EXPR' ? 'ic_expr' : 'icERR';
        break;
      case 'ic_expr':
        estado = 'icERR';
        break;
      case 'icERR':
        return false;
    }
  }

  return estado === 'ic_postfijo'
      || estado === 'ic_prefijo'
      || estado === 'ic_expr';
}
```

---

## AFD orquestador — `validarFor`

Los tres campos se validan de forma independiente. El bloque `for` es válido
si y solo si los tres campos pasan su validación.

### Tabla de dependencias

| Campo | Validador | Depende de |
|---|---|---|
| `init` | `validarInit` | `afd_repeat.validarCount`, `afd_var_infer.afd_id` |
| `condition` | `validarConditionFor` | `parser_expr.validarExpr` |
| `increment` | `validarIncrement` | `afd_repeat.validarCount`, `afd_var_infer.afd_id` |

```typescript
export interface ResultadoFor {
  init:      boolean;
  condition: boolean;
  increment: boolean;
  valido:    boolean;   // true si los tres son true
}

export function validarFor(
  init:      string,
  condition: string,
  increment: string
): ResultadoFor {
  const r = {
    init:      validarInit(init),
    condition: validarConditionFor(condition),
    increment: validarIncrement(increment),
    valido:    false,
  };
  r.valido = r.init && r.condition && r.increment;
  return r;
}
```

---

## Diagrama general del pipeline

```
ForBlock
   │
   ├─ init      ──► tokenizarInit()  ──► AFD_init  ──► validarInit()        ──► ✓/✗
   │                                       ↑
   │                              validarCount() (afd_repeat)
   │                              afd_id()       (afd_var_infer)
   │
   ├─ condition ──────────────────────────────────────► validarExpr()         ──► ✓/✗
   │                                                    (parser_expr, PDA)
   │
   └─ increment ──► tokenizarIncrement() ──► AFD_incr ──► validarIncrement() ──► ✓/✗
                                               ↑
                                      validarCount() (afd_repeat)
                                      afd_id()       (afd_var_infer)
```

---

## Integración con `ForBlock`

```tsx
import { validarFor } from '../automata/afd_for';

export const ForBlock: React.FC<ForBlockProps> = ({ id, ... }) => {
  const init      = node.data.init      ?? '';
  const condition = node.data.condition ?? '';
  const increment = node.data.increment ?? '';

  const resultado = validarFor(init, condition, increment);

  const estiloInput = (ok: boolean) => ({
    outline: !ok && /* campo no vacío */ true ? '1px solid #ff4444' : undefined,
  });

  return (
    <BaseBlock ... title={
      <div className="scratch-title-row">
        <span className="scratch-keyword">for</span>
        <span className="scratch-label">(</span>
        <input
          className="block-input scratch-input"
          style={init      !== '' ? estiloInput(resultado.init)      : undefined}
          placeholder="int i = 0"
          value={init}
          onChange={(e) => updateNodeData(id, { init: e.target.value })}
        />
        <span className="scratch-label">;</span>
        <input
          className="block-input scratch-input"
          style={condition !== '' ? estiloInput(resultado.condition) : undefined}
          placeholder="i < 10"
          value={condition}
          onChange={(e) => updateNodeData(id, { condition: e.target.value })}
        />
        <span className="scratch-label">;</span>
        <input
          className="block-input scratch-input"
          style={increment !== '' ? estiloInput(resultado.increment) : undefined}
          placeholder="i++"
          value={increment}
          onChange={(e) => updateNodeData(id, { increment: e.target.value })}
        />
        <span className="scratch-label">)</span>
      </div>
    } category="for" />
  );
};
```

---

## Casos de prueba

### `validarInit`

```typescript
// ✓ Declaraciones con tipo
validarInit('int i = 0')        // → true
validarInit('long k = 0')       // → true
validarInit('int j = n - 1')    // → true
validarInit('int i = (n + 1)')  // → true

// ✓ Asignaciones sin tipo (variable ya declarada)
validarInit('i = 0')            // → true
validarInit('contador = inicio')// → true

// ✗ Errores de declaración
validarInit('float i = 0')      // → false  (tipo no válido para índice)
validarInit('double i = 0')     // → false
validarInit('int 2i = 0')       // → false  (ID inválido)
validarInit('int i')            // → false  (sin asignación)
validarInit('= 0')              // → false  (sin identificador)
validarInit('int i = 0.5')      // → false  (decimal)
validarInit('')                 // → false
```

### `validarConditionFor`

```typescript
validarConditionFor('i < 10')          // → true
validarConditionFor('i < n')           // → true
validarConditionFor('i < n && x > 0') // → true
validarConditionFor('!(i == fin)')     // → true
validarConditionFor('')                // → false
validarConditionFor('i <')             // → false
```

### `validarIncrement`

```typescript
// ✓ Postfijo
validarIncrement('i++')      // → true
validarIncrement('i--')      // → true
validarIncrement('j++')      // → true

// ✓ Prefijo
validarIncrement('++i')      // → true
validarIncrement('--i')      // → true

// ✓ Compuesto
validarIncrement('i += 2')   // → true
validarIncrement('i -= 1')   // → true
validarIncrement('i *= 2')   // → true
validarIncrement('i /= 2')   // → true
validarIncrement('i %= 3')   // → true
validarIncrement('i += n')   // → true
validarIncrement('i += n * 2') // → true

// ✓ Asignación simple
validarIncrement('i = i + 1') // → true

// ✗ Errores
validarIncrement('++')        // → false  (sin ID)
validarIncrement('i++ ++')    // → false  (doble)
validarIncrement('i +')       // → false  (incompleto)
validarIncrement('++ 2')      // → false  (operador sobre literal)
validarIncrement('i += 0.5')  // → false  (decimal)
validarIncrement('')           // → false
```

### `validarFor` (orquestador)

```typescript
validarFor('int i = 0', 'i < 10', 'i++')
// → { init: true, condition: true, increment: true, valido: true }

validarFor('float i = 0', 'i < 10', 'i++')
// → { init: false, condition: true, increment: true, valido: false }

validarFor('int i = 0', '', 'i++')
// → { init: true, condition: false, increment: true, valido: false }

validarFor('int i = 0', 'i < 10', 'i += n * 2')
// → { init: true, condition: true, increment: true, valido: true }
```

---

## Por qué son tres AFDs separados y no uno solo

Un solo AFD que reconociera la línea completa `init; condition; increment`
necesitaría unificar tres alfabetos distintos en un único autómata con
docenas de estados. Los `;` del `for` no llegan al validador porque el
generador ya los inserta — el bloque tiene tres inputs independientes.

Al tener tres AFDs separados:

- El feedback de error es por campo: el bloque puede mostrar exactamente
  qué parte está mal (`init` vs `condition` vs `increment`).
- La reutilización es máxima: `validarConditionFor` es literalmente un alias
  de `validarExpr`; `validarInit` e `validarIncrement` comparten
  `validarCount` y `afd_id`.
- Cada AFD cumple la propiedad de determinismo: desde cada estado, para
  cada token del alfabeto correspondiente, hay exactamente una transición.

---

## Archivos a crear en `automata/`

| Archivo | Exporta |
|---|---|
| `afd_for.ts` | `validarInit`, `validarConditionFor`, `validarIncrement`, `validarFor`, `ResultadoFor` |

Importa de: `afd_repeat.ts` (`validarCount`), `afd_var_infer.ts` (`afd_id`), `parser_expr.ts` (`validarExpr`).

---

*CheemScript · Documento técnico AFD — bloque for (init / condition / increment)*
