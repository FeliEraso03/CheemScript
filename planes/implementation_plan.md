# Plan de Implementación Integral: Refactorización UX/UI y Experiencia Educativa de CheemScript

Este documento detalla los pasos para cumplir con todas las especificaciones de UX, UI, ejecución interactiva y la integración educativa de la mascota de CheemScript. El objetivo final es lograr un entorno de programación que combine la accesibilidad visual de Scratch con la potencia de un IDE moderno (como VS Code) y la generación de código C++.

---

## 1. Rediseño Visual Completo de los Bloques (Estética Premium)

### 1.1 Apariencia y Jerarquía Visual
- **Diseño Premium**: Refactorizar completamente los `.block-container` y sus derivados. Se aplicarán sombras suaves (drop-shadow), bordes finos, y transiciones fluidas para alejarlos de la sensación de contenedores HTML simples.
- **Paleta y Categorías**: Aumentar el contraste sobre el fondo oscuro y mantener colores vibrantes y consistentes para diferenciar Variables, E/S, Condicionales, Bucles, etc.
- **Contenedores Anidados**: Diseñar zonas interiores (para `if`, `for`, `while`, `switch`) con fondos translúcidos y bordes punteados estilizados que inviten a insertar bloques hijos.

### 1.2 Interacción y Animaciones (Drag & Drop)
- **Arrastre Fluido**: Añadir un efecto de "levantamiento" (elevación de sombra y escala `1.02`) al arrastrar un bloque.
- **Zonas de Inserción (Drop Zones)**: Las áreas reaccionarán iluminándose visualmente y expandiéndose con transiciones suaves al detectar un bloque sobre ellas.
- **Microanimaciones**: Integrar transiciones sutiles en estados `hover`, `focus` (en inputs), selección, e inserción de nuevos bloques.

### 1.3 Experiencia de Edición de Inputs
- **Inputs Modernos**: Dejarán de parecer formularios HTML. Tendrán backgrounds semi-translúcidos, placeholders claros, padding adecuado y se ajustarán automáticamente al contenido si es posible.
- **Foco e Inteligencia**: Al hacer clic en un campo, se evitarán pérdidas de foco innecesarias, permitiendo un autoseleccionado fluido para escribir inmediatamente.
- **Validación No Intrusiva**: Mostrar errores de validación (ej. nombres de variables no válidos) en tiempo real mediante sutiles contornos rojos, tooltips discretos o iconos amigables, sin interrumpir el flujo de escritura.

---

## 2. Experiencia del Espacio de Trabajo (Canvas)

- **Fondo Elegante**: El área del Canvas tendrá un fondo con cuadrícula (dot grid) oscuro y discreto, mejorando la percepción espacial y el orden visual.
- **Feedback Visual**: Al realizar operaciones drag & drop, el espacio en el canvas guiará al usuario sin saltos de scroll abruptos.

---

## 3. Integración de la Mascota Interactiva Cheems

Se integrará el gráfico proporcionado como eje central de la experiencia educativa.

### 3.1 Interfaz de la Mascota
- **Posicionamiento**: Cheems estará anclado en la zona inferior de la interfaz (posiblemente junto a la consola o flotando en una esquina del canvas).
- **Animaciones Idle**: Tendrá un sutil "breathe" (respiración suave) mientras espera acciones.

### 3.2 Sistema de Globos de Diálogo (Outputs C++)
- Todo bloque que genere un `cout` se representará visualmente como un globo de diálogo emergente sobre Cheems.
- **Historial y Animación**: Los globos aparecerán con animaciones "pop", soportarán múltiples líneas y se apilarán o deslizarán en orden cronológico en sincronía con la salida real.

### 3.3 Reacciones Educativas (Feedback)
- **Errores Sintácticos/Léxicos (Automátas)**: Si el usuario forma mal un bloque, Cheems mostrará un globo con un consejo amigable sobre cómo solucionarlo.
- **Éxito al Compilar**: Reacción de celebración/confirmación visual.
- **Error de Compilación C++**: Se traducirá el críptico error de `g++` a una sugerencia comprensible por parte de Cheems, mientras la consola técnica muestra los detalles.

---

## 4. Consola Bidireccional e Interactiva (Inputs C++)

Actualmente la consola solo ejecuta y muestra el resultado final. La refactorizaremos para que actúe como una terminal real:

### 4.1 Modificaciones del Backend (Node.js)
- En lugar de ejecutar el binario y esperar a que termine (`exec` con timeout completo), el backend utilizará mecanismos de flujos continuos (`spawn` o WebSockets) para iniciar el proceso C++ y mantenerlo vivo.
- El servidor Node enviará las salidas (`stdout`) al frontend en tiempo real y aceptará comandos (`stdin`) desde el frontend para alimentar al proceso.

### 4.2 Interfaz de la Consola Visual
- **Detección de Input**: Cuando el programa llegue a un `cin` o `getline`, la consola detectará que el proceso espera datos y habilitará automáticamente un campo de escritura (prompt) parpadeante.
- **Envío y Continuación**: El usuario escribirá, presionará Enter, los datos se enviarán por `stdin` al proceso en backend, la ejecución continuará y el texto se quedará en el historial.

---

## 5. Corrección en Generación de Código C++ (Strings)

Para asegurar estabilidad en la compilación y ejecución interactiva:

### 5.1 Lectura de Textos con Espacios
- Al solicitar una entrada para variables tipo `string`, el generador (`generator.ts`) producirá:
  ```cpp
  getline(cin, variable);
  ```
  en lugar del problemático `cin >> variable;`.

### 5.2 Limpieza Segura del Buffer
- Se inyectará código para limpieza del buffer (`cin.ignore()`) *antes* de cada `getline` cuando este preceda a posibles lecturas numéricas.
- Se incluirá automáticamente `#include <limits>` y se generará:
  ```cpp
  cin.ignore(numeric_limits<streamsize>::max(), '\n');
  ```
- Esto previene el clásico bug de C++ donde `getline` lee el salto de línea residual de un `cin >> int` previo y se salta la instrucción.

---

## User Review Required
> [!IMPORTANT]
> Este plan ahora abarca absolutamente **todas** las instrucciones proporcionadas: Rediseño Premium, Consola Bidireccional interactiva, Generación Segura de Strings y la Integración de la Mascota Cheems.
>
> La carga de trabajo se dividirá en estas fases lógicas:
> 1. Modificar el generador de código C++ (Strings y Buffer).
> 2. Implementar Consola Interactiva (Backend Streams + UI Frontend).
> 3. Integración de la Mascota Cheems y sistema de Diálogos.
> 4. Rediseño Premium final de los Bloques y Animaciones.
>
> ¿Apruebas este Master Plan para comenzar inmediatamente con la Fase 1?
