# CheemScript — Documentacion Tecnica

## Arquitectura del proyecto

```
frontend/
├── src/
│   ├── types/           # Tipos base del sistema AST
│   │   └── ast.ts
│   ├── context/         # Estado global (ASTContext)
│   │   └── ASTContext.tsx
│   ├── components/      # Componentes de UI compartidos
│   │   ├── Canvas.tsx           # Drop zone raiz
│   │   ├── Sidebar.tsx          # Paleta de bloques
│   │   ├── NestedDropZone.tsx   # Drop zone anidado
│   │   ├── BaseBlock.tsx        # Layout comun de todo bloque
│   │   ├── ExpressionSlot.tsx   # Slot visual para reporters
│   │   ├── VariableSelector.tsx # Dropdown de variables registradas
│   │   ├── BlockShape.tsx       # SVG shapes (c-shape, boolean, reporter)
│   │   ├── CodeView.tsx         # Editor Monaco read-only
│   │   └── WelcomeScreen.tsx    # Pantalla de bienvenida
│   ├── blocks/          # Bloques individuales (21 total)
│   │   ├── BaseBlock.tsx        # Wrapper visual base
│   │   ├── IfBlock.tsx          # si / sino / else if
│   │   ├── SwitchBlock.tsx      # segun / caso
│   │   ├── ForBlock.tsx         # for clasico (C++)
│   │   ├── WhileBlock.tsx       # while clasico (C++)
│   │   ├── RepeatBlock.tsx      # repetir N veces
│   │   ├── RepeatUntilBlock.tsx # repetir hasta que
│   │   ├── ForeverBlock.tsx     # por siempre (placeholder)
│   │   ├── VarBlock.tsx         # variable tipada (C++)
│   │   ├── VarBlockNew.tsx      # crear variable (Scratch)
│   │   ├── SetVarBlock.tsx      # asignar variable
│   │   ├── ChangeVarBlock.tsx   # cambiar variable en N
│   │   ├── ShowVarBlock.tsx     # mostrar variable
│   │   ├── ArrayBlock.tsx       # array 1D
│   │   ├── MatrixBlock.tsx      # matriz 2D
│   │   ├── ListBlock.tsx        # crear lista (vector)
│   │   ├── PrintBlock.tsx       # print cout
│   │   ├── InputBlock.tsx       # input cin
│   │   ├── SayBlock.tsx         # decir (cout + sleep)
│   │   ├── AskBlock.tsx         # preguntar (cout + cin)
│   │   ├── SleepBlock.tsx       # wait ms
│   │   └── WaitBlock.tsx        # esperar (segundos/ms)
│   ├── codegen/         # Generacion de codigo C++
│   │   └── generator.ts
│   ├── automata/        # AFDs para validacion
│   │   ├── afd_if.ts
│   │   ├── afd_print.ts
│   │   ├── parser_expr.ts
│   │   └── ...
│   └── index.css        # Diseno system (dark theme)
```

---

## Sistema de estados (ASTContext)

Define el estado global de la aplicacion mediante React Context.

### UINode (nodo normalizado)
```typescript
interface UINode {
  id: string;                      // UUID
  type: string;                    // 'if', 'for', 'set_var', etc.
  data: Record<string, any>;       // Estado interno del bloque
  children: Record<string, string[]>; // Zonas de drop: { body: ['id1'], ... }
}
```

### VariableEntry (tracking automatico)
```typescript
interface VariableEntry {
  name: string;
  inferredType: InferredType;  // 'int' | 'float' | 'double' | 'char' | 'bool' | 'string' | 'unknown'
  blockId: string;
  firstValue: string;
  createdAt: number;
}
```

Las variables se registran automaticamente:
- `registerVariable(blockId, name, value)` — infiere tipo, si es `unknown` usa `int` como fallback con `console.warn`
- `unregisterVariable(blockId)` — elimina del mapa al borrar el bloque
- Dropdown en bloques se llena con `buildVariableOptions(variables)`

### Funciones del context
| Funcion | Descripcion |
|---------|-------------|
| `addNode(node, parentId?, zoneName?)` | Agrega nodo (raiz o hijo) |
| `removeNode(id, parentId?, zoneName?)` | Elimina nodo + limpia variables hijas |
| `updateNodeData(id, partialData)` | Actualiza `data` de un nodo |
| `moveNodeUp(id, parentId?, zoneName?)` | Reordena hacia arriba |
| `moveNodeDown(id, parentId?, zoneName?)` | Reordena hacia abajo |

---

## Tipos base (types/ast.ts)

### Drag system
```typescript
// Bloque apilable (paleta -> canvas/nestedDropZone)
interface DragItem { type: 'BLOCK'; blockType: string; }

// Reporter oval (paleta -> ExpressionSlot)
interface ReporterDragItem { type: 'BLOCK_REPORTER'; reporterType: string; meta?: Record<string, any>; text: string; }

// Boolean hexagonal (paleta -> ExpressionSlot)
interface BooleanDragItem { type: 'BLOCK_BOOLEAN'; reporterType: string; meta?: Record<string, any>; text: string; }
```

### Expression tree (futuro)
```typescript
type ExprNode =
  | { type: 'number' | 'string' | 'variable'; ... }
  | { type: 'add' | 'sub' | 'mul' | 'div' | 'mod'; left: ExprNode; right: ExprNode }
  | { type: 'lt' | 'eq' | 'gt' | 'and' | 'or'; left: ExprNode; right: ExprNode }
  | { type: 'not' | 'length'; child: ExprNode }
  | { type: 'random' | 'join'; ... }
  | { type: 'listItem' | 'listLength' | 'listContains'; list: string; ... }
```

---

## Componentes de UI

### Canvas (drop zone raiz)
- Acepta drag type `'BLOCK'`
- Crea nodo raiz en `rootNodes[]`

### Sidebar (paleta de bloques)
- Busqueda por texto (filtra bloques y reporters)
- Categorias colapsables: Control, Variables, Entrada/Salida, Tiempo, Avanzado (C++)
- Reporters de variables en vivo: aparecen como chips ovalados arrastrables
- `ReporterPaletteBlock` — chip con drag type `'BLOCK_REPORTER'`

### NestedDropZone (drop zone anidado)
- Acepta drag type `'BLOCK'`
- Agrega hijo a `parent.children[zoneName]`

### ExpressionSlot (slot para reporters)
- Acepta drag type `'BLOCK_REPORTER'` y `'BLOCK_BOOLEAN'`
- Renderiza como pill ovalado (reporter) o hexagono (boolean)
- Al soltar, inserta el `text` del reporter en el input

### BlockShape (SVG wrapper)
- `c-shape`: SVG path para bloques contenedores
- `reporter`: pill ovalado (border-radius)
- `boolean`: poligono hexagonal SVG

### BaseBlock (layout comun)
```
┌──────────────────────────────────────┐
│ █  title                [▲] [▼] [✕] │  ← block-header
│ ┌──────────────────────────────────┐ │
│ │ children (drop zone)            │ │  ← block-body
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## Bloques — Catalogo completo (21 bloques)

### Control (Scratch-style)

| Bloque | Archivo | UI | Genera C++ |
|--------|---------|----|------------|
| **repetir (veces)** | `RepeatBlock.tsx` | `repetir [N] veces { }` | `for (int _i = 0; _i < N; _i++)` |
| **repetir hasta que** | `RepeatUntilBlock.tsx` | `repetir hasta que [cond] { }` | `while (!(cond))` |
| **si / sino** | `IfBlock.tsx` | `if (cond) { } else if { } else { }` | `if-else if-else` |
| **segun / caso** | `SwitchBlock.tsx` | `segun [var] hacer { }` | `switch` |

### Control (Avanzado C++)

| Bloque | Archivo | Genera C++ |
|--------|---------|------------|
| **for (clasico)** | `ForBlock.tsx` | `for (init; cond; inc) { }` |
| **while (clasico)** | `WhileBlock.tsx` | `while (cond) { }` |

### Variables (Scratch-style)

| Bloque | Archivo | UI | Genera C++ |
|--------|---------|----|------------|
| **crear variable** | `VarBlockNew.tsx` | `crear variable [nom] = [val] [badge tipo]` | `tipo nom = val;` |
| **asignar variable** | `SetVarBlock.tsx` | `asignar [var ▼] a [slot valor]` | `var = val;` |
| **cambiar variable** | `ChangeVarBlock.tsx` | `cambiar [var ▼] en [slot N]` | `var += N;` |
| **mostrar variable** | `ShowVarBlock.tsx` | `mostrar [var ▼]` | `cout << var << endl;` |

### Variables (Avanzado C++)

| Bloque | Archivo | Genera C++ |
|--------|---------|------------|
| **variable (tipada)** | `VarBlock.tsx` | `tipo nom = val;` (tipo explicito) |

### Datos estructurados

| Bloque | Archivo | Genera C++ |
|--------|---------|------------|
| **array 1D** | `ArrayBlock.tsx` | `tipo nom[sz] = {vals};` |
| **matriz 2D** | `MatrixBlock.tsx` | `tipo nom[rows][cols];` |
| **crear lista** | `ListBlock.tsx` | `vector<tipo> nom = {vals};` |

### Entrada / Salida

| Bloque | Archivo | UI | Genera C++ |
|--------|---------|----|------------|
| **decir (segs)** | `SayBlock.tsx` | `decir [val] por [N] segs` | `cout << val << endl; sleep_for(Ns)` |
| **preguntar y esperar** | `AskBlock.tsx` | `preguntar [q] y guardar en [var]` | `cout << q; cin >> var;` |

### Avanzado C++ (IO)

| Bloque | Archivo | Genera C++ |
|--------|---------|------------|
| **print (cout)** | `PrintBlock.tsx` | `cout << val << endl;` |
| **input (cin)** | `InputBlock.tsx` | `cout << q; cin >> var;` |

### Tiempo

| Bloque | Archivo | UI | Genera C++ |
|--------|---------|----|------------|
| **esperar** | `WaitBlock.tsx` | `esperar [N] [segundos ▼]` | `sleep_for(chrono::seconds/milliseconds(N))` |
| **wait ms** | `SleepBlock.tsx` | `wait [N] ms` | `sleep_for(chrono::milliseconds(N))` |

---

## Generacion de codigo C++ (codegen/generator.ts)

### Includes generados automaticamente
```cpp
#include <iostream>
#include <thread>
#include <chrono>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Codigo generado...
    return 0;
}
```

### Type inference
- `inferTypeFromValue(value)` → `'int'` | `'double'` | `'bool'` | `'string'` | `'char'` | `'unknown'`
- Fallback a `int` con `console.warn` cuando no se puede inferir

---

## Sistema de drag & drop

| Drag type | Source | Target | Que crea/modifica |
|-----------|--------|--------|-------------------|
| `'BLOCK'` | PaletteBlock (sidebar) | Canvas, NestedDropZone | Nuevo UINode en el AST |
| `'BLOCK_REPORTER'` | ReporterPaletteBlock (sidebar) | ExpressionSlot | Texto en el input del slot |
| `'BLOCK_BOOLEAN'` | (futuro) | ExpressionSlot | Texto en el input del slot |

---

## Paleta (Sidebar) — Categorias

```
Control
  ├── repetir (veces)
  ├── repetir hasta que
  ├── si / sino
  └── segun / caso

Variables
  ├── crear variable
  ├── asignar variable
  ├── cambiar variable
  ├── mostrar variable
  ├── crear lista
  ├── crear matriz
  └── [Reporters de variables en vivo]
        ├── x (int)
        └── ...

Entrada / Salida
  ├── decir por (segs)
  └── preguntar y esperar

Tiempo
  └── esperar (segundos)

Avanzado (C++) [colapsado por defecto]
  ├── for (clasico)
  ├── while (clasico)
  ├── variable (tipada)
  ├── array 1D
  ├── print (cout)
  ├── input (cin)
  └── wait ms
```

---

## Archivos de automatas (AFD)

| Archivo | Proposito |
|---------|-----------|
| `afd_if.ts` | Valida estructura if-else if-else |
| `afd_print.ts` | Valida argumentos de print (string, int, variable, etc.) |
| `parser_expr.ts` | PDA para expresiones aritmetico-logicas |

_Pendientes de crear segun plan: afd_repeat, afd_var_infer, afd_list, afd_wait, validator.ts._

---

## Diseno visual (CSS dark theme)

### Variables CSS por categoria
```css
--bg-{categoria}:  color de fondo del bloque
--accent-{categoria}: color de acento (stripe, texto keyword)
```

### Paleta de colores
| Categoria | Fondo | Acento |
|-----------|-------|--------|
| if | `#0E1624` | `#5B8DC0` |
| for, repeat, while | `#0A1810` | `#3EA868` |
| switch | `#150E22` | `#8B64C4` |
| var, var_new | `#1A1206` | `#C49040` |
| arr, list | `#1A1006` | `#C07838` |
| mat | `#1A0E06` | `#BE6035` |
| print, say | `#170E20` | `#A370F0` |
| input, ask | `#0E1B24` | `#4D97FF` |
| sleep, wait | `#20120B` | `#FF8C1A` |
| repeatUntil | `#0B1912` | `#459970` |

---

## Proximos pasos (pendientes)

1. **Operadores reporters** — aritmeticos (+, -, *, /, mod, random), booleanos (<, =, >, and, or, not), string (join, length)
2. **Operaciones de lista** — anyadir, eliminar, insertar, reemplazar, elemento, longitud, contiene
3. **Control adicional** — por siempre, detener, esperar hasta
4. **UX** — drag preview, zoom, undo/redo, keyboard shortcuts, tooltips
5. **Funciones** — definir, llamar, retornar (Mis Bloques)
6. **Automata files** — afd_repeat, afd_var_infer, afd_list, afd_wait, validator.ts
