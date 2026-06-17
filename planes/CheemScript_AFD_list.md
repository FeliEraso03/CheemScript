# Reutilización de `afd_var_infer` en bloques de datos estructurados — CheemScript

## Bloques cubiertos

| Bloque | Tipo AST | Genera C++ |
|--------|----------|------------|
| Array 1D | `arr` | `tipo nombre[size] = {valores};` |
| Matriz 2D | `mat` | `tipo nombre[rows][cols];` |
| Lista (vector) | `list` | `vector<tipo> nombre = {valores};` |

---

## Por qué no se crea `afd_list.ts`

Los tres bloques ya están completamente validados en sus propios componentes
React usando funciones de `afd_var_infer.ts`. No hay lógica nueva que centralizar.

---

## Mapa de campos y validadores

### `arr` — Array 1D

| Campo | Validador | Origen |
|-------|-----------|--------|
| `dataType` | selector fijo (dropdown) | sin validación |
| `name` | `validarNombreVariable(name)` | `afd_var_infer.ts` |
| `size` | `validarTamanio(size)` | `afd_var_infer.ts` |
| `values` | `validarListaValores(values, dataType)` | `afd_var_infer.ts` |

El generador omite `= {valores}` si `values` está vacío — array sin inicializar.
`validarListaValores` acepta string vacío como válido para cubrir ese caso.

### `mat` — Matriz 2D

| Campo | Validador | Origen |
|-------|-----------|--------|
| `dataType` | selector fijo | sin validación |
| `name` | `validarNombreVariable(name)` | `afd_var_infer.ts` |
| `rows` | `validarTamanio(rows)` | `afd_var_infer.ts` |
| `cols` | `validarTamanio(cols)` | `afd_var_infer.ts` |

La matriz no tiene campo `values` — el generador solo emite la declaración.
`validarTamanio` aplica a `rows` y `cols` de forma independiente.

### `list` — Vector

| Campo | Validador | Origen |
|-------|-----------|--------|
| `name` | `validarNombreVariable(name)` | `afd_var_infer.ts` |
| `values` | `validarListaValores(values, inferredType)` | `afd_var_infer.ts` |
| tipo inferido | `validarYInferirTipo(values.split(',')[0])` | `afd_var_infer.ts` |

A diferencia de `arr`, la lista no tiene `dataType` explícito — el tipo se
infiere del primer elemento con `validarYInferirTipo`, igual que `var_new`.
El generador usa ese tipo inferido como `vector<tipo>`.

---

## Comportamiento de `validarListaValores`

Ya implementado en `afd_var_infer.ts`:

```typescript
export function validarListaValores(raw: string, tipo?: TipoExplicito): ResultValidation
```

- String vacío → `{ valid: true }` (array/lista sin inicializar, válido)
- Divide por `,` y valida cada elemento
- Con `tipo` explícito → usa `validarValorTipado(tipo, elem)` por cada elemento
- Sin `tipo` → usa `validarYInferirTipo(elem)` y rechaza `'unknown'`
- Reporta el índice exacto del elemento inválido: `Elemento 2 ("abc"): ...`

---

## Restricción semántica: consistencia de tipos en la lista

El generador de `list` infiere el tipo del **primer elemento** y lo aplica
a todo el vector. Si los elementos mezclan tipos (`1, "hola", true`), el
generador produce `vector<int>` pero los elementos string y bool causarían
error de compilación en C++.

`validarListaValores` ya maneja esto: al inferir el tipo del primer elemento
y pasarlo como `targetType`, todos los demás elementos se validan contra ese
mismo tipo. Si hay mezcla, el error aparece en el elemento inconsistente.

```typescript
// En ListBlock.tsx:
const firstVal = values.split(',')[0]?.trim();
const inferredType = firstVal ? validarYInferirTipo(firstVal) : null;
const targetType = inferredType && inferredType !== 'unknown'
  ? (inferredType as TipoExplicito)
  : undefined;
const validationVal = validarListaValores(values, targetType);
```

---

## Árbol de dependencias actualizado

```
afd_var_infer.ts
    │
    │  validarNombreVariable()
    │  validarTamanio()
    │  validarListaValores()
    │  validarYInferirTipo()
    │
    ├── ArrayBlock.tsx   (nombre + tamaño + valores tipados)
    ├── MatrixBlock.tsx  (nombre + filas + columnas)
    └── ListBlock.tsx    (nombre + valores con tipo inferido)
```

---

## Tabla consolidada de reutilización (actualizada)

| Validador | Origen | Reutilizado por |
|-----------|--------|-----------------|
| `validarExpr` | `parser_expr.ts` | `if`, `for.condition`, `while`, `repeatUntil` |
| `validarCount` | `afd_repeat.ts` | `repeat`, `for.init`, `for.increment` |
| `validarAmount` | `afd_var_infer.ts` | `change_var`, `wait`, `sleep`, `say.duration` |
| `validarNombreVariable` | `afd_var_infer.ts` | `var`, `var_new`, `arr`, `mat`, `list` |
| `validarTamanio` | `afd_var_infer.ts` | `arr` (size), `mat` (rows, cols) |
| `validarListaValores` | `afd_var_infer.ts` | `arr` (values), `list` (values) |
| `validarYInferirTipo` | `afd_var_infer.ts` | `var_new`, `list` (tipo inferido), `generator.ts` |
| `validarValorTipado` | `afd_var_infer.ts` | `var`, `arr` (por elemento vía `validarListaValores`) |
| `afd_id` | `afd_print.ts` | `afd_var_infer`, `afd_for`, `afd_repeat` |
| `afd_string` / `esString` | `afd_print.ts` | `afd_var_infer`, `input`, `ask` |

---

*CheemScript · Documento técnico — reutilización de `afd_var_infer` en bloques arr / mat / list*
