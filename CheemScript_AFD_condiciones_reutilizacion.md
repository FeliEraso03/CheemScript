# Reutilización de `validarExpr` en condiciones — CheemScript

## El problema

Varios bloques de CheemScript tienen un campo `condition` que acepta exactamente
la misma gramática booleana: comparaciones, operadores lógicos, negación y
paréntesis anidados. Sin el documento de reutilización, cada AFD nuevo tendría
que reimplementar o copiar la misma lógica.

## La solución: `validarExpr` como validador canónico de condiciones

`parser_expr.ts` ya expone:

```typescript
export interface ParserResult {
  valid:   boolean;
  mensaje: string;
}

export function validarExpr(raw: string): ParserResult
```

Este PDA reconoce la gramática completa:

```
EXPR     ::= OR_EXPR
OR_EXPR  ::= AND_EXPR  ( "||" AND_EXPR )*
AND_EXPR ::= NOT_EXPR  ( "&&" NOT_EXPR )*
NOT_EXPR ::= "!" NOT_EXPR | ATOM
ATOM     ::= ID OP_REL VALOR | ID | "(" OR_EXPR ")"
OP_REL   ::= "<" | ">" | "<=" | ">=" | "==" | "!="
VALOR    ::= NUMBER | STRING | BOOL | ID
```

Cualquier bloque que necesite validar una condición booleana llama a
`validarExpr` directamente — sin wrapper, sin reimplementación.

---

## Mapa de bloques y sus campos de condición

| Bloque | Campo | Llamada | Lo que genera C++ |
|--------|-------|---------|-------------------|
| `if` | `condition`, `elseIfs[n].condition` | `validarExpr(condition)` | `if (condition)` |
| `for` | `condition` | `validarConditionFor(condition)` → `validarExpr` | `for (...; condition; ...)` |
| `while` | `condition` | `validarExpr(condition)` | `while (condition)` |
| `repeatUntil` | `condition` | `validarExpr(condition)` | `while (!(condition))` |

> La negación de `repeatUntil` la inserta el generador — el validador
> solo verifica que la expresión en sí sea booleana válida.

---

## Implementación en cada bloque

### `if` — ya implementado

`afd_if.ts` ya llama a `validarExpr` para cada condición antes de emitir
el token `EXPR` que consume el AFD de estructura.

### `for` — `validarConditionFor` es un alias directo

En `afd_for.ts` ya existe:

```typescript
import { validarExpr } from './parser_expr';
import type { ParserResult } from './parser_expr';

export function validarConditionFor(raw: string): ParserResult {
  return validarExpr(raw);
}
```

No hay lógica extra — la función existe solo para que `ForBlock.tsx` importe
desde `afd_for` sin saber qué hay debajo.

### `while` — sin archivo propio

No se crea `afd_while.ts`. El bloque importa directamente:

```typescript
import { validarExpr } from '../automata/parser_expr';
import type { ParserResult } from '../automata/parser_expr';

const resultado: ParserResult = validarExpr(condition);
```

### `repeatUntil` — igual que `while`

```typescript
import { validarExpr } from '../automata/parser_expr';

const resultado = validarExpr(condition);
// El generador convierte condition → while (!(condition))
// El validador no necesita saber eso
```

---

## Por qué `while` y `repeatUntil` no necesitan archivo propio

Un archivo `afd_while.ts` que solo hiciera:

```typescript
export function validarWhile(raw: string) { return validarExpr(raw); }
export function validarRepeatUntil(raw: string) { return validarExpr(raw); }
```

no aportaría nada — es una capa de indirección sin lógica. La regla es:
**se crea un archivo de autómata cuando agrega lógica propia**. Si el
bloque solo delega sin transformar, el bloque React importa `validarExpr`
directamente.

La excepción es `for`, donde `validarConditionFor` sí vive en `afd_for.ts`
porque ese archivo ya existe y agrupa toda la validación del bloque.

---

## Tabla consolidada de autómatas de condición

| Situación | Solución |
|-----------|----------|
| Bloque tiene solo `condition` | importar `validarExpr` directamente en el bloque React |
| Bloque tiene `condition` + otros campos | crear `afd_<bloque>.ts` con wrapper `validarCondition<Bloque>` que llama a `validarExpr` |
| Bloque tiene múltiples condiciones (ej: `if` con `else if`) | el AFD de estructura tokeniza cada condición y llama `validarExpr` por cada una |

---

## Árbol de dependencias actualizado

```
parser_expr.ts
    │  validarExpr()
    │
    ├── afd_if.ts          (llama validarExpr por cada condición del if/else if)
    ├── afd_for.ts         (validarConditionFor → validarExpr)
    ├── WhileBlock.tsx      (importa validarExpr directamente)
    └── RepeatUntilBlock.tsx(importa validarExpr directamente)
```

---

## Casos de prueba compartidos

Estos casos aplican a `if`, `for.condition`, `while` y `repeatUntil`
por igual — todos pasan por `validarExpr`:

```typescript
validarExpr('i < 10')                      // → { valid: true,  ... }
validarExpr('i < n && x > 0')             // → { valid: true,  ... }
validarExpr('!(i == fin)')                 // → { valid: true,  ... }
validarExpr('(i >= inicio) && (i <= fin)') // → { valid: true,  ... }
validarExpr('activo')                      // → { valid: true,  ... }
validarExpr('x > 10 || y == "ok"')        // → { valid: true,  ... }

validarExpr('')                            // → { valid: false, ... }
validarExpr('i <')                         // → { valid: false, ... }
validarExpr('&& x > 0')                   // → { valid: false, ... }
validarExpr('(x > 0')                     // → { valid: false, ... }
```

---

*CheemScript · Documento técnico — reutilización de `validarExpr` en condiciones*
