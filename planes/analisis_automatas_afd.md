# Informe de Análisis Formal de Autómatas — Proyecto CheemScript

## 1. Introducción

El presente informe documenta el análisis formal de todos los autómatas implementados en el proyecto CheemScript. Para cada autómata se presenta su definición matemática, la tabla de transición completa y un veredicto sobre su fidelidad respecto a la teoría de la computación.

El proyecto implementa dos clases de autómatas:

- **Autómatas Finitos Deterministas (AFD)**: definidos como la 5-tupla M = (Q, Sigma, delta, q0, F).
- **Autómatas de Pila Deterministas (DPDA)**: definidos como la 7-tupla M = (Q, Sigma, Gamma, delta, q0, Z0, F).

---

## 2. Inventario de Autómatas

| N.° | Archivo | Función | Tipo | Veredicto |
|:---:|---------|---------|:----:|-----------|
| 1 | afd_print.ts | `afd_string` — Cadena literal | AFD | Correcto |
| 2 | afd_print.ts | `afd_id` — Identificador | AFD | Correcto |
| 3 | afd_print.ts | `afd_num` — Número literal | AFD | Correcto |
| 4 | afd_print.ts | `afd_print` — Concatenación | AFD | Correcto |
| 5 | afd_expr.ts | `afd4_comparacion` — Comparación | AFD | Observación menor |
| 6 | afd_var_infer.ts | `esEntero` — Entero con signo | AFD | Correcto |
| 7 | afd_var_infer.ts | `esDouble` — Decimal | AFD | Correcto |
| 8 | afd_var_infer.ts | `esBool` — Booleano | AFD | Correcto |
| 9 | afd_var_infer.ts | `esChar` — Carácter literal | AFD | Correcto |
| 10 | dpda_repeat.ts | `afd_num_pos` — Número positivo | AFD | Correcto |
| 11 | dpda_repeat.ts | `afd_id_count` — Identificador simple | AFD | Correcto |
| 12 | afd_if.ts | `afd_if` — Bloque if/else | AFD | Correcto |
| 13 | afd_switch.ts | `afd_switch` — Bloque switch | AFD | Correcto |
| 14 | afd_for.ts | `validarInit` — Inicialización for | AFD | Correcto |
| 15 | afd_for.ts | `validarIncrement` — Incremento for | AFD | Correcto |
| 16 | dpda_repeat.ts | `pdaExpresionAritmetica` — Expresiones aritméticas | DPDA | Correcto |
| 17 | dpda_expr.ts | `pdaExpresion` — Expresiones booleanas/relacionales | DPDA | Correcto |
| 18 | afd_var_infer.ts | `validarTamanioOVariable` — Tamaño con variables | Validador compuesto | Correcto |

---

## 3. Observaciones Teóricas Generales

### 3.1. Función de transición total en los AFD

En la teoría formal, la función de transición delta de un AFD debe ser **total**: debe estar definida para todo par (estado, símbolo). En la implementación, todos los autómatas emplean un estado trampa (sumidero), generalmente denominado `qERR`, al que se transita cuando no existe transición explícita. Esto se implementa mediante las cláusulas `else` de cada bloque `switch`. Las tablas de transición de este informe muestran dicho estado de forma explícita.

### 3.2. Justificación teórica de los DPDA

Los lenguajes que involucran paréntesis balanceados anidados no son regulares. Esto se demuestra formalmente mediante el Lema de Bombeo (Pumping Lemma) para lenguajes regulares: el lenguaje L = { (^n )^n | n >= 0 } no puede ser reconocido por ningún autómata finito. Por esta razón, los validadores de expresiones aritméticas y booleanas con paréntesis se implementaron como **Autómatas de Pila Deterministas (DPDA)** con pila explícita, lo cual constituye el formalismo mínimo necesario según la jerarquía de Chomsky (Tipo 2 — gramáticas libres de contexto).

---

## 4. Autómatas Finitos Deterministas (AFD)

### 4.1. AFD 1 — `afd_string`: Cadena literal entre comillas dobles

**Archivo**: `afd_print.ts`, líneas 77–109

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {s0, s_dentro, s_escape, s_cerrada, sERR}
- Sigma = {COMILLA, CHAR, BARRA, ESC_SEQ}
- q0 = s0
- F = {s_cerrada}

**Tabla de transición delta**:

| Estado | COMILLA | CHAR | BARRA | ESC_SEQ |
|--------|:-------:|:----:|:-----:|:-------:|
| s0 | s_dentro | sERR | sERR | sERR |
| s_dentro | s_cerrada | s_dentro | s_escape | s_dentro |
| s_escape | sERR | sERR | sERR | s_dentro |
| s_cerrada | sERR | sERR | sERR | sERR |
| sERR | sERR | sERR | sERR | sERR |

**Veredicto**: AFD correcto. Función de transición total. Un solo estado de aceptación. Determinista en cada paso.

**Observación**: El estado `s_escape` es efectivamente inalcanzable por diseño del tokenizador previo, que ya agrupa las secuencias de escape como tokens `ESC_SEQ` desde el estado `s_dentro`. El AFD es formalmente correcto pero podría simplificarse eliminando dicho estado.

---

### 4.2. AFD 2 — `afd_id`: Identificador con acceso a arreglo opcional

**Archivo**: `afd_print.ts`, líneas 131–163

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {i0, i_id, i_bracket_a, i_idx, i_bracket_c, iERR}
- Sigma = {LETRA, DIGITO, BRACKET_A, BRACKET_C, OTRO}
- q0 = i0
- F = {i_id, i_bracket_c}

**Tabla de transición delta**:

| Estado | LETRA | DIGITO | BRACKET_A | BRACKET_C | OTRO |
|--------|:-----:|:------:|:---------:|:---------:|:----:|
| i0 | i_id | iERR | iERR | iERR | iERR |
| i_id | i_id | i_id | i_bracket_a | iERR | iERR |
| i_bracket_a | i_idx | i_idx | iERR | iERR | iERR |
| i_idx | i_idx | i_idx | iERR | i_bracket_c | iERR |
| i_bracket_c | iERR | iERR | iERR | iERR | iERR |
| iERR | iERR | iERR | iERR | iERR | iERR |

**Veredicto**: AFD correcto. Dos estados de aceptación legítimos: identificador simple (`i_id`) o con acceso a arreglo (`i_bracket_c`).

---

### 4.3. AFD 3 — `afd_num`: Número literal (entero o decimal)

**Archivo**: `afd_print.ts`, líneas 186–215

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {n0, n_entero, n_punto, n_decimal, nERR}
- Sigma = {DIGITO, PUNTO}
- q0 = n0
- F = {n_entero, n_decimal}

**Tabla de transición delta**:

| Estado | DIGITO | PUNTO |
|--------|:------:|:-----:|
| n0 | n_entero | nERR |
| n_entero | n_entero | n_punto |
| n_punto | n_decimal | nERR |
| n_decimal | n_decimal | nERR |
| nERR | nERR | nERR |

**Veredicto**: AFD correcto. Rechaza correctamente cadenas como `3.` (punto colgante), `.` (solo punto). Acepta `42` y `3.14`.

---

### 4.4. AFD 4 — `afd_print`: Expresión de concatenación

**Archivo**: `afd_print.ts`, líneas 228–273

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {p0, p_atom, p_plus, pERR}
- Sigma = {STRING, ID, NUM, +}
- q0 = p0
- F = {p_atom}

**Tabla de transición delta**:

| Estado | STRING | ID | NUM | + |
|--------|:------:|:--:|:---:|:-:|
| p0 | p_atom | p_atom | p_atom | pERR |
| p_atom | pERR | pERR | pERR | p_plus |
| p_plus | p_atom | p_atom | p_atom | pERR |
| pERR | pERR | pERR | pERR | pERR |

**Veredicto**: AFD correcto. Reconoce el lenguaje regular ATOM ('+' ATOM)*, donde ATOM pertenece a {STRING, ID, NUM}.

---

### 4.5. AFD 5 — `afd4_comparacion`: Expresión de comparación simple

**Archivo**: `afd_expr.ts`, líneas 25–99

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {q0, q_id1, q_esp1, q_op1, q_op2, q_esp2, q_val, qERR}
- Sigma = {LETRA, DIGITO, ESPACIO, OP}
  - LETRA = [a-zA-Z_], DIGITO = [0-9], ESPACIO = ' ', OP = [<>!=]
- q0 = q0
- F = {q_val}

**Tabla de transición delta**:

| Estado | LETRA | DIGITO | ESPACIO | OP |
|--------|:-----:|:------:|:-------:|:--:|
| q0 | q_id1 | qERR | qERR | qERR |
| q_id1 | q_id1 | q_id1 | q_esp1 | qERR |
| q_esp1 | qERR | qERR | q_esp1 | q_op1 |
| q_op1 | qERR | qERR | q_esp2 | q_op2 |
| q_op2 | qERR | qERR | q_esp2 | qERR |
| q_esp2 | q_val | q_val | q_esp2 | qERR |
| q_val | q_val | q_val | qERR | qERR |
| qERR | qERR | qERR | qERR | qERR |

**Veredicto**: AFD formalmente correcto. Se observa que la transición delta(q_id1, OP) conduce a qERR, lo que implica que expresiones como `x<10` (sin espacios) son rechazadas, mientras que `x < 10` (con espacios) es aceptada. Si se desea aceptar expresiones sin espacios obligatorios, debe añadirse la transición delta(q_id1, OP) = q_op1.

---

### 4.6. AFD 6 — `esEntero`: Número entero con signo opcional

**Archivo**: `afd_var_infer.ts`, líneas 106–139

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {e0, e_signo, e_digito, eERR}
- Sigma = {DIGITO, SIGNO, OTRO}
- q0 = e0
- F = {e_digito}

**Tabla de transición delta**:

| Estado | DIGITO | SIGNO | OTRO |
|--------|:------:|:-----:|:----:|
| e0 | e_digito | e_signo | eERR |
| e_signo | e_digito | eERR | eERR |
| e_digito | e_digito | eERR | eERR |
| eERR | eERR | eERR | eERR |

**Veredicto**: AFD correcto. Acepta: `42`, `-7`, `+3`. Rechaza: `--5`, `+`, `-`, cadena vacía.

---

### 4.7. AFD 7 — `esDouble`: Número decimal con signo opcional

**Archivo**: `afd_var_infer.ts`, líneas 143–184

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {d0, d_signo, d_entero, d_punto, d_decimal, dERR}
- Sigma = {DIGITO, SIGNO, PUNTO, OTRO}
- q0 = d0
- F = {d_decimal}

**Tabla de transición delta**:

| Estado | DIGITO | SIGNO | PUNTO | OTRO |
|--------|:------:|:-----:|:-----:|:----:|
| d0 | d_entero | d_signo | dERR | dERR |
| d_signo | d_entero | dERR | dERR | dERR |
| d_entero | d_entero | dERR | d_punto | dERR |
| d_punto | d_decimal | dERR | dERR | dERR |
| d_decimal | d_decimal | dERR | dERR | dERR |
| dERR | dERR | dERR | dERR | dERR |

**Veredicto**: AFD correcto. Acepta exclusivamente decimales completos (`3.14`, `-2.5`). Rechaza enteros puros (`42`), puntos colgantes (`3.`), y dobles puntos (`3.1.4`).

---

### 4.8. AFD 8 — `esBool`: Valor booleano (`true` / `false`)

**Archivo**: `afd_var_infer.ts`, líneas 188–224

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {b0, bt1, bt2, bt3, bf1, bf2, bf3, bf4, b_ok, bERR}
- Sigma = Caracteres individuales del alfabeto ASCII
- q0 = b0
- F = {b_ok}

**Tabla de transición delta**:

| Estado | 't' | 'r' | 'u' | 'e' | 'f' | 'a' | 'l' | 's' | otro |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:----:|
| b0 | bt1 | bERR | bERR | bERR | bf1 | bERR | bERR | bERR | bERR |
| bt1 | bERR | bt2 | bERR | bERR | bERR | bERR | bERR | bERR | bERR |
| bt2 | bERR | bERR | bt3 | bERR | bERR | bERR | bERR | bERR | bERR |
| bt3 | bERR | bERR | bERR | b_ok | bERR | bERR | bERR | bERR | bERR |
| bf1 | bERR | bERR | bERR | bERR | bERR | bf2 | bERR | bERR | bERR |
| bf2 | bERR | bERR | bERR | bERR | bERR | bERR | bf3 | bERR | bERR |
| bf3 | bERR | bERR | bERR | bERR | bERR | bERR | bERR | bf4 | bERR |
| bf4 | bERR | bERR | bERR | b_ok | bERR | bERR | bERR | bERR | bERR |
| b_ok | bERR | bERR | bERR | bERR | bERR | bERR | bERR | bERR | bERR |
| bERR | bERR | bERR | bERR | bERR | bERR | bERR | bERR | bERR | bERR |

**Veredicto**: AFD correcto. Reconoce exactamente las cadenas "true" y "false". Se trata de un AFD clásico para el reconocimiento de un conjunto finito de palabras.

---

### 4.9. AFD 9 — `esChar`: Carácter literal

**Archivo**: `afd_var_infer.ts`, líneas 228–267

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {ch0, ch_abre, ch_escape, ch_contenido, ch_cierra, chERR}
- Sigma = {COMILLA_S, BARRA, ESC_VALIDO, OTRO_CHAR}
  - ESC_VALIDO = caracteres en el conjunto {n, t, r, f, v, a, b, \, ', ", 0}
- q0 = ch0
- F = {ch_cierra}

**Tabla de transición delta**:

| Estado | COMILLA_S | BARRA | ESC_VALIDO | OTRO_CHAR |
|--------|:---------:|:-----:|:----------:|:---------:|
| ch0 | ch_abre | chERR | chERR | chERR |
| ch_abre | chERR | ch_escape | ch_contenido | ch_contenido |
| ch_escape | (nota) | (nota) | ch_contenido | chERR |
| ch_contenido | ch_cierra | chERR | chERR | chERR |
| ch_cierra | chERR | chERR | chERR | chERR |
| chERR | chERR | chERR | chERR | chERR |

**Nota sobre `ch_escape`**: La validación se realiza mediante `ESC_VALIDOS.has(t.valor)`. Los caracteres `\` y `'` pertenecen al conjunto de escapes válidos, por lo que las transiciones delta(ch_escape, `\`) y delta(ch_escape, `'`) conducen a `ch_contenido` cuando son secuencias de escape reconocidas.

**Veredicto**: AFD correcto. Acepta: `'a'`, `'\n'`, `'\''`. Rechaza: `''` (vacío), `'ab'` (más de un carácter), comillas sin cerrar.

---

### 4.10. AFD 10 — `afd_num_pos`: Número entero positivo

**Archivo**: `dpda_repeat.ts`, líneas 55–83

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {n0, n_digito, nERR}
- Sigma = Todos los caracteres (clasificados como DIGITO u OTRO)
- q0 = n0
- F = {n_digito}

**Tabla de transición delta**:

| Estado | DIGITO [0-9] | OTRO |
|--------|:------------:|:----:|
| n0 | n_digito | nERR |
| n_digito | n_digito | nERR |
| nERR | nERR | nERR |

**Veredicto**: AFD correcto. Reconoce el lenguaje regular [0-9]+. Es el autómata más simple del proyecto.

**Observación**: Este AFD acepta `0` como número válido. La restricción semántica de positividad estricta (>0) se aplica posteriormente en la función `validarCountSemantico`, manteniendo una separación correcta entre análisis léxico y semántico.

---

### 4.11. AFD 11 — `afd_id_count`: Identificador simple

**Archivo**: `dpda_repeat.ts`, líneas 85–114

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {i0, i_id, iERR}
- Sigma = Todos los caracteres (clasificados como LETRA, DIGITO u OTRO)
- q0 = i0
- F = {i_id}

**Tabla de transición delta**:

| Estado | LETRA [a-zA-Z_] | DIGITO [0-9] | OTRO |
|--------|:----------------:|:------------:|:----:|
| i0 | i_id | iERR | iERR |
| i_id | i_id | i_id | iERR |
| iERR | iERR | iERR | iERR |

**Veredicto**: AFD correcto. Reconoce la expresión regular [a-zA-Z_][a-zA-Z0-9_]*, definición clásica de identificador en lenguajes de programación.

---

### 4.12. AFD 12 — `afd_if`: Bloque if/else if/else

**Archivo**: `afd_if.ts`, líneas 50–167

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {q0, q_if, q_abreParen, q_cond, q_cierraParen, q_abreLlave, q_cuerpo, q_cierraLlave, q_else, q_elseif, q_abreParen2, q_cond2, q_cierraParen2, q_abreLlave2, q_cuerpo2, q_cierraLlave2, q_abreLlaveF, q_cuerpoF, q_fin, qERR}
- Sigma = {if, else, (, ), {, }, EXPR, INSTR}
- q0 = q0
- F = {q_cierraLlave, q_cierraLlave2, q_fin}

**Tabla de transición delta**:

| Estado | if | else | ( | ) | { | } | EXPR | INSTR |
|--------|:--:|:----:|:-:|:-:|:-:|:-:|:----:|:-----:|
| q0 | q_if | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| q_if | qERR | qERR | q_abreParen | qERR | qERR | qERR | qERR | qERR |
| q_abreParen | qERR | qERR | qERR | qERR | qERR | qERR | q_cond | qERR |
| q_cond | qERR | qERR | qERR | q_cierraParen | qERR | qERR | qERR | qERR |
| q_cierraParen | qERR | qERR | qERR | qERR | q_abreLlave | qERR | qERR | qERR |
| q_abreLlave | qERR | qERR | qERR | qERR | qERR | q_cierraLlave | qERR | q_cuerpo |
| q_cuerpo | qERR | qERR | qERR | qERR | qERR | q_cierraLlave | qERR | q_cuerpo |
| q_cierraLlave | qERR | q_else | qERR | qERR | qERR | qERR | qERR | qERR |
| q_else | q_elseif | qERR | qERR | qERR | q_abreLlaveF | qERR | qERR | qERR |
| q_elseif | qERR | qERR | q_abreParen2 | qERR | qERR | qERR | qERR | qERR |
| q_abreParen2 | qERR | qERR | qERR | qERR | qERR | qERR | q_cond2 | qERR |
| q_cond2 | qERR | qERR | qERR | q_cierraParen2 | qERR | qERR | qERR | qERR |
| q_cierraParen2 | qERR | qERR | qERR | qERR | q_abreLlave2 | qERR | qERR | qERR |
| q_abreLlave2 | qERR | qERR | qERR | qERR | qERR | q_cierraLlave2 | qERR | q_cuerpo2 |
| q_cuerpo2 | qERR | qERR | qERR | qERR | qERR | q_cierraLlave2 | qERR | q_cuerpo2 |
| q_cierraLlave2 | qERR | q_else | qERR | qERR | qERR | qERR | qERR | qERR |
| q_abreLlaveF | qERR | qERR | qERR | qERR | qERR | q_fin | qERR | q_cuerpoF |
| q_cuerpoF | qERR | qERR | qERR | qERR | qERR | q_fin | qERR | q_cuerpoF |
| q_fin | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |

**Veredicto**: AFD correcto. Reconoce las estructuras:
- `if (EXPR) { INSTR* }`
- `if (EXPR) { INSTR* } else { INSTR* }`
- `if (EXPR) { INSTR* } else if (EXPR) { INSTR* } ... else { INSTR* }`

**Observación**: Este AFD opera sobre tokens de alto nivel (no caracteres). El lexer previo produce tokens abstractos `EXPR` e `INSTR` que encapsulan sub-lenguajes ya validados. Esto permite que un AFD reconozca una estructura que sería libre de contexto si los delimitadores estuvieran anidados arbitrariamente. La transición delta(q_cierraLlave2, else) = q_else crea un ciclo que permite múltiples cláusulas `else if` encadenadas.

---

### 4.13. AFD 13 — `afd_switch`: Bloque switch/case/default

**Archivo**: `afd_switch.ts`, líneas 35–133

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {q0, q_switch, q_abreParen, q_var, q_cierraParen, q_abreLlave, q_case, q_val, q_dosPuntos, q_cuerpoCase, q_default, q_dosPuntosDef, q_cuerpoDef, q_cierraLlave, qERR}
- Sigma = {switch, (, VAR, ), {, }, case, VAL, :, default, INSTR}
- q0 = q0
- F = {q_cierraLlave}

**Tabla de transición delta**:

| Estado | switch | ( | VAR | ) | { | } | case | VAL | : | default | INSTR |
|--------|:------:|:-:|:---:|:-:|:-:|:-:|:----:|:---:|:-:|:-------:|:-----:|
| q0 | q_switch | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| q_switch | qERR | q_abreParen | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| q_abreParen | qERR | qERR | q_var | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| q_var | qERR | qERR | qERR | q_cierraParen | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| q_cierraParen | qERR | qERR | qERR | qERR | q_abreLlave | qERR | qERR | qERR | qERR | qERR | qERR |
| q_abreLlave | qERR | qERR | qERR | qERR | qERR | q_cierraLlave | q_case | qERR | qERR | q_default | qERR |
| q_case | qERR | qERR | qERR | qERR | qERR | qERR | qERR | q_val | qERR | qERR | qERR |
| q_val | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | q_dosPuntos | qERR | qERR |
| q_dosPuntos | qERR | qERR | qERR | qERR | qERR | q_cierraLlave | q_case | qERR | qERR | q_default | q_cuerpoCase |
| q_cuerpoCase | qERR | qERR | qERR | qERR | qERR | q_cierraLlave | q_case | qERR | qERR | q_default | q_cuerpoCase |
| q_default | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | q_dosPuntosDef | qERR | qERR |
| q_dosPuntosDef | qERR | qERR | qERR | qERR | qERR | q_cierraLlave | qERR | qERR | qERR | qERR | q_cuerpoDef |
| q_cuerpoDef | qERR | qERR | qERR | qERR | qERR | q_cierraLlave | qERR | qERR | qERR | qERR | q_cuerpoDef |
| q_cierraLlave | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |
| qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR | qERR |

**Veredicto**: AFD correcto. Reconoce la estructura completa de un bloque switch con múltiples cases y default opcional.

---

### 4.14. AFD 14 — `validarInit`: Inicialización del for

**Archivo**: `afd_for.ts`, líneas 109–165

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {in0, in_tipo, in_id, in_id_decl, in_asigna, in_expr, inERR}
- Sigma = {TIPO, ID, ASIGNA, EXPR, ERR}
- q0 = in0
- F = {in_expr}

**Tabla de transición delta**:

| Estado | TIPO | ID | ASIGNA | EXPR | ERR |
|--------|:----:|:--:|:------:|:----:|:---:|
| in0 | in_tipo | in_id | inERR | inERR | inERR |
| in_tipo | inERR | in_id_decl | inERR | inERR | inERR |
| in_id | inERR | inERR | in_asigna | inERR | inERR |
| in_id_decl | inERR | inERR | in_asigna | inERR | inERR |
| in_asigna | inERR | inERR | inERR | in_expr | inERR |
| in_expr | inERR | inERR | inERR | inERR | inERR |
| inERR | inERR | inERR | inERR | inERR | inERR |

**Veredicto**: AFD correcto. Reconoce:
- `ID = EXPR` (ejemplo: `i = 0`)
- `TIPO ID = EXPR` (ejemplo: `int i = 0`)

---

### 4.15. AFD 15 — `validarIncrement`: Incremento del for

**Archivo**: `afd_for.ts`, líneas 268–333

**Definición formal**: M = (Q, Sigma, delta, q0, F)

- Q = {ic0, ic_id, ic_op_pre, ic_postfijo, ic_prefijo, ic_comp_asigna, ic_expr, icERR}
- Sigma = {ID, OP_POST, OP_COMP, ASIGNA, EXPR, ERR}
- q0 = ic0
- F = {ic_postfijo, ic_prefijo, ic_expr}

**Tabla de transición delta**:

| Estado | ID | OP_POST | OP_COMP | ASIGNA | EXPR | ERR |
|--------|:--:|:-------:|:-------:|:------:|:----:|:---:|
| ic0 | ic_id | ic_op_pre | icERR | icERR | icERR | icERR |
| ic_id | icERR | ic_postfijo | ic_comp_asigna | ic_comp_asigna | icERR | icERR |
| ic_op_pre | ic_prefijo | icERR | icERR | icERR | icERR | icERR |
| ic_postfijo | icERR | icERR | icERR | icERR | icERR | icERR |
| ic_prefijo | icERR | icERR | icERR | icERR | icERR | icERR |
| ic_comp_asigna | icERR | icERR | icERR | icERR | ic_expr | icERR |
| ic_expr | icERR | icERR | icERR | icERR | icERR | icERR |
| icERR | icERR | icERR | icERR | icERR | icERR | icERR |

**Veredicto**: AFD correcto. Reconoce:
- `ID++`, `ID--` (incremento/decremento postfijo)
- `++ID`, `--ID` (incremento/decremento prefijo)
- `ID += EXPR`, `ID -= EXPR`, `ID *= EXPR`, `ID /= EXPR`, `ID %= EXPR` (asignación compuesta)
- `ID = EXPR` (asignación simple)

---

### 4.16. Validador Compuesto 18 — `validarTamanioOVariable`: Tamaño con variables y expresiones

**Archivo**: `afd_var_infer.ts`, función `validarTamanioOVariable`

**Propósito**: Validar el contenido dentro de los corchetes `[]` en la declaración de arreglos y matrices, aceptando no solo enteros positivos sino también variables y expresiones aritméticas.

**Clasificación**: Validador compuesto (no es un autómata único, sino una composición de autómatas existentes)

**Autómatas delegados**:
1. `esEntero` (AFD 6) — Para validar literales enteros, con verificación semántica de positividad (> 0)
2. `afd_id` (AFD 2) — Para validar identificadores/variables, con verificación de que no sea palabra reservada de C++
3. `validarExpr` (DPDA 17) — Para validar expresiones aritméticas como `n + 1`, `rows * 2`

**Algoritmo de decisión**:

```
validarTamanioOVariable(raw):
  1. Si raw está vacío → rechazar
  2. Si esEntero(raw) es válido:
     a. Si parseInt(raw) > 0 → aceptar como "Tamaño numérico válido"
     b. Si parseInt(raw) <= 0 → rechazar ("debe ser mayor a 0")
  3. Si afd_id(raw) es válido:
     a. Si raw es palabra reservada de C++ → rechazar
     b. Sino → aceptar como "Variable válida como tamaño"
  4. Si validarExpr(raw) es válido → aceptar como "Expresión válida como tamaño"
  5. Sino → rechazar
```

**Ejemplos de cadenas aceptadas**: `5`, `10`, `n`, `size`, `n + 1`, `rows * 2`, `arr[i]`

**Ejemplos de cadenas rechazadas**: `""` (vacío), `0`, `-1`, `3.14`, `int` (reservada), `@#$`

**Veredicto**: Validador compuesto correcto. No introduce un nuevo autómata formal sino que compone los autómatas existentes (AFD 6, AFD 2, DPDA 17) mediante un esquema de prioridad cascada. La prioridad (entero → identificador → expresión) garantiza que un literal como `5` sea reconocido como entero y validado semánticamente antes de intentar reconocerlo como expresión.

**Contexto de uso**: Utilizado por `ArrayBlock` (campo `size`) y `MatrixBlock` (campos `rows` y `cols`). Reemplaza al validador anterior `validarTamanio` que solo aceptaba enteros positivos.

---

## 5. Autómatas de Pila Deterministas (DPDA)

### 5.1. DPDA 16 — `pdaExpresionAritmetica`: Expresiones aritméticas con paréntesis

**Archivo**: `dpda_repeat.ts`, líneas 167–296

**Justificación teórica**: Las expresiones aritméticas con paréntesis anidados generan un lenguaje libre de contexto (Tipo 2 en la jerarquía de Chomsky). El lenguaje L = { w | w es una expresión aritmética con paréntesis balanceados } no es regular, demostrable por el Lema de Bombeo. Se requiere un autómata con memoria auxiliar (pila) para rastrear la profundidad de anidamiento.

**Definición formal**: M = (Q, Sigma, Gamma, delta, q0, Z0, F)

- Q = {pc_inicio, pc_unario, pc_operando, pcERR}
- Sigma = {NUM, ID, OP_ADD, OP_MUL, PAREN_A, PAREN_C}
- Gamma = {Z0, PAREN}
- q0 = pc_inicio
- Z0 = Z0 (símbolo inicial de pila)
- F = {pc_operando}
- **Condición de aceptación**: estado pertenece a F, pila = [Z0], y entrada agotada

**Tabla de transiciones delta(estado, entrada, tope_pila) -> (nuevo_estado, operacion_pila)**:

| Estado | Entrada | Tope de pila | Nuevo estado | Operación de pila |
|--------|---------|:------------:|:------------:|:-----------------:|
| pc_inicio | NUM | gamma | pc_operando | sin cambio |
| pc_inicio | ID | gamma | pc_operando | sin cambio |
| pc_inicio | PAREN_A | gamma | pc_inicio | push PAREN |
| pc_inicio | OP_ADD('-') | gamma | pc_unario | sin cambio |
| pc_inicio | otro | gamma | pcERR | sin cambio |
| pc_unario | NUM | gamma | pc_operando | sin cambio |
| pc_unario | ID | gamma | pc_operando | sin cambio |
| pc_unario | PAREN_A | gamma | pc_inicio | push PAREN |
| pc_unario | otro | gamma | pcERR | sin cambio |
| pc_operando | OP_ADD | gamma | pc_inicio | sin cambio |
| pc_operando | OP_MUL | gamma | pc_inicio | sin cambio |
| pc_operando | PAREN_C | PAREN | pc_operando | pop |
| pc_operando | PAREN_C | Z0 | pcERR | sin cambio |
| pc_operando | otro | gamma | pcERR | sin cambio |

**Lenguaje reconocido**: Expresiones aritméticas de la forma:

```
EXPR   ::= TERM (('+' | '-') TERM)*
TERM   ::= FACTOR (('*' | '/' | '%') FACTOR)*
FACTOR ::= '-'? ATOM
ATOM   ::= NUM | ID | '(' EXPR ')'
```

**Ejemplos de cadenas aceptadas**: `5`, `x + 3`, `(a + b) * c`, `-(x + 1)`, `a * -b`

**Ejemplos de cadenas rechazadas**: `()`, `5 +`, `--x`, `(5 + 3`, `+ 5`

**Veredicto**: DPDA correcto. La pila se utiliza exclusivamente para el balanceo de paréntesis. El estado `pc_unario` garantiza que el operador menos unario no pueda encadenarse (`--x` es rechazado), pero sí puede preceder a una subexpresión entre paréntesis (`-(x+1)` es aceptado).

---

### 5.2. DPDA 17 — `pdaExpresion`: Expresiones booleanas, relacionales y aritméticas

**Archivo**: `dpda_expr.ts`, líneas 9–102

**Justificación teórica**: Las expresiones lógicas y relacionales comparten la misma necesidad de paréntesis balanceados para agrupamiento. El lenguaje resultante es libre de contexto y requiere un DPDA por las mismas razones que el DPDA anterior.

**Definición formal**: M = (Q, Sigma, Gamma, delta, q0, Z0, F)

- Q = {qe_inicio, qe_unario, qe_operando, qeERR}
- Sigma = {ID, NUM, STR, BOOL, OP_REL, OP_LOG, OP_ARITH, NOT, PAREN_A, PAREN_C}
  - OP_REL = {<, >, <=, >=, ==, !=}
  - OP_LOG = {&&, ||}
  - OP_ARITH = {+, -, *, /, %}
- Gamma = {Z0, PAREN}
- q0 = qe_inicio
- Z0 = Z0 (símbolo inicial de pila)
- F = {qe_operando}
- **Condición de aceptación**: estado pertenece a F, pila = [Z0], y entrada agotada

**Tabla de transiciones delta(estado, entrada, tope_pila) -> (nuevo_estado, operacion_pila)**:

| Estado | Entrada | Tope de pila | Nuevo estado | Operación de pila |
|--------|---------|:------------:|:------------:|:-----------------:|
| qe_inicio | ID / NUM / STR / BOOL | gamma | qe_operando | sin cambio |
| qe_inicio | NOT | gamma | qe_inicio | sin cambio |
| qe_inicio | OP_ARITH('-') | gamma | qe_unario | sin cambio |
| qe_inicio | PAREN_A | gamma | qe_inicio | push PAREN |
| qe_inicio | otro | gamma | qeERR | sin cambio |
| qe_unario | ID / NUM / STR / BOOL | gamma | qe_operando | sin cambio |
| qe_unario | PAREN_A | gamma | qe_inicio | push PAREN |
| qe_unario | otro | gamma | qeERR | sin cambio |
| qe_operando | OP_REL | gamma | qe_inicio | sin cambio |
| qe_operando | OP_LOG | gamma | qe_inicio | sin cambio |
| qe_operando | OP_ARITH | gamma | qe_inicio | sin cambio |
| qe_operando | PAREN_C | PAREN | qe_operando | pop |
| qe_operando | PAREN_C | Z0 | qeERR | sin cambio |
| qe_operando | otro | gamma | qeERR | sin cambio |

**Lenguaje reconocido**: Expresiones de la forma:

```
EXPR     ::= OPERANDO (OPERADOR OPERANDO)*
OPERANDO ::= NOT* UNARIO
UNARIO   ::= '-'? (ATOMO | '(' EXPR ')')
ATOMO    ::= ID | NUM | STR | BOOL
OPERADOR ::= OP_REL | OP_LOG | OP_ARITH
```

**Diferencias respecto al DPDA 16**:
- Acepta operandos de tipo cadena (STR) y booleano (BOOL)
- Soporta operadores relacionales (OP_REL) y lógicos (OP_LOG) además de aritméticos
- El operador NOT puede encadenarse (`!!x` es válido) gracias a la auto-transición delta(qe_inicio, NOT) = qe_inicio
- El operador menos unario no puede encadenarse (`--x` es rechazado)

**Ejemplos de cadenas aceptadas**: `x < 10`, `a > 0 && b <= 5`, `!flag`, `!!flag`, `(x + 1) >= y`, `!-5`

**Ejemplos de cadenas rechazadas**: `&&`, `x <`, `--x`, `!`, `()`, `5 5`

**Veredicto**: DPDA correcto. Constituye una generalización del DPDA 16, extendiendo el alfabeto de entrada para soportar el conjunto completo de operadores del lenguaje CheemScript.

---

## 6. Correcciones Aplicadas

Las siguientes correcciones fueron identificadas durante el análisis e implementadas en el código fuente:

| N.° | Archivo | Corrección aplicada |
|:---:|---------|---------------------|
| 1 | `afd_var_infer.ts` | Eliminados los estados muertos `bt4` y `bf5` del tipo `EstadoBool`, que estaban declarados pero no participaban en ninguna transición del AFD 8 (`esBool`) |
| 2 | `dpda_repeat.ts` | Reescrito el parser recursivo descendente (`parseSum/parseTerm/parseFactor/parseAtom`) como DPDA explícito con pila visible |
| 3 | `dpda_expr.ts` | Reescrito el parser recursivo descendente (`parseOr/parseAnd/parseNot/parseRel/parseArith/parseFactor`) como DPDA explícito con pila visible |
| 4 | Renombrado | `afd_repeat.ts` renombrado a `dpda_repeat.ts` para reflejar la estructura matemática dominante |
| 5 | Renombrado | `parser_expr.ts` renombrado a `dpda_expr.ts` para reflejar la estructura matemática dominante |
| 6 | `afd_var_infer.ts` | Agregada función `validarTamanioOVariable` que extiende `validarTamanio` para aceptar identificadores (AFD 2) y expresiones aritméticas (DPDA 17) además de enteros positivos, permitiendo el uso de variables y expresiones dentro de `[]` en arreglos y matrices |
| 7 | `ArrayBlock.tsx` | Actualizado para usar `validarTamanioOVariable` en lugar de `validarTamanio` en el campo `size` |
| 8 | `MatrixBlock.tsx` | Actualizado para usar `validarTamanioOVariable` en lugar de `validarTamanio` en los campos `rows` y `cols` |
| 9 | `generator.ts` | Corregido bug en la generación de código para bloques `input` y `ask` con variables de tipo `string`: se reemplazó `cin.ignore(numeric_limits<streamsize>::max(), '\n')` por `fflush(stdin)` antes de `getline()`, eliminando el problema donde el programa se "colgaba" si no existía un `cin >>` previo que dejara un `\n` pendiente en el buffer |

---

## 7. Conclusión

El proyecto CheemScript implementa un total de **17 autómatas** y **1 validador compuesto** para la validación sintáctica de su lenguaje:

- **15 Autómatas Finitos Deterministas (AFD)** que reconocen lenguajes regulares. Todos cumplen con las propiedades formales exigidas por la teoría:
  1. **Determinismo**: para cada par (estado, símbolo) existe exactamente una transición definida.
  2. **Función de transición total**: el estado trampa cubre todos los símbolos no contemplados explícitamente.
  3. **Estado inicial único**: cada AFD posee un solo q0.
  4. **Conjunto de aceptación bien definido**: F es subconjunto de Q y está claramente identificado.
  5. **Terminación garantizada**: procesan la entrada símbolo a símbolo sin ciclos infinitos sobre la misma posición.

- **2 Autómatas de Pila Deterministas (DPDA)** que reconocen lenguajes libres de contexto. Ambos emplean una pila explícita con alfabeto {Z0, PAREN} para el balanceo de paréntesis, y cumplen con la definición formal de 7-tupla. La necesidad de estos autómatas se justifica teóricamente por el Lema de Bombeo: los lenguajes con paréntesis anidados no son regulares y, por tanto, no pueden ser reconocidos por un AFD.

- **1 Validador compuesto** (`validarTamanioOVariable`) que compone los autómatas existentes (AFD 6 `esEntero`, AFD 2 `afd_id`, DPDA 17 `validarExpr`) mediante un esquema de prioridad cascada para validar tamaños de arreglos y matrices, aceptando enteros positivos, identificadores y expresiones aritméticas.

Todos los autómatas del proyecto son fieles a la teoría de la computación y se ubican correctamente en la jerarquía de Chomsky según la clase de lenguaje que reconocen.
