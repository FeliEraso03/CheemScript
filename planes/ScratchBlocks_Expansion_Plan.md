# CheemScript — Plan de Expansion: Bloques Scratch y UX

## Alcance del proyecto
Bloques actuales: if, for, while, switch, arrays 1D, matrices 2D, repeat, repeatUntil, say, ask, wait, list, var_new + versiones avanzadas (C++ puro).

---

## Fase 1: Sistema de Reporter Blocks (fundacion)

Los reporters son bloques NO apilables que se arrastran DENTRO de inputs de otros bloques.

### Nuevo sistema de drag & drop
```typescript
type DragType = 'BLOCK_STACK' | 'BLOCK_REPORTER' | 'BLOCK_BOOLEAN';
```

### Input slots
Los inputs de texto libre en bloques (condicion, valor) se convierten en "slots" que aceptan drops de reporters.

### Archivos a crear
- `src/components/ExpressionSlot.tsx` — slot que acepta drop de reporters
- `src/blocks/reporters/NumberReporter.tsx` — numero literal
- `src/blocks/reporters/StringReporter.tsx` — string literal
- `src/blocks/reporters/VariableReporter.tsx` — `<variable>`

### Archivos a modificar
- `src/types/ast.ts` — nuevos tipos DragItem, ExpressionNode
- `src/components/Sidebar.tsx` — seccion reporters
- `src/blocks/BaseBlock.tsx` — renderizado condicional para reporters
- `src/context/ASTContext.tsx` — expresiones anidadas

---

## Fase 2: Operadores aritmeticos y booleanos (reporters)

### Bloques a crear (14)

| Archivo | Bloque | Shape |
|---------|--------|-------|
| `AddReporter.tsx` | `[a] + [b]` | reporter |
| `SubReporter.tsx` | `[a] - [b]` | reporter |
| `MulReporter.tsx` | `[a] * [b]` | reporter |
| `DivReporter.tsx` | `[a] / [b]` | reporter |
| `ModReporter.tsx` | `[a] mod [b]` | reporter |
| `RandomReporter.tsx` | `aleatorio [a] a [b]` | reporter |
| `LtReporter.tsx` | `[a] < [b]` | boolean hex |
| `EqReporter.tsx` | `[a] = [b]` | boolean hex |
| `GtReporter.tsx` | `[a] > [b]` | boolean hex |
| `AndReporter.tsx` | `[a] y [b]` | boolean hex |
| `OrReporter.tsx` | `[a] o [b]` | boolean hex |
| `NotReporter.tsx` | `no [cond]` | boolean hex |
| `JoinReporter.tsx` | `unir [a] [b]` | reporter |
| `LengthReporter.tsx` | `longitud de [texto]` | reporter |

### Modificar
- `src/codegen/generator.ts` — generacion recursiva de expresiones
- `src/components/Sidebar.tsx` — seccion "Operadores"

---

## Fase 3: Variable reporters + operaciones de asignacion

### Bloques a crear

| Archivo | Bloque |
|---------|--------|
| `SetVarBlock.tsx` | `asignar [var ▼] a [slot valor]` |
| `ChangeVarBlock.tsx` | `cambiar [var ▼] en [slot N]` |
| `ShowVarBlock.tsx` | `mostrar [var ▼]` → cout |

### Modificar
- `src/components/Sidebar.tsx` — seccion Variables actualizada
- `src/codegen/generator.ts` — casos set/change/show

---

## Fase 4: Operaciones de lista

### Bloques a crear (7)

| Archivo | Bloque |
|---------|--------|
| `ListAddBlock.tsx` | `anyadir [slot v] a [lista ▼]` |
| `ListDeleteBlock.tsx` | `eliminar [slot i] de [lista ▼]` |
| `ListInsertBlock.tsx` | `insertar [slot v] en [slot i] de [lista ▼]` |
| `ListReplaceBlock.tsx` | `reemplazar [slot i] de [lista ▼] por [slot v]` |
| `ListItemReporter.tsx` | `elemento [slot i] de [lista ▼]` reporter |
| `ListLengthReporter.tsx` | `longitud de [lista ▼]` reporter |
| `ListContainsReporter.tsx` | `[lista ▼] contiene [slot v]?` boolean hex |

---

## Fase 5: Control adicional

### Bloques a crear (3)

| Archivo | Bloque | Genera |
|---------|--------|--------|
| `ForeverBlock.tsx` | `por siempre { }` | `while (true) { }` |
| `StopBlock.tsx` | `detener [todo ▼]` | `return 0;` / `break;` |
| `WaitUntilBlock.tsx` | `esperar hasta [cond]` | `while(!cond) sleep_for(100ms);` |

---

## Fase 6: Mejoras UX en la paleta y canvas

| # | Mejora | Archivos |
|---|--------|----------|
| 1 | Busqueda en paleta | `Sidebar.tsx` |
| 2 | Categorias colapsables | `Sidebar.tsx`, `index.css` |
| 3 | Drag preview real (CustomDragLayer) | `CustomDragLayer.tsx` (nuevo) |
| 4 | Hover preview de C++ (tooltip) | `Sidebar.tsx` |
| 5 | Undo/Redo (Ctrl+Z/Y) | `ASTContext.tsx`, `useKeyboard.ts` |
| 6 | Auto-scroll en drag | `Canvas.tsx` |
| 7 | Keyboard shortcuts | `useKeyboard.ts` (nuevo), `App.tsx` |
| 8 | Dropdowns dinamicos vars/listas | `ASTContext.tsx` |
| 9 | Zoom en canvas | `Canvas.tsx`, toolbar |
| 10 | Block counter en paleta | `Sidebar.tsx` |

---

## Fase 7: Funciones (Mis Bloques) — opcional

| Archivo | Bloque |
|---------|--------|
| `DefineFunctionBlock.tsx` | `definir [nombre] (args)` Hat |
| `CallFunctionBlock.tsx` | `llamar [nombre] (args)` Stack |
| `ReturnBlock.tsx` | `retornar [valor]` Cap |

---

## Orden de ejecucion

| Prioridad | Fase | Esfuerzo |
|-----------|------|----------|
| ★★★★★ | **Fase 1**: Sistema reporters + slots | Medio |
| ★★★★★ | **Fase 3**: Variable reporters + asignacion | Medio |
| ★★★★☆ | **Fase 2**: Operadores aritmeticos/booleanos | Alto (14 bloques) |
| ★★★★☆ | **Fase 6.1-6.2**: Busqueda + categorias colapsables | Bajo |
| ★★★★☆ | **Fase 4**: Operaciones de lista | Alto |
| ★★★☆☆ | **Fase 5**: Control adicional | Bajo |
| ★★★☆☆ | **Fase 6.5**: Undo/Redo | Medio |
| ★★☆☆☆ | **Fase 6.3-6.4**: Drag preview + tooltips | Medio |
| ★☆☆☆☆ | **Fase 7**: Funciones | Muy alto |
