# CheemScript — Definicion Formal de Automatas Implementados

## Convencion

Cada automata se define como la 5-tupla:

```
M = (Q, Σ, δ, q₀, F)
```

Donde:
- **Q** = conjunto finito de estados
- **Σ** = alfabeto de entrada (conjunto de simbolos o tokens)
- **δ** = funcion de transicion δ: Q × Σ → Q
- **q₀** = estado inicial (q₀ ∈ Q)
- **F** = conjunto de estados de aceptacion (F ⊆ Q)

Para los automatas que operan sobre **tokens** (no caracteres individuales), el alfabeto Σ se define como un conjunto de tipos de token, y la funcion δ opera sobre el flujo de tokens ya tokenizado por un lexer previo.

La notacion `δ(estado, simbolo) = estado'` significa: "estando en `estado` y leyendo `simbolo`, se transita a `estado'`".

Cuando un par `(estado, simbolo)` no esta definido en δ, se sobreentiende que δ(estado, simbolo) = qERR (estado de error absorbente), donde qERR ∉ F.

---

## Indice

1. [AFD 1 — String literal (afd_print: afd_string)](#afd-1--string-literal)
2. [AFD 2 — Identificador (afd_print: afd_id)](#afd-2--identificador)
3. [AFD 3 — Numero entero o decimal (afd_print: afd_num)](#afd-3--numero-entero-o-decimal)
4. [AFD 4 — Expresion de concatenacion (afd_print: afd_print)](#afd-4--expresion-de-concatenacion)
5. [AFD 5 — Entero con signo (afd_var_infer: esEntero)](#afd-5--entero-con-signo)
6. [AFD 6 — Double con signo (afd_var_infer: esDouble)](#afd-6--double-con-signo)
7. [AFD 7 — Booleano literal (afd_var_infer: esBool)](#afd-7--booleano-literal)
8. [AFD 8 — Char literal (afd_var_infer: esChar)](#afd-8--char-literal)
9. [AFD 9 — Entero positivo (afd_repeat: afd_num_pos)](#afd-9--entero-positivo)
10. [AFD 10 — Identificador para count (afd_repeat: afd_id_count)](#afd-10--identificador-para-count)
11. [PDA 11 — Expresion aritmetica (afd_repeat: parser)](#pda-11--expresion-aritmetica)
12. [AFD 12 — Init del for (afd_for: validarInit)](#afd-12--init-del-for)
13. [AFD 13 — Increment del for (afd_for: validarIncrement)](#afd-13--increment-del-for)
14. [AFD 14 — Estructura if/else if/else (afd_if)](#afd-14--estructura-ifelse-ifelse)
15. [AFD 15 — Comparacion simple (afd_expr: afd4_comparacion)](#afd-15--comparacion-simple)
16. [PDA 16 — Expresion booleana (parser_expr)](#pda-16--expresion-booleana)
17. [AFD 17 — Tamano de array (afd_var_infer: validarTamanio)](#afd-17--tamano-de-array)

---

## AFD 1 — String literal

**Archivo:** `afd_print.ts` — funcion `afd_string`

Reconoce una cadena literal entre comillas dobles con soporte de secuencias de escape.

### Definicion formal

```
M_str = (Q_str, Σ_str, δ_str, s0, {s_cerrada})
```

#### Q_str — Conjunto de estados

```
Q_str = { s0, s_dentro, s_escape, s_cerrada, sERR }
```

| Estado | Significado |
|--------|-------------|
| `s0` | Inicio: esperando comilla de apertura `"` |
| `s_dentro` | Dentro de la cadena: acumulando caracteres o escapes |
| `s_escape` | Barra invertida `\` leida: esperando secuencia de escape valida |
| `s_cerrada` | Comilla de cierre `"` leida: cadena valida y completa |
| `sERR` | Error: token inesperado (sumidero) |

#### Σ_str — Alfabeto

```
Σ_str = { COMILLA, CHAR, BARRA, ESC_SEQ }
```

| Simbolo | Significado |
|---------|-------------|
| `COMILLA` | El caracter `"` |
| `CHAR` | Cualquier caracter excepto `"` y `\` |
| `BARRA` | El caracter `\` (inicio de escape) |
| `ESC_SEQ` | Secuencia de escape completa: `\n`, `\t`, `\\`, `\"`, `\r`, `\0` |

#### δ_str — Funcion de transicion

| Estado | `COMILLA` | `CHAR` | `BARRA` | `ESC_SEQ` |
|--------|-----------|--------|---------|-----------|
| `s0` | `s_dentro` | `sERR` | `sERR` | `sERR` |
| `s_dentro` | `s_cerrada` | `s_dentro` | `s_escape` | `sERR` |
| `s_escape` | `sERR` | `sERR` | `sERR` | `s_dentro` |
| `s_cerrada` | `sERR` | `sERR` | `sERR` | `sERR` |
| `sERR` | `sERR` | `sERR` | `sERR` | `sERR` |

#### q₀ y F

```
q₀_str = s0
F_str  = { s_cerrada }
```

### Lenguaje aceptado

```
L(M_str) = { w ∈ Σ_str* | δ*(s0, w) = s_cerrada }
```

Donde `δ*` es la clausura reflexiva y transitiva de `δ`.

### Diagrama de estados

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
               │ ESC_SEQ
               └──────────────────► s_dentro
               │
               │ " (cierra)
               ▼
            s_cerrada (F)
```

### Expresion regular equivalente

```
L(M_str) = " ( CHAR | \ ( n | t | r | 0 | " | \ ) )* "
```

---

## AFD 2 — Identificador

**Archivo:** `afd_print.ts` — funcion `afd_id`

Reconoce un identificador valido de C++: letra o guion bajo seguido de letras, digitos o guion bajo.

### Definicion formal

```
M_id = (Q_id, Σ_id, δ_id, i0, {i_id})
```

#### Q_id — Conjunto de estados

```
Q_id = { i0, i_id, iERR }
```

| Estado | Significado |
|--------|-------------|
| `i0` | Inicio: esperando letra o `_` |
| `i_id` | Identificador en curso: aceptando letras, digitos y `_` adicionales |
| `iERR` | Error (sumidero) |

#### Σ_id — Alfabeto

```
Σ_id = { LETRA, DIGITO }
```

| Simbolo | Significado |
|---------|-------------|
| `LETRA` | `[a-zA-Z_]` — cualquier letra mayuscula, minuscula o guion bajo |
| `DIGITO` | `[0-9]` — cualquier digito decimal |

#### δ_id — Funcion de transicion

| Estado | `LETRA` | `DIGITO` |
|--------|---------|----------|
| `i0` | `i_id` | `iERR` |
| `i_id` | `i_id` | `i_id` |
| `iERR` | `iERR` | `iERR` |

#### q₀ y F

```
q₀_id = i0
F_id  = { i_id }
```

### Lenguaje aceptado

```
L(M_id) = { w ∈ Σ_id* | δ*(i0, w) = i_id }
```

### Expresion regular

```
L(M_id) = [a-zA-Z_][a-zA-Z0-9_]*
```

Nota: El lenguaje requiere al menos un caracter (ε no es aceptado porque `i0` no es estado final y no hay transiciones ε).

### Nota sobre palabras reservadas

El lenguaje aceptado por `M_id` es **supraconjunto** de los identificadores validos de C++. La restriccion de palabras reservadas se aplica **post-automata** mediante la funcion `validarNombreVariable` que intersecta con el conjunto de palabras reservadas:

```
L_CheemScript = L(M_id) \ R
```

Donde `R = { int, float, double, char, bool, string, void, return, if, else, for, while, do, switch, case, break, continue, default, true, false, nullptr, class, struct, enum, namespace, cout, cin, endl, auto, const, static, ... }`

---

## AFD 3 — Numero entero o decimal

**Archivo:** `afd_print.ts` — funcion `afd_num`

Reconoce un numero entero sin signo (ej: `42`) o decimal (ej: `3.14`). Rechaza punto colgante (ej: `3.`).

### Definicion formal

```
M_num = (Q_num, Σ_num, δ_num, n0, {n_entero, n_decimal})
```

#### Q_num — Conjunto de estados

```
Q_num = { n0, n_entero, n_punto, n_decimal, nERR }
```

| Estado | Significado |
|--------|-------------|
| `n0` | Inicio: esperando digito |
| `n_entero` | Leyendo parte entera (aceptacion parcial) |
| `n_punto` | Punto decimal `." leido: esperando digitos fraccionarios |
| `n_decimal` | Leyendo parte decimal (aceptacion) |
| `nERR` | Error (sumidero) |

#### Σ_num — Alfabeto

```
Σ_num = { DIGITO, PUNTO }
```

| Simbolo | Significado |
|---------|-------------|
| `DIGITO` | `[0-9]` |
| `PUNTO` | `"."` |

#### δ_num — Funcion de transicion

| Estado | `DIGITO` | `PUNTO` |
|--------|----------|---------|
| `n0` | `n_entero` | `nERR` |
| `n_entero` | `n_entero` | `n_punto` |
| `n_punto` | `n_decimal` | `nERR` |
| `n_decimal` | `n_decimal` | `nERR` |
| `nERR` | `nERR` | `nERR` |

#### q₀ y F

```
q₀_num = n0
F_num  = { n_entero, n_decimal }
```

### Lenguaje aceptado

```
L(M_num) = { w ∈ Σ_num* | δ*(n0, w) ∈ F_num }
```

### Expresion regular

```
L(M_num) = [0-9]+ ( "." [0-9]+ )?
```

### Propiedades

- `L(M_num)` es un lenguaje regular
- `L(M_num)` no incluye la cadena vacia (ε)
- `L(M_num)` no incluye el punto decimal solitario (`.`)
- `L(M_num)` no incluye numeros con punto colgante (`3.`)

---

## AFD 4 — Expresion de concatenacion (print)

**Archivo:** `afd_print.ts` — funcion `afd_print`

Valida el argumento completo del bloque `print` como concatenacion de atomos.

### Definicion formal

```
M_print = (Q_print, Σ_print, δ_print, p0, {p_atom})
```

#### Q_print — Conjunto de estados

```
Q_print = { p0, p_atom, p_plus, pERR }
```

| Estado | Significado |
|--------|-------------|
| `p0` | Inicio: esperando un atomo (STRING, ID, NUM) |
| `p_atom` | Atomo leido: expresion parcialmente valida (aceptacion) |
| `p_plus` | Operador `+` leido: esperando el siguiente atomo |
| `pERR` | Error (sumidero) |

#### Σ_print — Alfabeto

```
Σ_print = { STRING, ID, NUM, PLUS }
```

Donde:
- `STRING` = token ya validado por `afd_string` (AFD 1)
- `ID` = token ya validado por `afd_id` (AFD 2)
- `NUM` = token ya validado por `afd_num` (AFD 3)
- `PLUS` = el operador de concatenacion `+`

#### δ_print — Funcion de transicion

| Estado | `STRING` | `ID` | `NUM` | `PLUS` |
|--------|----------|------|-------|--------|
| `p0` | `p_atom` | `p_atom` | `p_atom` | `pERR` |
| `p_atom` | `pERR` | `pERR` | `pERR` | `p_plus` |
| `p_plus` | `p_atom` | `p_atom` | `p_atom` | `pERR` |
| `pERR` | `pERR` | `pERR` | `pERR` | `pERR` |

#### q₀ y F

```
q₀_print = p0
F_print  = { p_atom }
```

### Lenguaje aceptado

```
L(M_print) = { w ∈ Σ_print* | δ*(p0, w) = p_atom }
```

### Gramatica regular

```
EXPR  → ATOM ( '+' ATOM )*
ATOM  → STRING | ID | NUM
```

### Expresion regular

```
L(M_print) = (STRING | ID | NUM) ( '+' (STRING | ID | NUM) )*
```

### Propiedades

- El unico estado de aceptacion es `p_atom`: esto asegura que la expresion nunca termine con `+` colgante
- El token `PLUS` nunca puede aparecer al inicio ni al final
- No se permiten dos `+` consecutivos

---

## AFD 5 — Entero con signo

**Archivo:** `afd_var_infer.ts` — funcion `esEntero`

Reconoce un entero decimal con signo opcional (`+` o `-`).

### Definicion formal

```
M_int = (Q_int, Σ_int, δ_int, e0, {e_digito})
```

#### Q_int — Conjunto de estados

```
Q_int = { e0, e_signo, e_digito, eERR }
```

| Estado | Significado |
|--------|-------------|
| `e0` | Inicio: esperando digito o signo |
| `e_signo` | Signo `+` o `-` leido: esperando digito |
| `e_digito` | Leyendo digitos (aceptacion) |
| `eERR` | Error (sumidero) |

#### Σ_int — Alfabeto

```
Σ_int = { SIGNO, DIGITO }
```

Donde `SIGNO ∈ {+, -}` y `DIGITO ∈ {0..9}`.

#### δ_int — Funcion de transicion

| Estado | `SIGNO` | `DIGITO` |
|--------|---------|----------|
| `e0` | `e_signo` | `e_digito` |
| `e_signo` | `eERR` | `e_digito` |
| `e_digito` | `eERR` | `e_digito` |
| `eERR` | `eERR` | `eERR` |

#### q₀ y F

```
q₀_int = e0
F_int  = { e_digito }
```

### Expresion regular

```
L(M_int) = [+-]? [0-9]+
```

---

## AFD 6 — Double con signo

**Archivo:** `afd_var_infer.ts` — funcion `esDouble`

Reconoce un numero de punto flotante con signo opcional.

### Definicion formal

```
M_dbl = (Q_dbl, Σ_dbl, δ_dbl, d0, {d_decimal})
```

#### Q_dbl — Conjunto de estados

```
Q_dbl = { d0, d_signo, d_entero, d_punto, d_decimal, dERR }
```

| Estado | Significado |
|--------|-------------|
| `d0` | Inicio: esperando digito o signo |
| `d_signo` | Signo leido: esperando parte entera |
| `d_entero` | Parte entera en curso |
| `d_punto` | Punto decimal leido: esperando digitos fraccionarios |
| `d_decimal` | Parte decimal en curso (aceptacion) |
| `dERR` | Error (sumidero) |

#### Σ_dbl — Alfabeto

```
Σ_dbl = { SIGNO, DIGITO, PUNTO }
```

#### δ_dbl — Funcion de transicion

| Estado | `SIGNO` | `DIGITO` | `PUNTO` |
|--------|---------|----------|---------|
| `d0` | `d_signo` | `d_entero` | `dERR` |
| `d_signo` | `dERR` | `d_entero` | `dERR` |
| `d_entero` | `dERR` | `d_entero` | `d_punto` |
| `d_punto` | `dERR` | `d_decimal` | `dERR` |
| `d_decimal` | `dERR` | `d_decimal` | `dERR` |
| `dERR` | `dERR` | `dERR` | `dERR` |

#### q₀ y F

```
q₀_dbl = d0
F_dbl  = { d_decimal }
```

### Expresion regular

```
L(M_dbl) = [+-]? [0-9]+ "." [0-9]+
```

Nota: A diferencia de `M_num`, `M_dbl` **requiere** el punto decimal (diferencia semantica: separa enteros de reales).

---

## AFD 7 — Booleano literal

**Archivo:** `afd_var_infer.ts` — funcion `esBool`

Reconoce exclusivamente las palabras `true` y `false`.

### Definicion formal

```
M_bool = (Q_bool, Σ_bool, δ_bool, b0, {b_ok})
```

#### Q_bool — Conjunto de estados

```
Q_bool = {
  b0,                    // inicio
  bt1, bt2, bt3, bt4,   // "true" en progreso
  bf1, bf2, bf3, bf4, bf5, // "false" en progreso
  b_ok,                  // palabra completa (aceptacion)
  bERR                   // error (sumidero)
}
```

#### Σ_bool — Alfabeto

```
Σ_bool = { t, r, u, e, f, a, l, s }
```

#### δ_bool — Funcion de transicion

| Estado | `t` | `r` | `u` | `e` | `f` | `a` | `l` | `s` | otro |
|--------|-----|-----|-----|-----|-----|-----|-----|-----|------|
| `b0` | `bt1` | `bERR` | `bERR` | `bERR` | `bf1` | `bERR` | `bERR` | `bERR` | `bERR` |
| `bt1` | `bERR` | `bt2` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` |
| `bt2` | `bERR` | `bERR` | `bt3` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` |
| `bt3` | `bERR` | `bERR` | `bERR` | `b_ok` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` |
| `bf1` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bf2` | `bERR` | `bERR` | `bERR` |
| `bf2` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bf3` | `bERR` | `bERR` |
| `bf3` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bf4` | `bERR` |
| `bf4` | `bERR` | `bERR` | `bERR` | `bf5` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` |
| `bf5` | `bERR` | `bERR` | `bERR` | `b_ok` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` |
| `b_ok` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` | `bERR` |

#### q₀ y F

```
q₀_bool = b0
F_bool  = { b_ok }
```

### Lenguaje aceptado

```
L(M_bool) = { "true", "false" }
```

---

## AFD 8 — Char literal

**Archivo:** `afd_var_infer.ts` — funcion `esChar`

Reconoce un caracter literal entre comillas simples, incluyendo secuencias de escape.

### Definicion formal

```
M_char = (Q_char, Σ_char, δ_char, ch0, {ch_cierra})
```

#### Q_char — Conjunto de estados

```
Q_char = { ch0, ch_abre, ch_escape, ch_contenido, ch_cierra, chERR }
```

| Estado | Significado |
|--------|-------------|
| `ch0` | Inicio: esperando `'` |
| `ch_abre` | Comilla simple de apertura leida |
| `ch_escape` | `\` leido: esperando escape valido |
| `ch_contenido` | Caracter contenido leido: esperando `'` de cierre |
| `ch_cierra` | Comilla simple de cierre leida (aceptacion) |
| `chERR` | Error (sumidero) |

#### Σ_char — Alfabeto

```
Σ_char = { COMILLA_S, CHAR, BARRA, ESC_SEQ }
```

Donde:
- `COMILLA_S` = `'`
- `CHAR` = cualquier caracter excepto `'` y `\`
- `BARRA` = `\`
- `ESC_SEQ` ∈ { `\n`, `\t`, `\r`, `\f`, `\v`, `\a`, `\b`, `\\`, `\'`, `\"`, `\0` }

#### δ_char — Funcion de transicion

| Estado | `COMILLA_S` | `CHAR` | `BARRA` | `ESC_SEQ` |
|--------|-------------|--------|---------|-----------|
| `ch0` | `ch_abre` | `chERR` | `chERR` | `chERR` |
| `ch_abre` | `chERR` | `ch_contenido` | `ch_escape` | `chERR` |
| `ch_escape` | `chERR` | `chERR` | `chERR` | `ch_contenido` |
| `ch_contenido` | `ch_cierra` | `chERR` | `chERR` | `chERR` |
| `ch_cierra` | `chERR` | `chERR` | `chERR` | `chERR` |
| `chERR` | `chERR` | `chERR` | `chERR` | `chERR` |

#### q₀ y F

```
q₀_char = ch0
F_char  = { ch_cierra }
```

### Expresion regular

```
L(M_char) = ' ( [^\'\\] | \ ( n | t | r | f | v | a | b | \ | ' | " | 0 ) ) '
```

---

## AFD 9 — Entero positivo

**Archivo:** `afd_repeat.ts` — funcion `afd_num_pos`

Reconoce un entero positivo: uno o mas digitos del 0 al 9, sin signo, sin punto.

### Definicion formal

```
M_pos = (Q_pos, Σ_pos, δ_pos, n0, {n_digito})
```

#### Q_pos — Conjunto de estados

```
Q_pos = { n0, n_digito, nERR }
```

| Estado | Significado |
|--------|-------------|
| `n0` | Inicio: esperando digito |
| `n_digito` | Digito/s leidos (aceptacion) |
| `nERR` | Error (sumidero) |

#### Σ_pos — Alfabeto

```
Σ_pos = { DIGITO }
```

#### δ_pos — Funcion de transicion

| Estado | `DIGITO` |
|--------|----------|
| `n0` | `n_digito` |
| `n_digito` | `n_digito` |
| `nERR` | `nERR` |

#### q₀ y F

```
q₀_pos = n0
F_pos  = { n_digito }
```

### Expresion regular

```
L(M_pos) = [0-9]+
```

### Relacion con otros automatas

`M_pos` es un subconjunto de `M_num` (AFD 3): acepta el mismo lenguaje que la parte entera de `M_num`, pero rechaza explicitamente el punto decimal. Se usa exclusivamente para validar `count` en bloques `repeat`.

---

## AFD 10 — Identificador para count

**Archivo:** `afd_repeat.ts` — funcion `afd_id_count`

Identico en definicion a `M_id` (AFD 2). Se incluye como automata independiente en `afd_repeat.ts` para evitar dependencias circulares.

### Definicion formal

```
M_idc = (Q_idc, Σ_idc, δ_idc, i0, {i_id})
```

#### Q_idc — Conjunto de estados

```
Q_idc = { i0, i_id, iERR }
```

#### Σ_idc — Alfabeto

```
Σ_idc = { LETRA, DIGITO }
```

Donde `LETRA ∈ [a-zA-Z_]` y `DIGITO ∈ [0-9]`.

#### δ_idc — Funcion de transicion

| Estado | `LETRA` | `DIGITO` |
|--------|---------|----------|
| `i0` | `i_id` | `iERR` |
| `i_id` | `i_id` | `i_id` |
| `iERR` | `iERR` | `iERR` |

#### q₀ y F

```
q₀_idc = i0
F_idc  = { i_id }
```

### Expresion regular

```
L(M_idc) = [a-zA-Z_][a-zA-Z0-9_]*
```

---

## PDA 11 — Expresion aritmetica (count)

**Archivo:** `afd_repeat.ts` — funciones parser (`parseSum`, `parseTerm`, `parseFactor`, `parseAtom`)

No es un AFD puro sino un **Autómata de Pila (PDA)** simulado mediante parser recursivo descendente. La pila del lenguaje anfitrion maneja el anidamiento de parentesis.

### Gramatica libre de contexto

```
COUNT     → EXPR_ARIT
EXPR_ARIT → SUM
SUM       → TERM ( OP_ADD TERM )*
TERM      → FACTOR ( OP_MUL FACTOR )*
FACTOR    → '-'? ATOM
ATOM      → NUM | ID | '(' SUM ')'

OP_ADD    → '+' | '-'
OP_MUL    → '*' | '/' | '%'
NUM       → DIGITO+          (validado por M_pos, AFD 9)
ID        → LETRA ...        (validado por M_idc, AFD 10)
```

### Jerarquia de precedencia (mayor a menor)

```
1. ( )         — parentesis (anidamiento)
2. - unario    — negacion de FACTOR
3. *, /, %     — multiplicacion, division, modulo
4. +, -        — suma, resta
```

### Conjuntos FIRST y FOLLOW

| No terminal | FIRST | FOLLOW |
|-------------|-------|--------|
| `SUM` | `{NUM, ID, (, -}` | `{), $}` |
| `TERM` | `{NUM, ID, (, -}` | `{+, -, ), $}` |
| `FACTOR` | `{NUM, ID, (, -}` | `{*, /, %, +, -, ), $}` |
| `ATOM` | `{NUM, ID, (}` | `{*, /, %, +, -, ), $}` |

### Funcion de transicion por funcion

Cada funcion del parser implementa un sub-automata:

#### `parseSum` — decision en funcion del token

| Token actual | Accion |
|-------------|--------|
| `NUM`, `ID`, `PAREN_A`, `OP_ADD(-)` | Delega a `parseTerm` |
| `OP_ADD(+/-)` despues de TERM | Consume, llama `parseTerm`, loop |
| `PAREN_C`, `$` (fin) | Retorna exito (TERM completo) |
| `OP_MUL`, `ERR` | Error |

#### `parseTerm` — decision en funcion del token

| Token actual | Accion |
|-------------|--------|
| `NUM`, `ID`, `PAREN_A`, `OP_ADD(-)` | Delega a `parseFactor` |
| `OP_MUL(*,/,%)` despues de FACTOR | Consume, llama `parseFactor`, loop |
| `OP_ADD`, `PAREN_C`, `$` | Retorna exito (FACTOR completo) |
| `ERR` | Error |

#### `parseFactor` — decision en funcion del token

| Token actual | Accion |
|-------------|--------|
| `OP_ADD(-)` | Consume signo unario, delega a `parseAtom` |
| `NUM`, `ID`, `PAREN_A` | Delega a `parseAtom` (sin signo) |
| `OP_ADD(+)` | Error (`+` unario no soportado en count) |
| otro | Error |

#### `parseAtom` — decision en funcion del token

| Token actual | Estado | Accion |
|-------------|--------|--------|
| `NUM` | `a_num` | Valida con `M_pos`, consume 1 token |
| `ID` | `a_id` | Valida con `M_idc`, consume 1 token |
| `PAREN_A` | `a_paren` | Consume `(`, llama `parseSum`, espera `)` |
| `PAREN_C` | `aERR` | Error (parentesis sobrante) |
| `OP_ADD`, `OP_MUL` | `aERR` | Error |
| `$` | `aERR` | Error |

### Lenguaje aceptado

```
L(M_arit) = { w ∈ TokenCount* | parseSum(w, 0) → (true, |w|) }
```

Donde `TokenCount` es el conjunto de tokens:

```
TokenCount = { NUM, ID, OP_ADD, OP_MUL, PAREN_A, PAREN_C }
```

---

## AFD 12 — Init del for

**Archivo:** `afd_for.ts` — funcion `validarInit`

Valida el campo `init` del bloque `for`, que puede ser una declaracion con tipo o una asignacion simple.

### Definicion formal

```
M_init = (Q_init, Σ_init, δ_init, in0, {in_expr})
```

#### Q_init — Conjunto de estados

```
Q_init = { in0, in_tipo, in_id, in_id_decl, in_asigna, in_expr, inERR }
```

| Estado | Significado |
|--------|-------------|
| `in0` | Inicio: esperando TIPO o ID |
| `in_tipo` | Tipo (`int`/`long`/`size_t`) leido: esperando nombre de variable |
| `in_id` | ID leido (asignacion, sin tipo): esperando `=` |
| `in_id_decl` | ID leido (declaracion con tipo): esperando `=` |
| `in_asigna` | `=` leido: esperando expresion aritmetica |
| `in_expr` | Expresion aritmetica leida (aceptacion) |
| `inERR` | Error (sumidero) |

#### Σ_init — Alfabeto de tokens

```
Σ_init = { TIPO, ID, ASIGNA, EXPR }
```

Donde:
- `TIPO` ∈ { `"int"`, `"long"`, `"size_t"` }
- `ID` = token validado por `M_id` (AFD 2)
- `ASIGNA` = el simbolo `=`
- `EXPR` = token validado por `M_arit` (PDA 11)

#### δ_init — Funcion de transicion

| Estado | `TIPO` | `ID` | `ASIGNA` | `EXPR` |
|--------|--------|------|----------|--------|
| `in0` | `in_tipo` | `in_id` | `inERR` | `inERR` |
| `in_tipo` | `inERR` | `in_id_decl` | `inERR` | `inERR` |
| `in_id` | `inERR` | `inERR` | `in_asigna` | `inERR` |
| `in_id_decl` | `inERR` | `inERR` | `in_asigna` | `inERR` |
| `in_asigna` | `inERR` | `inERR` | `inERR` | `in_expr` |
| `in_expr` | `inERR` | `inERR` | `inERR` | `inERR` |
| `inERR` | `inERR` | `inERR` | `inERR` | `inERR` |

#### q₀ y F

```
q₀_init = in0
F_init  = { in_expr }
```

### Lenguaje aceptado

```
L(M_init) = { w ∈ Σ_init* | δ*(in0, w) = in_expr }
```

### Gramatica regular

```
INIT → TIPO ID '=' EXPR     (declaracion)
     | ID '=' EXPR           (asignacion)
```

### Diagrama de estados

```
         TIPO            ID
  in0 ──────────► in_tipo ───────► in_id_decl ──┐
   │                                              │ ASIGNA (=)
   │ ID                                           ▼
   └─────────────────────────► in_id ──────► in_asigna ──► in_expr (F)
                                                (EXPR del
                                             PDA aritmetico)
```

---

## AFD 13 — Increment del for

**Archivo:** `afd_for.ts` — funcion `validarIncrement`

Valida el campo `increment` del bloque `for`: postfijo, prefijo, compuesto o asignacion simple.

### Definicion formal

```
M_incr = (Q_incr, Σ_incr, δ_incr, ic0, {ic_postfijo, ic_prefijo, ic_expr})
```

#### Q_incr — Conjunto de estados

```
Q_incr = {
  ic0,                // inicio
  ic_id,              // ID leido
  ic_op_pre,          // OP_POST (++/--) leido al inicio (prefijo)
  ic_postfijo,        // ID + OP_POST (aceptacion)
  ic_prefijo,         // OP_POST + ID (aceptacion)
  ic_comp_asigna,     // OP_COMP o ASIGNA leido, esperando EXPR
  ic_expr,            // EXPR leido tras compuesto/asignacion (aceptacion)
  icERR               // error (sumidero)
}
```

| Estado | Significado |
|--------|-------------|
| `ic0` | Inicio: esperando ID o OP_POST |
| `ic_id` | ID leido: esperando OP_POST, OP_COMP o ASIGNA |
| `ic_op_pre` | OP_POST leido al inicio: esperando ID (prefijo) |
| `ic_postfijo` | `i++` o `i--` completo (aceptacion) |
| `ic_prefijo` | `++i` o `--i` completo (aceptacion) |
| `ic_comp_asigna` | `+=`/`-=`/`=` leido: esperando EXPR |
| `ic_expr` | `i += 2` o `i = i+1` completo (aceptacion) |

#### Σ_incr — Alfabeto de tokens

```
Σ_incr = { ID, OP_POST, OP_COMP, ASIGNA, EXPR }
```

Donde:
- `ID` = token validado por `M_id` (AFD 2)
- `OP_POST` ∈ { `++`, `--` }
- `OP_COMP` ∈ { `+=`, `-=`, `*=`, `/=`, `%=` }
- `ASIGNA` = `=`
- `EXPR` = token validado por `M_arit` (PDA 11)

#### δ_incr — Funcion de transicion

| Estado | `ID` | `OP_POST` | `OP_COMP` | `ASIGNA` | `EXPR` |
|--------|------|-----------|-----------|----------|--------|
| `ic0` | `ic_id` | `ic_op_pre` | `icERR` | `icERR` | `icERR` |
| `ic_id` | `icERR` | `ic_postfijo` | `ic_comp_asigna` | `ic_comp_asigna` | `icERR` |
| `ic_op_pre` | `ic_prefijo` | `icERR` | `icERR` | `icERR` | `icERR` |
| `ic_postfijo` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |
| `ic_prefijo` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |
| `ic_comp_asigna` | `icERR` | `icERR` | `icERR` | `icERR` | `ic_expr` |
| `ic_expr` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |
| `icERR` | `icERR` | `icERR` | `icERR` | `icERR` | `icERR` |

#### q₀ y F

```
q₀_incr = ic0
F_incr  = { ic_postfijo, ic_prefijo, ic_expr }
```

### Lenguaje aceptado

```
L(M_incr) = { w ∈ Σ_incr* | δ*(ic0, w) ∈ F_incr }
```

### Gramatica regular

```
INCREMENT → ID OP_POST          (postfijo: i++)
          | OP_POST ID           (prefijo: ++i)
          | ID OP_COMP EXPR      (compuesto: i += 2)
          | ID '=' EXPR          (asignacion: i = i+1)
```

### Diagrama de estados

```
                 OP_POST (++/--)
          ID ───────────────────► ic_postfijo (F)
           │
           │ OP_COMP (+=,-=,...) ──┐
  ic0 ────► ic_id                   ├──► ic_comp_asigna ──► ic_expr (F)
           │ ASIGNA (=)           ──┘        EXPR
           │
           └── (nada mas desde ic_id)

  ic0 ────► ic_op_pre (++/--) ──► ic_prefijo (F)
                    ID
```

---

## AFD 14 — Estructura if/else if/else

**Archivo:** `afd_if.ts` — funcion `afd_if`

Valida la estructura completa del bloque `if/else if/else` como secuencia de tokens.

### Definicion formal

```
M_if = (Q_if, Σ_if, δ_if, q0, {q_cierraLlave, q_cierraLlave2, q_fin})
```

#### Q_if — Conjunto de estados

```
Q_if = {
  q0,
  q_if,                             // "if" leido
  q_abreParen, q_cond, q_cierraParen,    // parentesis de condicion
  q_abreLlave, q_cuerpo, q_cierraLlave,  // cuerpo del if
  q_else,                            // bifurcacion: else if vs else
  q_elseif,                          // "else if"
  q_abreParen2, q_cond2, q_cierraParen2, // parentesis de else if
  q_abreLlave2, q_cuerpo2, q_cierraLlave2, // cuerpo de else if
  q_abreLlaveF, q_cuerpoF, q_fin,    // else final
  qERR
}
```

#### Σ_if — Alfabeto

```
Σ_if = { "if", "else", "(", ")", "{", "}", EXPR, INSTR }
```

Donde:
- `EXPR` = token compuesto validado por el PDA de expresiones booleanas (PDA 16)
- `INSTR` = token que representa cualquier instruccion simple valida en el cuerpo

#### δ_if — Funcion de transicion

| Estado | `"if"` | `"("` | `EXPR` | `")"` | `"{"` | `INSTR` | `"}"` | `"else"` |
|--------|--------|-------|--------|-------|-------|---------|-------|----------|
| `q0` | `q_if` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` |
| `q_if` | `qERR` | `q_abreParen` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` |
| `q_abreParen` | `qERR` | `qERR` | `q_cond` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` |
| `q_cond` | `qERR` | `qERR` | `qERR` | `q_cierraParen` | `qERR` | `qERR` | `qERR` | `qERR` |
| `q_cierraParen` | `qERR` | `qERR` | `qERR` | `qERR` | `q_abreLlave` | `qERR` | `qERR` | `qERR` |
| `q_abreLlave` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `q_cuerpo` | `q_cierraLlave` | `qERR` |
| `q_cuerpo` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `q_cuerpo` | `q_cierraLlave` | `qERR` |
| `q_cierraLlave` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `q_else` |
| `q_else` | `q_elseif` | `qERR` | `qERR` | `qERR` | `q_abreLlaveF` | `qERR` | `qERR` | `qERR` |
| `q_elseif` | `qERR` | `q_abreParen2` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` |
| `q_abreParen2` | `qERR` | `qERR` | `q_cond2` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` |
| `q_cond2` | `qERR` | `qERR` | `qERR` | `q_cierraParen2` | `qERR` | `qERR` | `qERR` | `qERR` |
| `q_cierraParen2` | `qERR` | `qERR` | `qERR` | `qERR` | `q_abreLlave2` | `qERR` | `qERR` | `qERR` |
| `q_abreLlave2` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `q_cuerpo2` | `q_cierraLlave2` | `qERR` |
| `q_cuerpo2` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `q_cuerpo2` | `q_cierraLlave2` | `qERR` |
| `q_cierraLlave2` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `q_else` |
| `q_abreLlaveF` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `q_cuerpoF` | `q_fin` | `qERR` |
| `q_cuerpoF` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `q_cuerpoF` | `q_fin` | `qERR` |
| `q_fin` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` |
| `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` | `qERR` |

#### q₀ y F

```
q₀_if = q0
F_if  = { q_cierraLlave, q_cierraLlave2, q_fin }
```

### Lenguaje aceptado

```
L(M_if) = "if" "(" EXPR ")" "{" INSTR* "}"
          ( "else" "if" "(" EXPR ")" "{" INSTR* "}" )*
          ( "else" "{" INSTR* "}" )?
```

### Propiedades notables

1. **Ciclo de `else if`:** El estado `q_cierraLlave2` apunta a `q_else`, permitiendo cualquier cantidad de `else if` encadenados:
   ```
   q_cierraLlave2 (F) ── else ──► q_else ── if ──► q_elseif ── ... ──► q_cierraLlave2 (F) ── (ciclo)
   ```

2. **Determinismo:** Desde cada estado, para cada simbolo de `Σ_if`, hay exactamente una transicion definida (a `qERR` si no aplica).

3. **El token `EXPR`** llega pre-validado por el PDA de expresiones booleanas (PDA 16). El AFD del `if` lo trata como atomico.

---

## AFD 15 — Comparacion simple

**Archivo:** `afd_expr.ts` — funcion `afd4_comparacion`

Reconoce expresiones de comparacion simple del estilo `variable operador valor`.

### Definicion formal

```
M_cmp = (Q_cmp, Σ_cmp, δ_cmp, q0, {q_val})
```

#### Q_cmp — Conjunto de estados

```
Q_cmp = { q0, q_id1, q_esp1, q_op1, q_op2, q_esp2, q_val, qERR }
```

| Estado | Significado |
|--------|-------------|
| `q0` | Inicio: esperando letra para identificador |
| `q_id1` | Identificador en curso |
| `q_esp1` | Espacio(s) despues del identificador: esperando operador |
| `q_op1` | Primer caracter de operador leido |
| `q_op2` | Segundo caracter de operador (para `==`, `!=`, `<=`, `>=`) |
| `q_esp2` | Espacio(s) despues del operador: esperando valor |
| `q_val` | Valor leido (identificador o numero) (aceptacion) |
| `qERR` | Error (sumidero) |

#### Σ_cmp — Alfabeto

```
Σ_cmp = { LETRA, DIGITO, ESPACIO, OP_COMP }
```

Donde:
- `LETRA` = `[a-zA-Z_]`
- `DIGITO` = `[0-9]`
- `ESPACIO` = `' '`
- `OP_COMP` = `<`, `>`, `!`, `=` (caracteres que inician operadores de comparacion)

#### δ_cmp — Funcion de transicion

| Estado | `LETRA` | `DIGITO` | `ESPACIO` | `OP_COMP` |
|--------|---------|----------|-----------|-----------|
| `q0` | `q_id1` | `qERR` | `qERR` | `qERR` |
| `q_id1` | `q_id1` | `q_id1` | `q_esp1` | `qERR` |
| `q_esp1` | `qERR` | `qERR` | `q_esp1` | `q_op1` |
| `q_op1` | `qERR` | `qERR` | `q_esp2` | `q_op2` |
| `q_op2` | `qERR` | `qERR` | `q_esp2` | `qERR` |
| `q_esp2` | `q_val` | `q_val` | `q_esp2` | `qERR` |
| `q_val` | `q_val` | `q_val` | `qERR` | `qERR` |
| `qERR` | `qERR` | `qERR` | `qERR` | `qERR` |

#### q₀ y F

```
q₀_cmp = q0
F_cmp  = { q_val }
```

### Lenguaje aceptado

```
L(M_cmp) = LETRA (LETRA | DIGITO)* ESPACIO* OP_COMP OP_COMP? ESPACIO* (LETRA | DIGITO)+
```

Nota: `OP_COMP?` maneja operadores de 1 caracter (`<`, `>`) y 2 caracteres (`==`, `!=`, `<=`, `>=`). El automata no distingue combinaciones invalidas como `>=<` porque eso quedaria capturado en la secuencia de tokens.

---

## PDA 16 — Expresion booleana

**Archivo:** `parser_expr.ts` — funcion `parseExpr`

Parser recursivo descendente (PDA con pila implicita) para expresiones booleanas completas.

### Gramatica libre de contexto

```
EXPR     → OR_EXPR
OR_EXPR  → AND_EXPR ( "||" AND_EXPR )*
AND_EXPR → NOT_EXPR ( "&&" NOT_EXPR )*
NOT_EXPR → "!" NOT_EXPR
         | ATOM
ATOM     → ID OP_REL VALOR
         | ID
         | "(" OR_EXPR ")"

OP_REL   → "<" | ">" | "<=" | ">=" | "==" | "!="
VALOR    → NUMBER | STRING | BOOL | ID
```

### Jerarquia de precedencia

```
1. ( )         — parentesis (anidamiento)
2. !           — NOT (unario)
3. &&          — AND
4. ||          — OR
5. < > <= >=   — relacionales (dentro de ATOM)
6. == !=       — igualdad (dentro de ATOM)
```

### Conjuntos FIRST y FOLLOW

| No terminal | FIRST | FOLLOW |
|-------------|-------|--------|
| `OR_EXPR` | `{!, ID, (, BOOL, NUM, STR}` | `{), $}` |
| `AND_EXPR` | `{!, ID, (, BOOL, NUM, STR}` | `{||, ), $}` |
| `NOT_EXPR` | `{!, ID, (, BOOL, NUM, STR}` | `{&&, ||, ), $}` |
| `ATOM` | `{ID, (, BOOL, NUM, STR}` | `{&&, ||, ), $}` |

### Lenguaje aceptado

```
L(M_bool) = { w ∈ TokenExpr* | parseExpr(w, 0) → (true, |w|) }
```

Donde `TokenExpr` es:

```
TokenExpr = { ID, NUM, STR, BOOL, OP_REL, OP_LOG, NOT, PAREN_A, PAREN_C }
```

---

## AFD 17 — Tamano de array

**Archivo:** `afd_var_infer.ts` — funcion `validarTamanio`

Valida que el tamano ingresado sea un entero positivo mayor que cero.

### Definicion formal

```
M_tam = (Q_tam, Σ_tam, δ_tam, q0, {q_resto})
```

#### Q_tam — Conjunto de estados

```
Q_tam = { q0, q_primero, q_resto, qERR }
```

| Estado | Significado |
|--------|-------------|
| `q0` | Inicio: esperando digito del 1 al 9 |
| `q_primero` | Primer digito leido (debe ser 1-9) |
| `q_resto` | Digitos siguientes (0-9) (aceptacion) |
| `qERR` | Error (sumidero) |

#### Σ_tam — Alfabeto

```
Σ_tam = { DIGITO_1_9, DIGITO_0 }
```

Donde:
- `DIGITO_1_9` = `[1-9]`
- `DIGITO_0` = `0`

#### δ_tam — Funcion de transicion

| Estado | `DIGITO_1_9` | `DIGITO_0` |
|--------|-------------|------------|
| `q0` | `q_primero` | `qERR` |
| `q_primero` | `q_resto` | `q_resto` |
| `q_resto` | `q_resto` | `q_resto` |
| `qERR` | `qERR` | `qERR` |

#### q₀ y F

```
q₀_tam = q0
F_tam  = { q_primero, q_resto }
```

### Expresion regular

```
L(M_tam) = [1-9][0-9]*
```

### Propiedades

- `L(M_tam)` no acepta el digito `0` como primer caracter (evita `0`, `01`, `007`, etc.)
- `L(M_tam)` requiere al menos un digito del 1 al 9
- El tamano `0` es semanticamente invalido (bucle/array vacio sin sentido)

---

## Resumen de todos los automatas

### Automatas sobre alfabeto de caracteres (analisis lexico)

| # | Nombre | Funcion | |Q| |Σ| | Estados finales | Lenguaje |
|---|--------|---------|-----|-----|-----------------|----------|
| 1 | String literal | `afd_string` | 5 | 4 | `{s_cerrada}` | `" (CHAR | ESC_SEQ)* "` |
| 2 | Identificador | `afd_id` | 3 | 2 | `{i_id}` | `[a-zA-Z_][a-zA-Z0-9_]*` |
| 3 | Numero literal | `afd_num` | 5 | 2 | `{n_entero, n_decimal}` | `[0-9]+(\.[0-9]+)?` |
| 5 | Entero con signo | `esEntero` | 4 | 2 | `{e_digito}` | `[+-]?[0-9]+` |
| 6 | Double con signo | `esDouble` | 6 | 3 | `{d_decimal}` | `[+-]?[0-9]+\.[0-9]+` |
| 7 | Booleano literal | `esBool` | 12 | 8 | `{b_ok}` | `"true" | "false"` |
| 8 | Char literal | `esChar` | 6 | 4 | `{ch_cierra}` | `'[^\'\\]|\\...'` |
| 9 | Entero positivo | `afd_num_pos` | 3 | 1 | `{n_digito}` | `[0-9]+` |
| 10 | ID para count | `afd_id_count` | 3 | 2 | `{i_id}` | `[a-zA-Z_][a-zA-Z0-9_]*` |
| 15 | Comparacion simple | `afd4_comparacion` | 8 | 4 | `{q_val}` | `id op valor` |
| 17 | Tamano array | `validarTamanio` | 4 | 2 | `{q_primero,q_resto}` | `[1-9][0-9]*` |

### Automatas sobre alfabeto de tokens (analisis sintactico)

| # | Nombre | Funcion | |Q| |Σ| | Estados finales | Gramatica |
|---|--------|---------|-----|-----|-----------------|-----------|
| 4 | Concatenacion print | `afd_print` | 4 | 4 | `{p_atom}` | `ATOM ('+' ATOM)*` |
| 12 | Init del for | `validarInit` | 7 | 4 | `{in_expr}` | `[TIPO] ID '=' EXPR` |
| 13 | Increment del for | `validarIncrement` | 8 | 5 | `{ic_postfijo, ic_prefijo, ic_expr}` | `ID OP_POST \| OP_POST ID \| ID OP_COMP EXPR \| ID '=' EXPR` |
| 14 | Estructura if | `afd_if` | 20 | 8 | `{q_cierraLlave, q_cierraLlave2, q_fin}` | `if(...){...} (else if(...){...})* (else{...})?` |

### PDAs (Automatas de Pila)

| # | Nombre | Funcion | Gramatica | Uso |
|---|--------|---------|-----------|-----|
| 11 | Expresion aritmetica | parser en `afd_repeat.ts` | `SUM → TERM (OP_ADD TERM)*` ... | `count` de `repeat`, `init`/`increment` de `for` |
| 16 | Expresion booleana | `parseExpr` en `parser_expr.ts` | `OR_EXPR → AND_EXPR ("||" AND_EXPR)*` ... | condicion de `if`, `while`, `for` |

### Dependencias entre automatas

```
                   ┌──────────────────────────────────────────────┐
                   │                                              │
                   ▼                                              │
  AFD 1 (string) ──► AFD 4 (concatenacion print) ◄── AFD 2 (id) │
                   │                              ▲── AFD 3 (num) │
                   │                                              │
  AFD 9 (num_pos) ──► PDA 11 (expr aritmetica) ◄── AFD 10 (id)   │
                       │              │                           │
                       ▼              ▼                           │
                  AFD 12 (init)  AFD 13 (increment)               │
                       │              │                           │
                       ▼              ▼                           │
                  AFD 14 (if) ◄── PDA 16 (expr booleana)          │
                       │              │                           │
                       ▼              ▼                           │
                  AFD 15 (comparacion) ───────────────────────────┘
```

---

*CheemScript — Documento de definicion formal de automatas implementados*
