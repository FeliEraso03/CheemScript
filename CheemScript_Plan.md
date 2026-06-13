# CheemScript — Plan de Implementación

> *"Much code. Very compile. Wow."*
> Editor visual de programacion con validacion formal mediante automatas que traduce bloques a C++, se comunica con un compilador por debajo, y muestra la salida en la consola de la aplicacion.

---

## Índice

1. [Nombre y branding](#1-nombre-y-branding)
2. [Paleta de colores](#2-paleta-de-colores)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Arquitectura del sistema](#4-arquitectura-del-sistema)
5. [Estructura de bloques](#5-estructura-de-bloques)
6. [Validación formal con AFD](#6-validación-formal-con-autómatas-finitos-deterministas-afd)
7. [Generación de código C++](#7-generación-de-código-c)
8. [Backend de compilación](#8-backend-de-compilación)
9. [Estructura de carpetas del proyecto](#9-estructura-de-carpetas-del-proyecto)
10. [Plan de desarrollo por fases](#10-plan-de-desarrollo-por-fases)
11. [Herramientas y dependencias](#11-herramientas-y-dependencias)
12. [Consideraciones de seguridad](#12-consideraciones-de-seguridad)

---

## 1. Nombre y branding

| Elemento | Detalle |
|---|---|
| **Nombre** | CheemScript |
| **Tagline** | *"Much code. Very compile. Wow."* |
| **Mascota** | Cheems / Shiba Inu que "ladra" errores de sintaxis |
| **Concepto** | El compilador "ladra" (`woof!`) cuando detecta un error, y muestra un mensaje en el estilo del meme de Cheems |
| **Inspiración visual** | Minimalismo japonés + interfaz tipo Scratch + paleta monocromática |

---

## 2. Paleta de colores

El diseño usa un tema oscuro como base. Los fondos son negros profundos y los acentos son el ambar shiba y los colores de categoria de bloque.

### Reglas de Diseño Estrictas

- **Cero Emojis:** Esta estrictamente prohibido el uso de emojis en el codigo fuente, en la documentacion y en la interfaz visual. Toda la iconografia o mascotas deben representarse mediante SVG, imagenes o ASCII Art (como el Cheems al final del documento).
- **Tema oscuro por defecto:** El fondo predominante es negro profundo (#0C0C0C). No se usan fondos blancos en ninguna vista principal.

### Colores base (Dark Theme)

| Rol | Nombre | Hex |
|---|---|---|
| Fondo principal | Negro profundo | `#0C0C0C` |
| Fondo del canvas | Negro lienzo | `#111111` |
| Superficie | Gris oscuro | `#1A1A1A` |
| Superficie elevada | Gris medio oscuro | `#222222` |
| Bordes | Gris muy sutil | `#282828` |
| Bordes sutiles | Casi negro | `#1E1E1E` |
| Texto principal | Blanco calido | `#EDEDED` |
| Texto secundario | Gris medio | `#707070` |
| Texto muted | Gris oscuro | `#444444` |
| Acento shiba primario | Ambar calido | `#C68B2A` |
| Acento shiba claro | Ambar claro | `#E6A83A` |

### Colores de estado

| Rol | Color | Hex |
|---|---|---|
| Error de sintaxis | Rojo | `#C0392B` |
| Error fondo | Rojo muy oscuro | `#1E0A0A` |
| Advertencia | Ambar | `#D4860A` |
| Exito / codigo valido | Verde | `#27AE60` |
| Exito fondo | Verde muy oscuro | `#061A0E` |

### Paleta de colores por bloque

Los bloques se agrupan en tres categorías visuales. Cada categoría tiene un color acento que se aplica en la franja izquierda del bloque, el ícono y el borde superior — el cuerpo del bloque permanece en gris claro para mantener la coherencia monocromática general.

#### Categoria: Condicionales (ajustados para fondo oscuro)

| Bloque | Color acento | Hex fondo oscuro | Hex acento |
|---|---|---|---|
| `if / else if / else` | Azul acero | `#0E1624` | `#5B8DC0` |

> Azul acero mas brillante para mantener contraste sobre fondo negro.

#### Categoria: Bucles / Ciclos (ajustados para fondo oscuro)

| Bloque | Color acento | Hex fondo oscuro | Hex acento |
|---|---|---|---|
| `for` | Verde pino | `#0A1810` | `#3EA868` |
| `while` | Verde musgo | `#0B1912` | `#459970` |

> Tonos de verde mas vibrantes para visibilidad en dark mode.

#### Categoria: Control de flujo (ajustados para fondo oscuro)

| Bloque | Color acento | Hex fondo oscuro | Hex acento |
|---|---|---|---|
| `switch / case` | Violeta | `#150E22` | `#8B64C4` |

#### Categoria: Datos y variables (ajustados para fondo oscuro)

| Bloque | Color acento | Hex fondo oscuro | Hex acento |
|---|---|---|---|
| `declarar variable` | Ambar | `#1A1206` | `#C49040` |
| `array 1D` | Ambar cobre | `#1A1006` | `#C07838` |
| `matriz 2D` | Naranja barro | `#1A0E06` | `#BE6035` |

#### Resumen visual de la paleta de bloques (Dark Mode)

```
CONDICIONALES          BUCLES                 CONTROL DE FLUJO    DATOS
──────────────         ──────────────         ────────────────    ──────────────────────
█ #5B8DC0  if          █ #3EA868  for         █ #8B64C4  switch   █ #C49040  variable
                       █ #459970  while                           █ #C07838  array 1D
                                                                  █ #BE6035  matriz 2D
```

#### Reglas de aplicación del color en los bloques

1. **Franja izquierda:** barra vertical de 4px de ancho con el color acento, altura completa del bloque.
2. **Fondo del bloque:** el hex tenue correspondiente (muy desaturado) en lugar del gris `#E8E8E8` estándar.
3. **Ícono / etiqueta de tipo:** el texto del nombre del bloque (`if`, `for`, etc.) en el color acento.
4. **Borde del bloque:** `1px solid` con el color acento al 40% de opacidad (`rgba`).
5. **Estado hover:** el fondo tenue se oscurece 8% y la franja izquierda pasa a 6px.
6. **Estado error:** la franja izquierda cambia a `#8B2020` (rojo error) independientemente del tipo de bloque.
7. **Estado válido confirmado:** la franja izquierda muestra un check `✓` en `#1E5C2E` por 1.5 segundos.

### Tipografía recomendada

- **Interfaz general:** `Inter` o `IBM Plex Sans`
- **Bloques de código / output C++:** `JetBrains Mono` o `Fira Code`
- **Mensajes de error estilo meme:** `Comic Sans MS` (solo para los mensajes de Cheems, como easter egg)

---

## 3. Stack tecnológico

### Frontend

| Herramienta | Rol |
|---|---|
| **React + TypeScript** | Framework principal, componentes tipados |
| **react-dnd** | Drag & drop de bloques hacia el canvas |
| **Zustand** | Estado global (AST en tiempo real, configuración) |
| **Vanilla CSS** | Estilos con la paleta monocromática. Flexibilidad total para interacciones y micro-animaciones. |
| **Monaco Editor** | Vista del código C++ generado con syntax highlighting |
| **Vite** | Bundler rápido para desarrollo y build |

### Motor de validación (frontend, TypeScript puro)

| Herramienta | Rol |
|---|---|
| 5 **AFDs** implementados en TypeScript puro | Validar todos los campos de texto de los bloques |

### Backend

| Herramienta | Rol |
|---|---|
| **Node.js + Express** (o FastAPI) | Servidor HTTP para recibir el código C++ |
| **g++ / clang++** | Compilador real de C++ |
| **child_process** (Node) | Invocar el compilador desde el servidor |
| **Docker** | Sandboxing seguro para ejecutar código del usuario |

---

## 4. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────────┐
│             CAPA 1 — Editor visual (React)              │
│   Paleta de bloques │ Canvas central │ Vista de código  │
└────────────────────────────┬────────────────────────────┘
                             │ El usuario arrastra bloques
                             ▼
┌─────────────────────────────────────────────────────────┐
│          CAPA 2 — Motor AST (TypeScript)                │
│     Árbol de sintaxis abstracta · Nodos por bloque      │
└────────────────────────────┬────────────────────────────┘
                             │ Cambio en el árbol
                             ▼
┌─────────────────────────────────────────────────────────┐
│       CAPA 3 — Validación formal (Autómatas)            │
│  AFD₁ (ids) │ AFD₂ (tipos) │ AFD₃ (nums) │ AFD₄ (cond) │ AFD₅ (tam)  │
└──────────────┬──────────────────────────────┬───────────┘
               │ Error                        │ Válido
               ▼                              ▼
     ┌──────────────────┐         ┌────────────────────────┐
     │ Error en UI      │         │ CAPA 4 — Generador C++ │
     │ (bloque rojo +   │         │ AST → string de código │
     │  mensaje Cheems) │         └──────────┬─────────────┘
     └──────────────────┘                    │ HTTP POST con .cpp
                                             ▼
                              ┌──────────────────────────────┐
                              │  CAPA 5 — Backend compilador │
                              │  g++ compila · ejecuta ·     │
                              │  devuelve stdout/stderr       │
                              └──────────────────────────────┘
```

### Flujo de datos completo

1. El usuario arrastra un bloque `for` al canvas
2. El canvas actualiza el **AST** (árbol JSON)
3. El **motor de autómatas** valida la sintaxis en tiempo real
4. Si hay error → el bloque se resalta en rojo y aparece el mensaje de Cheems
5. Si es válido → el **generador C++** produce el código equivalente
6. El usuario presiona "Compilar" → el código se envía al **backend**
7. El backend lo compila con `g++`, ejecuta el binario y devuelve el resultado
8. La salida aparece en el panel de consola de la UI

---

## 5. Estructura de bloques

Cada bloque es un componente React con tres partes: plantilla visual, esquema de validación y plantilla de código C++.

### Bloques disponibles

#### `if / else if / else`
- **Parámetros:** condición booleana (expresión)
- **Autómata:** AFD que valida que la condición sea una expresión válida
- **Genera:**
```cpp
if (condicion) {
    // cuerpo
} else if (otra_condicion) {
    // cuerpo
} else {
    // cuerpo
}
```

#### `for`
- **Parámetros:** inicialización, condición, incremento
- **Autómata:** AFD separado para cada uno de los tres campos
- **Genera:**
```cpp
for (int i = 0; i < n; i++) {
    // cuerpo
}
```

#### `while`
- **Parámetros:** condición booleana
- **Autómata:** AFD para condición booleana o de comparación
- **Genera:**
```cpp
while (condicion) {
    // cuerpo
}
```

#### `switch / case`
- **Parámetros:** variable de control, lista de casos con valores
- **Autómata:** AFD₁ para la variable de control + AFD₄ para los valores de cada case
- **Genera:**
```cpp
switch (variable) {
    case 1:
        // cuerpo
        break;
    case 2:
        // cuerpo
        break;
    default:
        break;
}
```

#### `declarar variable`
- **Parámetros:** tipo (`int`, `float`, `double`, `char`, `bool`, `string`), nombre, valor inicial
- **Autómata:** AFD que valida tipo + identificador válido + valor compatible
- **Genera:**
```cpp
int nombre = valor;
```

#### `array 1D`
- **Parámetros:** tipo, nombre, tamaño, valores iniciales (opcional)
- **Autómata:** AFD que valida tamaño como entero positivo + tipos de los valores
- **Genera:**
```cpp
int arr[5] = {1, 2, 3, 4, 5};
```

#### `matriz 2D`
- **Parámetros:** tipo, nombre, filas, columnas
- **Autómata:** AFD₅ para filas y AFD₅ para columnas (dos instancias independientes)
- **Genera:**
```cpp
int mat[3][4];
// Inicialización con bucle anidado generado automáticamente
for (int i = 0; i < 3; i++)
    for (int j = 0; j < 4; j++)
        mat[i][j] = 0;
```

---

## 6. Validación formal con Autómatas Finitos Deterministas (AFD)

### Decisión de diseño

CheemScript utiliza **Autómatas Finitos Deterministas (AFD)** como mecanismo exclusivo de validación sintáctica. Esta elección es correcta porque:

- Los bloques visuales ya imponen la estructura del programa (no puede haber un `else` suelto ni un `for` sin cuerpo — el editor lo garantiza visualmente).
- Lo único que queda libre al usuario son los **campos de texto** dentro de cada bloque: nombres de variables, tipos, condiciones, tamaños.
- Todos esos campos pertenecen a **lenguajes regulares**, que es exactamente el dominio de los AFD.
- Es el enfoque estándar en compiladores reales: el análisis léxico (primer paso de cualquier compilador C++) se implementa con AFD.

Se definen **5 AFDs independientes**, uno por cada categoría de campo que el usuario puede escribir.

---

### Definición formal de un AFD

Un AFD se define como una 5-tupla:

```
M = (Q, Σ, δ, q₀, F)
```

Donde:
- **Q** = conjunto finito de estados
- **Σ** = alfabeto de entrada
- **δ** = función de transición δ: Q × Σ → Q
- **q₀** = estado inicial
- **F** = conjunto de estados de aceptación

---

### AFD₁ — Identificadores de C++

Valida nombres de variables, funciones y arrays. En C++ un identificador debe comenzar con letra o guion bajo, seguido de cualquier combinación de letras, dígitos o guiones bajos.

**Ejemplos válidos:** `contador`, `_temp`, `miArray2`, `x`
**Ejemplos inválidos:** `2var`, `mi-var`, `mi var`, `@nombre`

**Definición formal:**

```
Q  = { q0, q1, qERR }
Σ  = letras (a-z, A-Z), dígitos (0-9), guion bajo (_), otros
q₀ = q0
F  = { q1 }
```

**Tabla de transición δ:**

| Estado | letra \| `_` | dígito | otro |
|--------|-------------|--------|------|
| q0 (inicio) | q1 | qERR | qERR |
| q1 (aceptación) | q1 | q1 | qERR |
| qERR (error) | qERR | qERR | qERR |

**Diagrama de estados:**

```
        letra|_              letra|_|dígito
  ┌──►  q0  ──────────────►  q1  ◄──┐
  │    (inicio)             (✓ OK)   │
  │          │                       └──────
  │        dígito                   
  │        otro                    
  │          │                     
  │          ▼                     
  └────    qERR  ◄── (todos) ──── qERR
           (✗)
```

**Implementación TypeScript:**

```typescript
type EstadoAFD = 'q0' | 'q1' | 'qERR';

function afd1_identificador(entrada: string): boolean {
  if (entrada.length === 0) return false;
  let estado: EstadoAFD = 'q0';

  for (const c of entrada) {
    const esLetraOGuion = /[a-zA-Z_]/.test(c);
    const esDigito      = /[0-9]/.test(c);

    switch (estado) {
      case 'q0':
        estado = esLetraOGuion ? 'q1' : 'qERR';
        break;
      case 'q1':
        if (!esLetraOGuion && !esDigito) estado = 'qERR';
        break;
      case 'qERR':
        return false;
    }
  }
  return estado === 'q1';
}
```

---

### AFD₂ — Tipos de datos primitivos de C++

Valida que el tipo ingresado sea uno de los tipos primitivos permitidos en CheemScript.

**Válidos:** `int`, `float`, `double`, `char`, `bool`, `string`
**Inválidos:** `integer`, `Int`, `FLOAT`, `real`, `texto`

**Definición formal:**

```
Q  = { q0, q_i, q_in, q_int,
       q_f, q_fl, q_flo, q_floa, q_float,
       q_d, q_do, q_dou, q_doub, q_doubl, q_double,
       q_c, q_ch, q_cha, q_char,
       q_b, q_bo, q_boo, q_bool,
       q_s, q_st, q_str, q_stri, q_strin, q_string,
       qERR }
Σ  = letras (a-z)
q₀ = q0
F  = { q_int, q_float, q_double, q_char, q_bool, q_string }
```

**Diagrama de estados (simplificado por rama):**

```
q0 ──i──► q_i ──n──► q_in ──t──► q_int (✓)
q0 ──f──► q_f ──l──► q_fl ──o──► q_flo ──a──► q_floa ──t──► q_float (✓)
q0 ──d──► q_d ──o──► q_do ──u──► q_dou ──b──► q_doub ──l──► q_doubl ──e──► q_double (✓)
q0 ──c──► q_c ──h──► q_ch ──a──► q_cha ──r──► q_char (✓)
q0 ──b──► q_b ──o──► q_bo ──o──► q_boo ──l──► q_bool (✓)
q0 ──s──► q_s ──t──► q_st ──r──► q_str ──i──► q_stri ──n──► q_strin ──g──► q_string (✓)
cualquier otro camino → qERR (✗)
```

**Implementación TypeScript:**

```typescript
function afd2_tipo(entrada: string): boolean {
  const tiposValidos = new Set(['int', 'float', 'double', 'char', 'bool', 'string']);
  return tiposValidos.has(entrada.trim());
  // Internamente cada comparación recorre el AFD estado por estado;
  // el Set es la implementación compacta del autómata de 6 ramas.
}
```

---

### AFD₃ — Literales numéricos de C++

Valida valores numéricos válidos en C++: enteros positivos, enteros negativos y decimales.

**Válidos:** `0`, `42`, `-7`, `3.14`, `-0.5`, `100`
**Inválidos:** `3.`, `.5`, `--4`, `3.1.4`, `abc`

**Definición formal:**

```
Q  = { q0, q_neg, q_ent, q_punto, q_dec, qERR }
Σ  = dígitos (0-9), signo (-), punto (.)
q₀ = q0
F  = { q_ent, q_dec }
```

**Tabla de transición δ:**

| Estado | `-` | `0-9` | `.` | otro |
|--------|-----|-------|-----|------|
| q0 (inicio) | q_neg | q_ent | qERR | qERR |
| q_neg (signo leído) | qERR | q_ent | qERR | qERR |
| q_ent (✓ entero) | qERR | q_ent | q_punto | qERR |
| q_punto (punto leído) | qERR | q_dec | qERR | qERR |
| q_dec (✓ decimal) | qERR | q_dec | qERR | qERR |
| qERR (error) | qERR | qERR | qERR | qERR |

**Diagrama de estados:**

```
              -           0-9          .          0-9
  q0 ──────► q_neg ──► q_ent (✓) ──► q_punto ──► q_dec (✓)
  │                      ▲  │                       │
  │           0-9         └──┘          0-9          └──► (loop)
  └──────────────────────────►
  
  todo lo demás → qERR (✗)
```

**Implementación TypeScript:**

```typescript
type EstadoNum = 'q0' | 'q_neg' | 'q_ent' | 'q_punto' | 'q_dec' | 'qERR';

function afd3_numero(entrada: string): boolean {
  if (entrada.length === 0) return false;
  let estado: EstadoNum = 'q0';

  for (const c of entrada) {
    const esDigito = /[0-9]/.test(c);

    switch (estado) {
      case 'q0':
        if (c === '-')       estado = 'q_neg';
        else if (esDigito)   estado = 'q_ent';
        else                 estado = 'qERR';
        break;
      case 'q_neg':
        estado = esDigito ? 'q_ent' : 'qERR';
        break;
      case 'q_ent':
        if (esDigito)        estado = 'q_ent';
        else if (c === '.')  estado = 'q_punto';
        else                 estado = 'qERR';
        break;
      case 'q_punto':
        estado = esDigito ? 'q_dec' : 'qERR';
        break;
      case 'q_dec':
        if (!esDigito) estado = 'qERR';
        break;
      case 'qERR':
        return false;
    }
  }
  return estado === 'q_ent' || estado === 'q_dec';
}
```

---

### AFD₄ — Expresiones de comparación simples

Valida condiciones del estilo `variable operador valor` usadas en `if`, `while` y `for`. El formato aceptado es: `identificador  op  (identificador | número)`.

**Válidos:** `i < 10`, `x == 0`, `contador >= limite`, `flag != 1`
**Inválidos:** `< 10`, `i 10`, `i << 10`, `i < `, `===`

**Definición formal:**

```
Q  = { q0, q_id1, q_esp1, q_op1, q_op2, q_esp2, q_val, qERR }
Σ  = letras, dígitos, _, espacios, operadores (< > = !)
q₀ = q0
F  = { q_val }
```

**Tabla de transición δ:**

| Estado | `letra/_` | `dígito` | `espacio` | `< > ! =` | otro |
|--------|-----------|----------|-----------|-----------|------|
| q0 | q_id1 | qERR | qERR | qERR | qERR |
| q_id1 | q_id1 | q_id1 | q_esp1 | qERR | qERR |
| q_esp1 | qERR | qERR | q_esp1 | q_op1 | qERR |
| q_op1 | qERR | qERR | q_esp2 | q_op2 | qERR |
| q_op2 | qERR | qERR | q_esp2 | qERR | qERR |
| q_esp2 | q_val | q_val | q_esp2 | qERR | qERR |
| q_val (✓) | q_val | q_val | qERR | qERR | qERR |
| qERR | qERR | qERR | qERR | qERR | qERR |

**Diagrama de estados:**

```
  letra/_        letra/_|díg       espacio       op(<>=!)
  q0 ──► q_id1 ──(loop)──► q_id1 ──► q_esp1 ──► q_op1
                                       (loop)              │
                                                    op(=)  │  espacio
                                                    ──► q_op2 ──► q_esp2
                                                                     │
                                                          letra/_|díg│
                                                                     ▼
                                                                   q_val (✓)
                                                                  (loop)
```

**Implementación TypeScript:**

```typescript
type EstadoCmp = 'q0'|'q_id1'|'q_esp1'|'q_op1'|'q_op2'|'q_esp2'|'q_val'|'qERR';

function afd4_comparacion(entrada: string): boolean {
  if (entrada.trim().length === 0) return false;
  let estado: EstadoCmp = 'q0';

  for (const c of entrada) {
    const esLetra  = /[a-zA-Z_]/.test(c);
    const esDigito = /[0-9]/.test(c);
    const esEsp    = c === ' ';
    const esOp     = /[<>!=]/.test(c);

    switch (estado) {
      case 'q0':    estado = esLetra ? 'q_id1' : 'qERR'; break;
      case 'q_id1': 
        if (esLetra || esDigito) estado = 'q_id1';
        else if (esEsp)          estado = 'q_esp1';
        else                     estado = 'qERR';
        break;
      case 'q_esp1':
        if (esEsp)      estado = 'q_esp1';
        else if (esOp)  estado = 'q_op1';
        else            estado = 'qERR';
        break;
      case 'q_op1':
        if (esOp)       estado = 'q_op2';
        else if (esEsp) estado = 'q_esp2';
        else            estado = 'qERR';
        break;
      case 'q_op2':
        if (esEsp)      estado = 'q_esp2';
        else            estado = 'qERR';
        break;
      case 'q_esp2':
        if (esEsp)               estado = 'q_esp2';
        else if (esLetra||esDigito) estado = 'q_val';
        else                     estado = 'qERR';
        break;
      case 'q_val':
        if (!esLetra && !esDigito) estado = 'qERR';
        break;
      case 'qERR': return false;
    }
  }
  return estado === 'q_val';
}
```

---

### AFD₅ — Tamaño de arrays y dimensiones de matrices

Valida que el tamaño ingresado sea un entero positivo mayor que cero. No acepta cero, negativos ni decimales.

**Válidos:** `1`, `10`, `100`, `256`
**Inválidos:** `0`, `-5`, `3.14`, `diez`, ` `, `01`

**Definición formal:**

```
Q  = { q0, q_primero, q_resto, qERR }
Σ  = dígitos (0-9)
q₀ = q0
F  = { q_resto }
```

**Tabla de transición δ:**

| Estado | `1-9` | `0` | otro |
|--------|-------|-----|------|
| q0 (inicio) | q_primero | qERR | qERR |
| q_primero (✓) | q_resto | q_resto | qERR |
| q_resto (✓) | q_resto | q_resto | qERR |
| qERR (error) | qERR | qERR | qERR |

> El primer dígito no puede ser `0` (evita `01`, `007`, etc.) y no puede ser `0` solo (tamaño cero inválido).

**Diagrama de estados:**

```
         1-9              0-9
  q0 ──────────► q_primero (✓) ──► q_resto (✓)
  │                                    │
  │  0 | otro                          └── (loop con 0-9)
  └──────────► qERR (✗)
```

**Implementación TypeScript:**

```typescript
type EstadoTam = 'q0' | 'q_primero' | 'q_resto' | 'qERR';

function afd5_tamano(entrada: string): boolean {
  if (entrada.length === 0) return false;
  let estado: EstadoTam = 'q0';

  for (const c of entrada) {
    const esDigito     = /[0-9]/.test(c);
    const esPrimeroVal = /[1-9]/.test(c);

    switch (estado) {
      case 'q0':
        estado = esPrimeroVal ? 'q_primero' : 'qERR';
        break;
      case 'q_primero':
        estado = esDigito ? 'q_resto' : 'qERR';
        break;
      case 'q_resto':
        if (!esDigito) estado = 'qERR';
        break;
      case 'qERR':
        return false;
    }
  }
  return estado === 'q_primero' || estado === 'q_resto';
}
```

---

### Resumen de los 5 AFDs

| AFD | Valida | Usado en | Estados |
|-----|--------|----------|---------|
| AFD₁ | Identificadores C++ | Nombre de variable, array, matriz | q0, q1, qERR |
| AFD₂ | Tipos de datos | Campo "tipo" en declaraciones | 1 por tipo + qERR |
| AFD₃ | Literales numéricos | Valor inicial de variable, límites de for | q0, q_neg, q_ent, q_punto, q_dec, qERR |
| AFD₄ | Expresiones de comparación | Condición de if, while, for | q0…q_val, qERR |
| AFD₅ | Tamaño entero positivo | Dimensiones de array y matriz 2D | q0, q_primero, q_resto, qERR |

### Motor de validación central

Los 5 AFDs se invocan desde un único validador que recibe el tipo de campo y su valor:

```typescript
type CampoTipo = 'identificador' | 'tipo' | 'numero' | 'comparacion' | 'tamano';

interface ResultadoValidacion {
  valido: boolean;
  mensaje: string;
}

function validarCampo(tipo: CampoTipo, valor: string): ResultadoValidacion {
  const validadores: Record<CampoTipo, () => boolean> = {
    identificador: () => afd1_identificador(valor),
    tipo:          () => afd2_tipo(valor),
    numero:        () => afd3_numero(valor),
    comparacion:   () => afd4_comparacion(valor),
    tamano:        () => afd5_tamano(valor),
  };

  const mensajes: Record<CampoTipo, string> = {
    identificador: 'Debe comenzar con letra o _, sin espacios ni caracteres especiales.',
    tipo:          'Tipo no válido. Usa: int, float, double, char, bool o string.',
    numero:        'Debe ser un número entero o decimal válido (ej: 42, -3, 1.5).',
    comparacion:   'Formato: variable operador valor (ej: i < 10, x == 0).',
    tamano:        'Debe ser un entero positivo mayor que cero (ej: 5, 10, 100).',
  };

  const valido = validadores[tipo]();
  return {
    valido,
    mensaje: valido ? '✓ Sintaxis válida' : `✗ ${mensajes[tipo]}`,
  };
}
```

---

## 7. Generación de código C++

### AST → C++

El AST es un árbol JSON que se recorre recursivamente para generar código C++ formateado.

**Ejemplo de nodo AST para un `for`:**

```json
{
  "tipo": "for",
  "init": { "tipo": "declaracion", "dataType": "int", "nombre": "i", "valor": "0" },
  "condicion": { "izq": "i", "op": "<", "der": "10" },
  "incremento": { "variable": "i", "op": "++" },
  "cuerpo": []
}
```

**Función generadora (TypeScript):**

```typescript
function generarFor(nodo: NodoFor): string {
  const init = `int ${nodo.init.nombre} = ${nodo.init.valor}`;
  const cond = `${nodo.condicion.izq} ${nodo.condicion.op} ${nodo.condicion.der}`;
  const inc  = `${nodo.incremento.variable}${nodo.incremento.op}`;
  const cuerpo = nodo.cuerpo.map(generarNodo).join('\n    ');

  return `for (${init}; ${cond}; ${inc}) {\n    ${cuerpo}\n}`;
}
```

### Plantilla de archivo C++ generado

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    // Código generado por CheemScript
    // woof! woof! (comentario automático de la mascota)

    /* --- CÓDIGO DEL USUARIO --- */
    [CÓDIGO_GENERADO]
    /* -------------------------- */

    return 0;
}
```

---

## 8. Backend de compilación

### Endpoint principal

```
POST /api/compilar
Content-Type: application/json

{
  "codigo": "#include <iostream>\n...",
  "timeout": 5000
}
```

**Respuesta exitosa:**
```json
{
  "exito": true,
  "stdout": "Hello, CheemScript!\n",
  "stderr": "",
  "tiempo_ms": 312
}
```

**Respuesta con error:**
```json
{
  "exito": false,
  "stdout": "",
  "stderr": "error: 'x' was not declared in this scope\n",
  "tiempo_ms": 89
}
```

### Implementación Node.js + Express

```javascript
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

app.post('/api/compilar', async (req, res) => {
  const { codigo, timeout = 5000 } = req.body;
  const id = uuidv4();
  const srcPath = `/tmp/${id}.cpp`;
  const binPath = `/tmp/${id}`;

  // 1. Escribir el archivo
  fs.writeFileSync(srcPath, codigo);

  // 2. Compilar
  exec(`g++ -o ${binPath} ${srcPath} 2>&1`, (errComp, stdoutComp) => {
    if (errComp) {
      fs.unlinkSync(srcPath);
      return res.json({ exito: false, stdout: '', stderr: stdoutComp });
    }

    // 3. Ejecutar con timeout
    exec(binPath, { timeout }, (errRun, stdout, stderr) => {
      fs.unlinkSync(srcPath);
      fs.unlinkSync(binPath);

      if (errRun && errRun.killed) {
        return res.json({ exito: false, stdout: '', stderr: 'Timeout: ejecución excedió el límite de tiempo.' });
      }

      res.json({ exito: !errRun, stdout, stderr });
    });
  });
});

app.listen(3001, () => console.log('CheemScript compiler backend running on :3001'));
```

### Dockerfile para sandboxing

```dockerfile
FROM gcc:13-alpine

RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Usuario sin privilegios para seguridad
RUN adduser -D cheemscript
USER cheemscript

EXPOSE 3001
CMD ["node", "server.js"]
```

---

## 9. Estructura de carpetas del proyecto

```
cheemscript/
├── frontend/
│   ├── src/
│   │   ├── blocks/              # Un archivo por tipo de bloque
│   │   │   ├── IfBlock.tsx
│   │   │   ├── ForBlock.tsx
│   │   │   ├── WhileBlock.tsx
│   │   │   ├── SwitchBlock.tsx
│   │   │   ├── VarBlock.tsx
│   │   │   ├── ArrayBlock.tsx
│   │   │   └── MatrixBlock.tsx
│   │   ├── automata/            # Motor de validación formal (AFD)
│   │   │   ├── afd1_identificador.ts
│   │   │   ├── afd2_tipo.ts
│   │   │   ├── afd3_numero.ts
│   │   │   ├── afd4_comparacion.ts
│   │   │   ├── afd5_tamano.ts
│   │   │   └── validador.ts     # Motor central que invoca los 5 AFDs
│   │   ├── generator/           # Generación de código C++
│   │   │   └── cppGenerator.ts
│   │   ├── store/               # Estado global (Zustand)
│   │   │   └── astStore.ts
│   │   ├── components/          # UI general
│   │   │   ├── Canvas.tsx       # Canvas de arrastrar bloques
│   │   │   ├── Sidebar.tsx      # Paleta de bloques
│   │   │   ├── CodeView.tsx     # Vista del C++ generado
│   │   │   ├── Console.tsx      # Salida del compilador
│   │   │   └── CheemsBark.tsx   # Componente de mensajes de error
│   │   ├── types/               # Tipos TypeScript del AST
│   │   │   └── ast.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── server.js                # Express + endpoints de compilación
│   ├── compiler.js              # Lógica de invocación de g++
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   ├── CheemScript_Plan.md      # Este archivo
│   └── automata_diagrams/       # Diagramas de autómatas
│
└── README.md
```

---

## 10. Plan de desarrollo por fases

### Fase 1 — Fundación (2 semanas)

- [ ] Configurar el repositorio con Vite + React + TypeScript + Vanilla CSS
- [ ] Diseñar el layout base: sidebar, canvas, panel de código, consola
- [ ] Implementar el sistema drag & drop básico con `react-dnd`
- [ ] Crear los componentes visuales de los 7 bloques (solo visuales, sin lógica)
- [ ] Definir los tipos TypeScript del AST

### Fase 2 — Motor de autómatas (2 semanas)

- [ ] Implementar AFD₁ — validación de identificadores C++
- [ ] Implementar AFD₂ — validación de tipos de datos
- [ ] Implementar AFD₃ — validación de literales numéricos
- [ ] Implementar AFD₄ — validación de expresiones de comparación
- [ ] Implementar AFD₅ — validación de tamaños (arrays y matrices)
- [ ] Conectar la validación al canvas (feedback visual en tiempo real)
- [ ] Implementar el componente `CheemsBark` para mensajes de error

### Fase 3 — Generador C++ (1 semana)

- [ ] Implementar el recorrido recursivo del AST
- [ ] Crear las plantillas de generación para cada tipo de bloque
- [ ] Conectar el generador a la vista de código (Monaco Editor)
- [ ] Probar casos borde: bloques vacíos, anidamiento profundo, matrices grandes

### Fase 4 — Backend de compilación (1 semana)

- [ ] Configurar el servidor Express
- [ ] Implementar el endpoint `/api/compilar` con manejo de errores
- [ ] Agregar timeout de ejecución y límite de memoria
- [ ] Dockerizar el backend
- [ ] Conectar el frontend al backend (botón "Compilar y ejecutar")

### Fase 5 — Pulido y UX (1 semana)

- [ ] Animaciones de error (shake del bloque inválido, ícono de Cheems)
- [ ] Mensajes de error descriptivos mapeados desde los errores de g++
- [ ] Modo oscuro (negro puro como fondo, grises claros para superficies)
- [ ] Exportar código C++ como archivo `.cpp`
- [ ] Guardar y cargar programas en `localStorage`

---

## 11. Herramientas y dependencias

### Frontend

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-dnd": "^16.x",
    "react-dnd-html5-backend": "^16.x",
    "zustand": "^4.x",
    "@monaco-editor/react": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

### Backend

```json
{
  "dependencies": {
    "express": "^4.x",
    "cors": "^2.x",
    "uuid": "^9.x"
  }
}
```

### Sistema

| Herramienta | Versión mínima | Rol |
|---|---|---|
| Node.js | 20 LTS | Runtime del backend |
| g++ | 12+ | Compilador C++ |
| Docker | 24+ | Sandboxing del compilador |
| Git | cualquiera | Control de versiones |

---

## 12. Consideraciones de seguridad

La compilación y ejecución de código de usuario es la parte más crítica en términos de seguridad.

### Medidas obligatorias

1. **Ejecutar en Docker con usuario sin privilegios** — nunca compilar como `root`
2. **Timeout estricto** — máximo 5 segundos de ejecución, después se mata el proceso
3. **Límite de memoria** — configurar `ulimit` para limitar el uso de RAM (ej. 64MB)
4. **Sin acceso a red** — el contenedor de ejecución no debe tener acceso a internet
5. **Sistema de archivos de solo lectura** — el código del usuario no puede escribir archivos arbitrarios
6. **Sanitización del código** — antes de compilar, rechazar código que contenga:
   - `#include <fstream>` o acceso al sistema de archivos
   - `system()`, `exec()`, `popen()` o llamadas al sistema operativo
   - `fork()`, `pthread` u operaciones de multiproceso

### Configuración Docker de seguridad

```bash
docker run \
  --rm \
  --network none \
  --memory 64m \
  --cpus 0.5 \
  --read-only \
  --tmpfs /tmp:size=10m \
  --user 1000:1000 \
  cheemscript-compiler
```

---

## Mensaje final de la mascota

```
                    ┌─────────────────────────────────────────┐
                    │   wow. u wrote code. such compile.      │
                    │   very C++. many brackets. much wow.    │
                    └─────────────────────────────────────────┘
                               ╱
                        /\_/\  
                       ( ^ω^ )  ← Cheems aprueba tu código
                        > ♥ <
```

---

*Documento generado por CheemScript Planning Tool · v1.0*
