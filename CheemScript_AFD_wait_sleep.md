# Reutilización de `validarAmount` en bloques de tiempo — CheemScript

## Bloques cubiertos

| Bloque | Tipo AST | Campo | Genera C++ |
|--------|----------|-------|------------|
| `wait` | `wait` | `duration` | `this_thread::sleep_for(chrono::seconds/milliseconds(duration))` |
| `sleep` | `sleep` | `duration` | `this_thread::sleep_for(chrono::milliseconds(duration))` |

El campo `unit` de `wait` es un dropdown fijo (`"s"` / `"ms"`) — no requiere validación.

---

## Por qué no se crean `afd_wait.ts` ni `afd_sleep.ts`

Ambos bloques tienen un único campo editable (`duration`) cuya gramática es:

```
DURATION ::= entero | double | identificador de variable
```

Eso es exactamente lo que ya implementa `validarAmount` en `afd_var_infer.ts`:

```typescript
export function validarAmount(raw: string): ResultValidation {
  const s = raw.trim();
  if (s === '') return { valid: false, mensaje: 'El valor no puede estar vacío' };
  if (esEntero(s).valid || esDouble(s).valid)
    return { valid: true, mensaje: 'Número válido' };
  const nameVal = validarNombreVariable(s);
  if (nameVal.valid) return { valid: true, mensaje: 'Variable válida' };
  return { valid: false, mensaje: 'Debe ser un número o una variable existente' };
}
```

Crear un archivo intermediario que solo haga:

```typescript
export function validarDuration(raw: string) { return validarAmount(raw); }
```

no agrega lógica — es indirección vacía. La regla establecida en el documento
de reutilización de condiciones aplica aquí igual: **se crea un archivo de
autómata cuando agrega lógica propia**.

---

## Restricción semántica adicional: `duration` debe ser positivo

`validarAmount` acepta enteros con signo (`-3`) y variables (que podrían ser
negativas en runtime). Para `duration` un valor negativo o cero no tiene sentido
semántico — `sleep_for` con valor negativo es UB en C++.

La validación semántica se hace inline en el bloque, igual que
`validarCountSemantico` en `afd_repeat.ts`:

```typescript
function validarDuration(raw: string): ResultValidation {
  const base = validarAmount(raw);
  if (!base.valid) return base;

  // Si es un literal entero puro, verificar que sea > 0
  if (esEntero(raw).valid && parseInt(raw.trim(), 10) <= 0) {
    return { valid: false, mensaje: 'La duración debe ser mayor a 0' };
  }
  // Si es decimal puro, verificar que sea > 0
  if (esDouble(raw).valid && parseFloat(raw.trim()) <= 0) {
    return { valid: false, mensaje: 'La duración debe ser mayor a 0' };
  }

  return base;
}
```

Esta función vive directamente en `WaitBlock.tsx` y `SleepBlock.tsx` —
no en un archivo de autómata separado.

---

## Diferencia entre `wait` y `sleep`

| | `wait` | `sleep` |
|---|---|---|
| Campo `duration` | entero, decimal o variable | entero o variable (ms, sin decimal) |
| Campo `unit` | `"s"` / `"ms"` (dropdown, sin validación) | fijo `"ms"` (no hay campo) |
| Validación extra | `duration > 0` | `duration > 0` y preferiblemente entero |

`sleep` es un bloque C++ avanzado pensado para milisegundos exactos — pasar
`1.5` como duración de `sleep_for(chrono::milliseconds(...))` sería un cast
silencioso a `1`. Se puede agregar una advertencia (no error) si se detecta decimal:

```typescript
function validarDurationSleep(raw: string): ResultValidation {
  const base = validarDuration(raw);
  if (!base.valid) return base;

  if (esDouble(raw).valid) {
    return {
      valid: true,
      mensaje: 'Advertencia: los milisegundos se truncarán a entero',
    };
  }

  return base;
}
```

---

## Árbol de dependencias actualizado

```
afd_var_infer.ts
    │  validarAmount()
    │  esEntero()
    │  esDouble()
    │
    ├── WaitBlock.tsx   (validarDuration inline → validarAmount + check > 0)
    └── SleepBlock.tsx  (validarDurationSleep inline → validarAmount + check > 0 + warn decimal)
```

---

## Integración en los bloques React

### `WaitBlock.tsx`

```tsx
import { validarAmount, esEntero, esDouble } from '../automata/afd_var_infer';

function validarDuration(raw: string) {
  const base = validarAmount(raw);
  if (!base.valid) return base;
  if (esEntero(raw).valid && parseInt(raw.trim(), 10) <= 0)
    return { valid: false, mensaje: 'La duración debe ser mayor a 0' };
  if (esDouble(raw).valid && parseFloat(raw.trim()) <= 0)
    return { valid: false, mensaje: 'La duración debe ser mayor a 0' };
  return base;
}

export const WaitBlock: React.FC<WaitBlockProps> = ({ id, ... }) => {
  const duration = node.data.duration ?? '';
  const unit     = node.data.unit     ?? 's';
  const resultado = validarDuration(duration);

  return (
    <BaseBlock ... title={
      <div className="scratch-title-row">
        <span className="scratch-keyword">esperar</span>
        <input
          type="text"
          className="block-input scratch-input"
          style={{
            width: '60px',
            outline: !resultado.valid && duration !== ''
              ? '1px solid #ff4444'
              : undefined,
          }}
          placeholder="1"
          value={duration}
          onChange={(e) => updateNodeData(id, { duration: e.target.value })}
        />
        <select
          className="block-input scratch-select"
          value={unit}
          onChange={(e) => updateNodeData(id, { unit: e.target.value })}
        >
          <option value="s">segundos</option>
          <option value="ms">ms</option>
        </select>
      </div>
    } category="wait" />
  );
};
```

### `SleepBlock.tsx`

```tsx
import { validarAmount, esEntero, esDouble } from '../automata/afd_var_infer';

function validarDurationSleep(raw: string) {
  const base = validarAmount(raw);
  if (!base.valid) return base;
  if ((esEntero(raw).valid && parseInt(raw.trim(), 10) <= 0) ||
      (esDouble(raw).valid && parseFloat(raw.trim()) <= 0))
    return { valid: false, mensaje: 'La duración debe ser mayor a 0' };
  if (esDouble(raw).valid)
    return { valid: true, mensaje: 'Advertencia: los ms se truncarán a entero' };
  return base;
}

export const SleepBlock: React.FC<SleepBlockProps> = ({ id, ... }) => {
  const duration = node.data.duration ?? '';
  const resultado = validarDurationSleep(duration);
  const esAdvertencia = resultado.valid && resultado.mensaje.startsWith('Advertencia');

  return (
    <BaseBlock ... title={
      <div className="scratch-title-row">
        <span className="scratch-keyword">wait</span>
        <input
          type="text"
          className="block-input scratch-input"
          style={{
            width: '80px',
            outline: !resultado.valid && duration !== ''
              ? '1px solid #ff4444'
              : esAdvertencia
              ? '1px solid #ffaa00'
              : undefined,
          }}
          placeholder="1000"
          value={duration}
          onChange={(e) => updateNodeData(id, { duration: e.target.value })}
        />
        <span className="scratch-label">ms</span>
      </div>
    } category="sleep" />
  );
};
```

---

## Casos de prueba

```typescript
// ── validarDuration (wait) ────────────────────────────────────────────────────
validarDuration('1')      // → { valid: true,  mensaje: 'Número válido' }
validarDuration('0.5')    // → { valid: true,  mensaje: 'Número válido' }
validarDuration('n')      // → { valid: true,  mensaje: 'Variable válida' }
validarDuration('0')      // → { valid: false, mensaje: 'La duración debe ser mayor a 0' }
validarDuration('-1')     // → { valid: false, mensaje: 'La duración debe ser mayor a 0' }
validarDuration('-0.5')   // → { valid: false, mensaje: 'La duración debe ser mayor a 0' }
validarDuration('')       // → { valid: false, mensaje: 'El valor no puede estar vacío' }
validarDuration('"hola"') // → { valid: false, mensaje: 'Debe ser un número o una variable existente' }

// ── validarDurationSleep (sleep) ──────────────────────────────────────────────
validarDurationSleep('1000')  // → { valid: true,  mensaje: 'Número válido' }
validarDurationSleep('n')     // → { valid: true,  mensaje: 'Variable válida' }
validarDurationSleep('1.5')   // → { valid: true,  mensaje: 'Advertencia: los ms se truncarán a entero' }
validarDurationSleep('0')     // → { valid: false, mensaje: 'La duración debe ser mayor a 0' }
validarDurationSleep('')      // → { valid: false, mensaje: 'El valor no puede estar vacío' }
```

---

## Tabla consolidada de reutilización

| Validador | Origen | Reutilizado por |
|-----------|--------|-----------------|
| `validarExpr` | `parser_expr.ts` | `if`, `for.condition`, `while`, `repeatUntil` |
| `validarAmount` | `afd_var_infer.ts` | `change_var`, `wait`, `sleep`, `say.duration` |
| `validarCount` | `afd_repeat.ts` | `repeat`, `for.init`, `for.increment` |
| `afd_id` | `afd_print.ts` | `afd_var_infer`, `afd_for`, `afd_repeat` |
| `esString` / `afd_string` | `afd_print.ts` | `afd_var_infer`, `input`, `ask` |

---

*CheemScript · Documento técnico — reutilización de `validarAmount` en bloques de tiempo (wait / sleep)*
