Ingeniería de Sistemas | Universidad de Cartagena ![ref1]![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.002.png)

![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.003.png)

1

Teoría de Autómatas y Lenguajes Formales Programa de Ingeniería de Sistemas Universidad de Cartagena

**INFORME TÉCNICO DE PROYECTO**

**CheemScript**

*Editor Visual de Programación con Autómatas*

**Asignatura:**

Teoría de Autómatas y Lenguajes Formales

**Docente:**

Luis Carlos Tovar Garrido

**Integrantes del Equipo:** 

Andrés Manuel Ramos Pájaro 

Elias David Mieles Gomez 

Harry Perez Perea 

Juan Felipe Eraso Navarro 

Vlad Esteban Preciado Ruiz 

Universidad de Cartagena 

Cartagena de Indias, Colombia 

2026 ![ref2]

Ingeniería de Sistemas | Universidad de Cartagena  19![ref1]

<a name="_page1_x82.00_y56.92"></a>**TABLA DE CONTENIDOS ![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.005.png)**

[TABLA DE CONTENIDOS .............................................................................................................. 2 ](#_page1_x82.00_y56.92)[INTRODUCCIÓN ............................................................................................................................. 4 ](#_page3_x82.00_y56.92)

1. [PLANTEAMIENTO DEL PROBLEMA ........................................................................................ 5 ](#_page4_x82.00_y56.92)
1. [Descripción del Problema ........................................................................................................ 5 ](#_page4_x82.00_y109.92)
1. [Justificación ............................................................................................................................ 5 ](#_page4_x82.00_y304.92)
1. [Objetivos ................................................................................................................................. 5 ](#_page4_x82.00_y506.92)[Objetivo General ........................................................................................................................ 5 ](#_page4_x82.00_y534.92)[Objetivos Específicos ................................................................................................................. 5 ](#_page4_x82.00_y625.92)
2. [RESULTADOS ............................................................................................................................. 7 ](#_page6_x82.00_y56.92)
1. [Recolección de Información .................................................................................................... 7 ](#_page6_x82.00_y109.92)
1. [Desarrollo de la Solución......................................................................................................... 7 ](#_page6_x82.00_y319.92)

[CONCLUSIONES ............................................................................................................................. 8 ](#_page7_x82.00_y56.92)[BIBLIOGRAFÍA ............................................................................................................................... 9 ](#_page8_x82.00_y56.92)[PARTE I: ESPECIFICACIÓN DE REQUISITOS DEL SOFTWARE (ERS) ....................................10 ](#_page9_x82.00_y56.92)

1. [Introducción y Alcance ...........................................................................................................10 ](#_page9_x82.00_y178.92)
1. [Partes Interesadas y Perfiles de Usuario ..................................................................................10 ](#_page9_x82.00_y366.92)
1. [Restricciones del Entorno .......................................................................................................10 ](#_page9_x82.00_y531.92)
1. [Requisitos Funcionales ...........................................................................................................10 ](#_page9_x82.00_y697.92)
1. [Requisitos No Funcionales .....................................................................................................11 ](#_page10_x82.00_y435.92)
1. [Catálogo Completo de Bloques y Autómatas ..........................................................................11 ](#_page10_x82.00_y698.92)

[PARTE II: MANUAL DEL SISTEMA .............................................................................................13 ](#_page12_x82.00_y56.92)[Introducción ..................................................................................................................................13 ](#_page12_x82.00_y177.92)

1. [Modelo de Negocio ...................................................................................................................13 ](#_page12_x82.00_y287.92)
1. [Procesos de Negocio...........................................................................................................13 ](#_page12_x82.00_y315.92)
1. [Casos de Uso del Sistema ...................................................................................................13 ](#_page12_x82.00_y421.92)
1. [Modelo de Dominio ............................................................................................................13 ](#_page12_x82.00_y752.92)
1. [Glosario..............................................................................................................................14 ](#_page13_x82.00_y139.92)
2. [Requisitos (resumen) .................................................................................................................14 ](#_page13_x82.00_y471.92)
3. [Modelo de Diseño .....................................................................................................................14 ](#_page13_x82.00_y611.92)
1. [Vista de Escenarios — Diseño de Interfaz Gráfica ..............................................................14 ](#_page13_x82.00_y639.92)
1. [Vista Lógica — Arquitectura del Sistema ...........................................................................15 ](#_page14_x82.00_y75.92)
1. [Vista de Procesos — Diagramas de Secuencia ....................................................................15 ](#_page14_x82.00_y318.92)
4. [Modelo de Implementación .......................................................................................................15 ](#_page14_x82.00_y453.92)
1. [Vista de Desarrollo — Tecnologías.....................................................................................15 ](#_page14_x82.00_y481.92)
1. [Vista Física — Despliegue con Docker ...............................................................................15 ](#_page14_x82.00_y754.92)[Comandos de operación ............................................................................................................16 ](#_page15_x82.00_y182.92)
5. [Guía para Agregar un Nuevo Bloque .........................................................................................16 ](#_page15_x82.00_y330.92)[PARTE III: MANUAL DE USUARIO .............................................................................................17 ](#_page16_x82.00_y56.92)![ref2]

[Introducción ..................................................................................................................................17 ](#_page16_x82.00_y127.92)

1. [Instalación y Configuración .......................................................................................................17 ](#_page16_x82.00_y238.92)[Requisitos Previos .....................................................................................................................17 ](#_page16_x82.00_y266.92)[Pasos de Instalación ..................................................................................................................17 ](#_page16_x82.00_y377.92)
1. [Aspectos Generales del Entorno ................................................................................................17 ](#_page16_x82.00_y588.92)
1. [Explicación de la Funcionalidad por Casos de Uso ....................................................................18 ](#_page17_x82.00_y151.92)[CU-01: Crear un programa — Ejemplo "Hola Mundo" ..............................................................18 ](#_page17_x82.00_y179.92)[CU-02: Usar variables y estructuras de control ..........................................................................18 ](#_page17_x82.00_y329.92)[CU-03: Operaciones con bloques...............................................................................................18 ](#_page17_x82.00_y493.92)[CU-04: Compilar y ejecutar un programa ..................................................................................18 ](#_page17_x82.00_y697.92)[CU-05: Interactuar con el programa durante la ejecución ...........................................................19 ](#_page18_x82.00_y75.92)[CU-06: Exportar e importar un programa ..................................................................................19 ](#_page18_x82.00_y166.92)[CU-07: Rastreo de ejecución (Tracing) ......................................................................................19 ](#_page18_x82.00_y292.92)
1. [Solución de Problemas ..............................................................................................................19 ](#_page18_x82.00_y383.92)![ref2]

<a name="_page3_x82.00_y56.92"></a>**INTRODUCCIÓN ![ref3]**

El presente documento constituye el informe técnico del proyecto CheemScript, desarrollado en el marco de la asignatura Teoría de Autómatas y Lenguajes Formales del Programa de Ingeniería de Sistemas de la Universidad de Cartagena. El proyecto surge de la necesidad de construir una herramienta didáctica que permita a los estudiantes comprender de manera práctica y visual cómo los autómatas finitos deterministas (AFD) y los autómatas de pila deterministas (DPDA) pueden emplearse como mecanismos de validación semántica en un entorno de programación real. 

CheemScript  es  una  plataforma  web  de  programación  visual  interactiva  inspirada  en  el paradigma de bloques arrastrables (estilo Scratch), que genera código C++ válido de manera automática a partir de las construcciones que el usuario ensambla en un lienzo gráfico. Cada bloque del entorno es validado en tiempo real por un autómata especializado antes de ser transformado en código compilable. Dicho código puede ejecutarse directamente desde el navegador gracias a un backend dockerizado que integra el compilador g++ y un canal de comunicación bidireccional mediante WebSocket. 

El informe se estructura siguiendo los lineamientos establecidos por el docente. En la primera sección  se  presenta  el  planteamiento  del  problema,  que  incluye  la  descripción  del  problema,  la justificación y los objetivos del proyecto. La segunda sección presenta los resultados, divididos en la recolección de información y el desarrollo de la solución. A continuación, se incluyen las conclusiones del equipo, la bibliografía, y los tres documentos técnicos exigidos: la Especificación de Requisitos del Software (ERS), el Manual del Sistema y el Manual de Usuario. ![ref2]

1. **PLANTEAMIENTO<a name="_page4_x82.00_y56.92"></a> DEL PROBLEMA ![ref3]**
1. ***Descripción<a name="_page4_x82.00_y109.92"></a> del Problema*** 

Los cursos de Teoría de Autómatas y Lenguajes Formales en los programas de Ingeniería de Sistemas enfrentan un reto pedagógico persistente: la brecha entre la teoría abstracta de los autómatas y su  aplicación  práctica  en  el  desarrollo  de  software.  Los  estudiantes  pueden  aprender  a  definir formalmente una 5-tupla (Q, Σ, δ, q0, F) y a trazar tablas de transición sobre el papel, pero rara vez observan cómo estos formalismos operan dentro de un sistema computacional real. 

Esta desconexión dificulta la apropiación profunda de los conceptos, pues el estudiante no experimenta de forma directa cómo un autómata rechaza o acepta una cadena de entrada en el contexto de un problema concreto de programación. El resultado es un aprendizaje superficial que no logra transferirse a las etapas posteriores del plan de estudios, como diseño de compiladores, procesamiento de lenguajes o verificación formal. 

2. ***Justificación<a name="_page4_x82.00_y304.92"></a>*** 

CheemScript  responde  a  esta  brecha  pedagógica  construyendo  un  entorno  en  el  que  los autómatas no son un objeto de estudio aislado, sino un componente activo del sistema: validan la estructura de cada bloque de programación antes de generar código C++. El estudiante observa en tiempo real cómo el autómata acepta o rechaza una expresión, vinculando directamente la teoría con el comportamiento del software. 

Adicionalmente, el proyecto permite que los estudiantes sin experiencia previa en programación construyan  algoritmos  mediante  bloques  visuales,  reduciendo  la  curva  de  aprendizaje  sintáctica  y permitiendo que el foco cognitivo recaiga en la estructura lógica del programa y en el funcionamiento de los autómatas que lo validan. La plataforma resulta pertinente tanto como herramienta de enseñanza para el docente como medio de exploración autónoma para el estudiante. 

3. ***Objetivos<a name="_page4_x82.00_y506.92"></a> \
   <a name="_page4_x82.00_y534.92"></a>*Objetivo General**

   Desarrollar  un  entorno  visual  de  programación  basado  en  bloques  que  integre  autómatas  finitos deterministas y autómatas de pila deterministas como mecanismo de validación semántica en tiempo real, generando código C++ compilable y ejecutable directamente desde el navegador. 

   <a name="_page4_x82.00_y625.92"></a>**Objetivos Específicos**

- Implementar una interfaz gráfica de bloques arrastrables que cubra las estructuras fundamentales de programación imperativa: control de flujo, variables, datos estructurados, entrada/salida y temporización. 
- Diseñar e implementar autómatas finitos deterministas (AFD) y autómatas de pila deterministas (DPDA) para la validación formal de la estructura de cada tipo de bloque. 
- Construir un generador de código C++ que traduzca el árbol de sintaxis abstracta (AST) en código fuente válido, incluyendo las cabeceras necesarias y la función main(). ![ref2]
- Integrar un backend dockerizado con el compilador g++ y un canal WebSocket para compilar y ejecutar los programas generados directamente desde el navegador. 
- Implementar un sistema de rastreo (tracing) que resalte visualmente el bloque en ejecución para facilitar la comprensión del flujo de control del programa. ![ref2]
2. **RESULTADOS<a name="_page6_x82.00_y56.92"></a> ![ref3]**
1. ***Recolección<a name="_page6_x82.00_y109.92"></a> de Información*** 

La recolección de información se realizó a través de tres fuentes principales. En primer lugar, se revisaron los contenidos del plan de estudios de la asignatura Teoría de Autómatas y Lenguajes Formales, identificando los formalismos centrales (AFD, DPDA, expresiones regulares, jerarquía de Chomsky) que debían reflejarse en el proyecto. En segundo lugar, se analizó la literatura técnica sobre compiladores y procesadores de lenguajes, particularmente los patrones de diseño de analizadores léxicos y sintácticos, que sirvieron de referencia para el diseño de los autómatas de validación. 

En tercer lugar, se estudió el funcionamiento de entornos de programación visual como Scratch y Snap!, identificando los patrones de interacción (drag & drop, bloques anidados, reporters ovalados, slots de expresión) que se adoptaron como referencia de usabilidad. Los resultados de esta revisión se documentaron en el plan de análisis de autómatas (analisis\_automatas\_afd.md), que define formalmente los 18 autómatas implementados en el proyecto. 

2. ***Desarrollo<a name="_page6_x82.00_y319.92"></a> de la Solución*** 

La solución se estructuró en dos componentes principales: el frontend y el backend, conectados mediante HTTP REST y WebSocket, y orquestados mediante Docker Compose. 

El frontend se implementó con React 19 y TypeScript, adoptando el patrón de árbol de sintaxis abstracta normalizado (AST) para representar el programa en construcción. Cada bloque del lienzo corresponde a un UINode con un identificador UUID único, un tipo de bloque, sus parámetros internos (data) y sus zonas de hijos (children). Este diseño plano facilita las operaciones de inserción, eliminación y reordenamiento sin necesidad de recorrer estructuras de árbol complejas. 

El  sistema  de  autómatas  se  implementó  en  TypeScript  puro,  sin  dependencias  externas, siguiendo  estrictamente  las  definiciones  formales  de  la  teoría  de  la  computación.  Cada  autómata devuelve un objeto de resultado con el estado final, un indicador booleano de aceptación y un mensaje descriptivo del error en caso de rechazo. Esta interfaz uniforme permite que el generador de código y la interfaz de usuario consuman los resultados de validación de manera consistente. 

El generador de código C++ implementa un recorrido en preorden del AST, emitiendo el fragmento  de  código  correspondiente  para  cada  tipo  de  nodo  y  recursando  sobre  sus  hijos. Adicionalmente, inyecta marcadores especiales en el código generado que el sistema de tracing usa para asociar líneas de código con UUIDs de bloques, permitiendo el resaltado visual durante la ejecución. 

El  backend  se  implementó  con  Node.js  y  Express,  recibiendo  el  código  C++  por  HTTP, compilándolo con g++ y ejecutando el binario resultante mediante un proceso hijo. La comunicación en tiempo real con el frontend durante la ejecución se realiza mediante WebSocket, transmitiendo la salida estándar (stdout), la salida de error (stderr) y el código de salida del proceso. Por razones de seguridad, el  binario  se  ejecuta  bajo  un  usuario  sin  privilegios  y  los  archivos  temporales  se  eliminan automáticamente al finalizar la sesión. ![ref2]

<a name="_page7_x82.00_y56.92"></a>**CONCLUSIONES ![ref3]**

El desarrollo de CheemScript permitió al equipo comprender de manera práctica y directa cómo los formalismos de la teoría de la computación se traducen en componentes funcionales de un sistema de software real. La implementación de dieciocho autómatas, entre AFDs y DPDAs, exigió revisar con rigor las definiciones formales estudiadas en el curso y tomar decisiones de diseño fundamentadas en la jerarquía de Chomsky: los lenguajes regulares (validados por AFD) y los lenguajes libres de contexto (validados por DPDA) tienen aplicaciones concretas y diferenciadas dentro de un procesador de lenguaje visual. 

Una  de  las  lecciones  más  significativas  fue  la  que  surgió  al  intentar  validar  expresiones aritméticas con paréntesis balanceados usando un AFD: la imposibilidad formal de hacerlo (demostrada por el Lema de Bombeo) se convirtió en una motivación comprensible y concreta para introducir los autómatas de pila. Este tipo de razonamiento, en el que la teoría impone una decisión de ingeniería, representa exactamente la clase de aprendizaje transferible que el proyecto buscaba promover. 

El proyecto también evidenció la importancia de las prácticas de ingeniería de software en proyectos de mediana escala. La separación en módulos independientes (un archivo por bloque, un archivo por autómata), el uso de TypeScript para garantizar contratos de tipos entre componentes, y la containerización  con  Docker  para  eliminar  la  variabilidad  del  entorno  de  desarrollo  y  despliegue resultaron decisiones que redujeron significativamente la fricción de integración entre los miembros del equipo. 

Finalmente, la construcción del sistema de tracing, que mapea líneas de código C++ a bloques visuales y  los resalta durante la  ejecución, permitió al equipo reflexionar sobre la dualidad  entre representación visual y representación textual de un programa, y sobre los mecanismos que los entornos de desarrollo modernos utilizan para ofrecer retroalimentación interactiva al programador. Este insight conecta  directamente  con  los  contenidos  de  diseño  de  compiladores  que  se  verán  en  semestres posteriores. ![ref2]

<a name="_page8_x82.00_y56.92"></a>**BIBLIOGRAFÍA ![ref3]**

Hopcroft, J. E., Motwani, R., & Ullman, J. D. (2006). Introduction to Automata Theory, Languages, and Computation (3.ª ed.). Addison-Wesley. 

Sipser, M. (2012). Introduction to the Theory of Computation (3.ª ed.). Cengage Learning. 

Aho, A. V., Lam, M. S., Sethi, R., & Ullman, J. D. (2006). Compilers: Principles, Techniques, and Tools (2.ª ed.). Addison-Wesley. 

React Documentation. (2024). React 19 Release Notes. Recuperado de https://react.dev 

Vite. (2024). Vite Build Tool Documentation. Recuperado de https://vitejs.dev 

Docker Inc. (2024). Docker Compose Reference. Recuperado de https://docs.docker.com/compose OpenJS Foundation. (2024). Node.js Documentation. Recuperado de https://nodejs.org/en/docs Express.js. (2024). Express 5 API Reference. Recuperado de https://expressjs.com 

Microsoft. (2024). Monaco Editor API. Recuperado de https://microsoft.github.io/monaco-editor GCC. (2024). GNU Compiler Collection Documentation. Recuperado de https://gcc.gnu.org/onlinedocs IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications. Normas ICONTEC para trabajos escritos. Instituto Colombiano de Normas Técnicas y Certificación. ![ref2]

<a name="_page9_x82.00_y56.92"></a>**PARTE I: ESPECIFICACIÓN DE REQUISITOS DEL SOFTWARE (ERS) ![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.007.png)**

La presente especificación sigue los lineamientos del estándar IEEE 830 y la norma ISO/IEC/IEEE 29148, documentando los requisitos funcionales y no funcionales del sistema CheemScript. 

1. ***Introducción<a name="_page9_x82.00_y178.92"></a> y Alcance*** 

CheemScript es un entorno de programación visual en el que el usuario construye programas mediante bloques  arrastrables  que  generan  código  C++  compilable.  El  sistema  emplea  autómatas  finitos deterministas  (AFD)  y  autómatas  de  pila  deterministas  (DPDA)  como  mecanismos  de  validación semántica en tiempo real. El alcance funcional cubre la edición visual de programas, la validación mediante autómatas, la generación de código C++, y la compilación y ejecución del código en el navegador. 

Quedan fuera del alcance de la versión actual: la persistencia automática de proyectos en la nube, la colaboración multiusuario en tiempo real, el soporte para lenguajes distintos de C++ y la autenticación de usuarios. 

2. ***Partes<a name="_page9_x82.00_y366.92"></a> Interesadas y Perfiles de Usuario*** 



|**Perfil**|**Descripción**|**Nivel técnico**|
| - | - | - |
|Estudiante de Ing. de Sistemas|Usa CheemScript para aprender programación y lenguajes formales|Básico-Intermedio|
|Docente universitario|Utiliza CheemScript como herramienta de enseñanza y evaluación![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.008.png)|Avanzado|
|Desarrollador / contribuidor|Extiende la plataforma con nuevos bloques o autómatas|Avanzado|

3. ***Restricciones<a name="_page9_x82.00_y531.92"></a> del Entorno*** 
- El sistema debe ejecutarse localmente mediante Docker Desktop (v4.0 o superior). 
- Se requiere conexión a Internet únicamente durante la primera ejecución, para descargar las imágenes Docker. 
- El navegador debe ser compatible con HTML5, WebSocket y la API de Drag and Drop (Chrome, Firefox, Edge, Safari — versiones 2022 en adelante). 
- El backend limita el proceso compilado a 512 MB de RAM y 1 CPU lógica por sesión. 
- Los binarios C++ compilados se eliminan automáticamente al finalizar la ejecución. 
4. ***Requisitos<a name="_page9_x82.00_y697.92"></a> Funcionales ![ref2]***



|**ID**|**Nombre**|**Descripción**|
| - | - | - |
|RF-01|Paleta de bloques|Presenta al usuario una barra lateral con los 21 bloques disponibles organizados por categoría. Incluye búsqueda por texto y reporters de variables en tiempo real.|
|RF-02|Arrastrar y soltar|Permite arrastrar bloques de la paleta al lienzo (Canvas) o a zonas de anidamiento (NestedDropZone). Los reporters se sueltan en slots de expresión (ExpressionSlot).![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.009.png)|
|RF-03|Edición de parámetros|Permite editar parámetros de los bloques directamente en la interfaz (campos de texto, dropdowns, toggles de tipo).|
|RF-04|Validación por autómata![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.010.png)|Cada bloque es validado por su AFD o DPDA asociado. Los errores se marcan visualmente en tiempo real.|
|RF-05|Generación de código C++|Genera código C++ válido desde el AST con headers automáticos y función main(). El código se visualiza en Monaco Editor (solo lectura).|
|RF-06|Compilación y ejecución![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.011.png)|Compila el código con g++ en el backend y ejecuta el binario, mostrando la salida en una consola integrada con soporte de entrada interactiva.|
|RF-07|Reordenar y eliminar bloques|Permite mover bloques arriba/abajo y eliminarlos. Al eliminar, se limpian las variables registradas.|
|RF-08|Inferencia de tipos|Infiere el tipo C++ de una variable (int, double, bool, string, char) mediante afd\_var\_infer. Usa int como fallback con aviso en consola.|
|RF-09|Exportación del código|Permite copiar el código al portapapeles, descargarlo como .cpp y exportar/importar el estado en JSON.|
|RF-10|Rastreo de ejecución|Inyecta marcadores en el código generado para resaltar el bloque activo en el lienzo durante la ejecución.|

5. ***Requisitos<a name="_page10_x82.00_y435.92"></a> No Funcionales*** 



|**ID**|**Categoría![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.012.png)**|**Descripción**|
| - | - | - |
|RNF-01|Rendimiento|La generación de código se completa en menos de 100 ms para programas de hasta 50 bloques.|
|RNF-02|Usabilidad|Un usuario sin experiencia debe poder crear y ejecutar su primer programa en menos de 10 minutos.|
|RNF-03|Portabilidad|Funciona en Windows, macOS y Linux con Docker Desktop instalado.|
|RNF-04|Seguridad![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.013.png)|El backend ejecuta los binarios sin privilegios de root (usuario cheemscript).|
|RNF-05|Seguridad|El proceso compilado está limitado a 512 MB de RAM y 1 CPU.|
|RNF-06|Mantenibilidad|Cada bloque está implementado en un archivo TSX independiente.|
|RNF-07|Mantenibilidad|Cada autómata está en su propio archivo TypeScript con su interfaz de resultado exportada.|
|RNF-08|Compatibilidad|El código C++ generado compila sin errores con g++ 12 o superior (C++17).|

6. ***Catálogo<a name="_page10_x82.00_y698.92"></a> Completo de Bloques y Autómatas*** 

La siguiente tabla describe los 21 bloques implementados con su autómata validador correcto y el código C++ que generan. Todos los bloques tienen un autómata asociado, ya sea directamente en su componente o mediante las funciones del módulo afd\_var\_infer.ts que actúa como validador central compartido. ![ref2]



|**Bloque**|**Categoría**|**Autómata validador**|**Código C++ generado**|
| - | - | - | - |
|repetir (veces)|Control Scratch|dpda\_repeat (pdaExpresionAritmetica)|for (int \_i = 0; \_i < N; \_i++)|
|repetir hasta que|Control Scratch|dpda\_repeat (pdaExpresionAritmetica)![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.014.png)|while (!(condición))|
|si / sino|Control Scratch|afd\_if|if-else if-else|
|según / caso|Control Scratch|afd\_switch|switch-case-default|
|for (clásico)|Control C++|afd\_for (validarInit + validarIncrement)|for (init; cond; inc)|
|while (clásico)|Control C++|dpda\_expr (pdaExpresion)|while (cond)|
|crear variable|Variables Scratch|afd\_var\_infer (inferTypeFromValue)|tipo nom = val;|
|asignar variable|Variables Scratch|afd\_var\_infer (validarValorAsignacion)|var = val;|
|cambiar variable|Variables Scratch|afd\_var\_infer (validarAmount)|var += N;|
|mostrar variable|Variables Scratch|afd\_print|cout << var << endl;|
|variable (tipada)|Variables C++|afd\_var\_infer (inferTypeFromValue)|tipo nom = val;|
|array 1D|Datos C++|afd\_var\_infer (validarTamanioOVariable + validarListaValores)![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.015.png)|tipo nom[sz] = {vals};|
|matriz 2D|Datos C++|afd\_var\_infer (validarNombreVariable + validarTamanioOVariable)|tipo nom[rows][cols];|
|crear lista|Datos C++|afd\_var\_infer (validarListaValores + inferTypeFromValue)![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.016.png)![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.017.png)|vector<tipo> nom = {vals};|
|decir (segs)|E/S Scratch|afd\_print|cout << val << endl; sleep\_for(Ns)|
|preguntar y esperar|E/S Scratch|afd\_var\_infer (esString)|cout << q; cin >> var;|
|print (cout)|E/S C++|afd\_print|cout << val << endl;|
|input (cin)|E/S C++|afd\_var\_infer (esString)|cout << q; cin >> var;|
|esperar|Tiempo|<p>afd\_var\_infer (validarAmount </p><p>+ esEntero + esDouble)</p>|sleep\_for(chrono::seconds(N))|
|wait ms|Tiempo|afd\_var\_infer (validarAmount)![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.018.png)|sleep\_for(chrono::milliseconds(N))|
|número aleatorio|Avanzado C++|afd\_var\_infer (inferTypeFromValue)|uniform\_int/real\_distribution<T> dist(...)|

<a name="_page12_x82.00_y56.92"></a>**PARTE II: MANUAL DEL SISTEMA ![ref3]**

El presente manual está dirigido a desarrolladores que deseen comprender la arquitectura interna de CheemScript, contribuir con nuevos bloques o autómatas, o desplegar la aplicación en un entorno diferente. 

<a name="_page12_x82.00_y177.92"></a>***Introducción*** 

CheemScript integra la teoría de autómatas con el desarrollo de software web moderno. El sistema se compone de dos servicios containerizados: un frontend React que implementa el editor visual y la lógica de validación, y un backend Node.js que proporciona el compilador C++ y el canal de ejecución en tiempo real. 

1. ***Modelo<a name="_page12_x82.00_y287.92"></a> de Negocio*** 
1. **Procesos<a name="_page12_x82.00_y315.92"></a> de Negocio**

El proceso central de CheemScript es el ciclo Editar-Validar-Generar-Compilar-Ejecutar. El usuario ensambla bloques en el lienzo; cada bloque dispara su autómata de validación al editarse; si el árbol es válido, el generador emite código C++ que el usuario puede compilar con un clic; el backend compila el código y retransmite la salida en tiempo real vía WebSocket. 

2. **Casos<a name="_page12_x82.00_y421.92"></a> de Uso del Sistema**



|**Caso de Uso**|**Actor![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.019.png)**|**Descripción breve**|
| - | - | - |
|CU-01: Crear programa|Estudiante|Arrastra bloques de la paleta al lienzo para construir un algoritmo|
|CU-02: Validar bloque|Sistema|Ejecuta el autómata del bloque y marca errores en tiempo real|
|CU-03: Ver código C++|Estudiante|Observa el código generado en el panel de Monaco Editor|
|CU-04: Compilar y ejecutar|Estudiante|Envía el código al backend, compila con g++ y recibe la salida|
|CU-05: Interactuar con programa|Estudiante|Escribe entradas en la consola integrada durante la ejecución|
|CU-06: Exportar / Importar|Estudiante|Guarda el estado en JSON o lo carga desde un archivo|
|CU-07: Rastrear ejecución|Estudiante|Activa el modo tracing para ver el bloque activo en el lienzo|

3. **Modelo<a name="_page12_x82.00_y752.92"></a> de Dominio![ref2]**

Las entidades centrales del dominio son: UINode (nodo del AST), VariableEntry (variable registrada con tipo inferido), Block (componente visual React), Automaton (módulo de validación AFD/DPDA), y  CodeGenerator  (módulo  que  recorre  el  AST  y  emite  C++).  Las  relaciones  entre  entidades  se representan en el diagrama de clases del proyecto UML. 

4. **Glosario**

<a name="_page13_x82.00_y139.92"></a> 

|**Término**|**Definición**|
| - | - |
|AFD|Autómata Finito Determinista: modelo formal con estados finitos y transiciones deterministas|
|DPDA|Autómata de Pila Determinista: autómata con memoria de pila, reconoce lenguajes libres de contexto|
|AST|Árbol de Sintaxis Abstracta: representación en árbol de la estructura lógica del programa|
|UINode|Unidad básica del AST de CheemScript con UUID, tipo, parámetros y hijos|
|Reporter|Bloque ovalado que representa el valor de una variable, arrastrable a slots de expresión|
|Canvas|Lienzo principal del editor donde el usuario construye el programa|
|NestedDropZone|Zona de anidamiento dentro de un bloque contenedor que puede recibir otros bloques|
|ExpressionSlot|Ranura visual dentro de un bloque que acepta reporters o expresiones booleanas|
|Source Map|Mapa entre líneas de código C++ generado y UUIDs de bloques, usado por el tracing|
|WebSocket|Protocolo de comunicación bidireccional para transmitir la salida del programa en tiempo real|

2. ***Requisitos<a name="_page13_x82.00_y471.92"></a> (resumen)*** 

Se presentan en forma resumida los requisitos priorizados. El detalle completo de la especificación se encuentra en la Parte I de este informe, en la que se aplicó la norma ISO/IEC/IEEE 29148. Los atributos de calidad que debe cumplir el sistema son: rendimiento (generación de código < 100 ms), usabilidad (primer  programa  en  <  10  min),  portabilidad  (Windows,  macOS,  Linux  con  Docker),  seguridad (ejecución  sin  root,  recursos  limitados)  y  mantenibilidad  (un  archivo  por  bloque,  un  archivo  por autómata). 

3. ***Modelo<a name="_page13_x82.00_y611.92"></a> de Diseño*** 
1. **Vista<a name="_page13_x82.00_y639.92"></a> de Escenarios — Diseño de Interfaz Gráfica**

La interfaz adopta un layout de tres paneles: barra lateral izquierda (paleta), lienzo central (canvas) y panel derecho (escenario / código C++). Esta distribución minimiza el movimiento ocular entre la paleta de bloques y el lienzo de construcción, y separa claramente el espacio de trabajo del resultado generado. La consola de salida ocupa el panel inferior. 

El sistema de color por categoría (verde para control, dorado para variables, púrpura para E/S, naranja para tiempo) permite al usuario identificar visualmente el tipo de bloque sin leer su etiqueta, reduciendo la carga cognitiva. El fondo oscuro reduce la fatiga visual en sesiones prolongadas de estudio. ![ref2]

2. **Vista<a name="_page14_x82.00_y75.92"></a> Lógica — Arquitectura del Sistema**

CheemScript adopta una arquitectura cliente-servidor de dos capas containerizada mediante Docker Compose.  La  comunicación  ocurre  por  HTTP  REST  (compilación)  y  WebSocket  (ejecución).  El frontend implementa el patrón Context + Reducer (React Context / ASTContext) para el estado global, garantizando actualizaciones inmutables y predecibles. 



|**Capa![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.020.png)**|**Tecnología**|**Puerto**|**Responsabilidad**|
| - | - | - | - |
|Frontend|React 19 + TypeScript + Vite / Nginx|8080 (host)|Editor visual, AST, autómatas, generación de código|
|Backend|Node.js 20 + Express 5 + ws|3001 (interno)|Compilación con g++, ejecución, WebSocket|
|Proxy Nginx|nginx:alpine|80 (interno)|Sirve el SPA y enruta /api/\* y /ws/\* al backend|

3. **Vista<a name="_page14_x82.00_y318.92"></a> de Procesos — Diagramas de Secuencia**

El flujo de compilación y ejecución sigue la siguiente secuencia: (1) el usuario hace clic en Compilar; (2) el frontend llama POST /api/compilar con el código C++ generado; (3) el backend escribe el código en /tmp/<uuid>.cpp y lanza g++; (4) si la compilación es exitosa, retorna { exito: true, sessionId }; (5) el frontend abre una conexión WebSocket en /ws?sessionId=<uuid>; (6) el backend lanza el binario y transmite stdout/stderr como mensajes JSON; (7) el usuario puede enviar stdin o detener el proceso; (8) al finalizar, el backend elimina el binario y cierra la sesión. 

4. ***Modelo<a name="_page14_x82.00_y453.92"></a> de Implementación*** 
1. **Vista<a name="_page14_x82.00_y481.92"></a> de Desarrollo — Tecnologías**



|**Componente**|**Tecnología**|**Versión**|**Justificación**|
| - | - | - | - |
|Frontend UI|React + TypeScript|19\.x / 6.x|Ecosistema maduro, tipado estático, gran disponibilidad de librerías|
|Drag & Drop|react-dnd + html5-backend|16\.x|API declarativa, soporte nativo HTML5 DnD sin dependencias nativas|
|Editor de código|@monaco- editor/react|4\.7.x|El mismo motor de VS Code, resaltado C++ de alta calidad|
|Bundler|Vite|8\.x|HMR instantáneo en desarrollo, build optimizado para producción![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.021.png)|
|Backend HTTP|Express 5|5\.x|Framework minimal, middleware estándar, soporte async nativo|
|WebSocket![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.022.png)|ws![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.023.png)|8\.x|Librería de bajo nivel, sin overhead innecesario|
|Compilador C++|g++ (GCC)|12+|Compilador de referencia para C++17, disponible en Alpine Linux|

2. **Vista<a name="_page14_x82.00_y754.92"></a> Física — Despliegue con Docker![ref2]**

|**Imagen Docker**|**Servicio**|**Componentes adicionales**|
| - | - | - |
|node:20-alpine|Backend|g++, libstdc++ (instalados con apk add)|
|node:20-alpine (build stage)|Frontend (build)|Vite, TypeScript, todas las dependencias de desarrollo![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.024.png)|
|nginx:alpine|Frontend (runtime)|Solo el build estático y nginx.conf con proxy al backend|

<a name="_page15_x82.00_y182.92"></a>**Comandos de operación**

- Primera ejecución (construye y levanta)\
  docker compose up --build![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.025.png)
- Acceso a la aplicación\
  http://localhost:8080
- Apagar el entorno\
  docker compose down
5. ***Guía<a name="_page15_x82.00_y330.92"></a> para Agregar un Nuevo Bloque*** 
1. Crear src/blocks/NuevoBloque.tsx usando useAST() para gestionar el estado del nodo. 
1. Registrar el tipo en src/components/Sidebar.tsx en el array de bloques con blockType, título y categoría. 
1. Agregar el caso en src/codegen/generator.ts dentro del switch(node.type). 
1. Opcional: crear o reutilizar un autómata en src/automata/ para validar la estructura. 
1. Agregar los colores CSS en src/index.css: --bg-<tipo> y --accent-<tipo>. ![ref2]

<a name="_page16_x82.00_y56.92"></a>**PARTE III: MANUAL DE USUARIO ![ref3]**

<a name="_page16_x82.00_y127.92"></a>***Introducción*** 

CheemScript es un entorno de programación visual que permite construir algoritmos mediante bloques arrastrables y ejecutarlos como programas C++ directamente en el navegador. Este manual está dirigido a estudiantes y usuarios finales que deseen utilizar la plataforma sin necesidad de experiencia previa en programación. 

<a name="_page16_x82.00_y238.92"></a>***1. Instalación y Configuración*** 

<a name="_page16_x82.00_y266.92"></a>**Requisitos Previos**

- Docker Desktop instalado y en ejecución (disponible en https://www.docker.com/products/docker-desktop para Windows, macOS y Linux). 
- Una terminal disponible (PowerShell en Windows, Terminal en macOS/Linux). 
- Puerto 8080 disponible en el computador. 

<a name="_page16_x82.00_y377.92"></a>**Pasos de Instalación**

6. Descargar o clonar el repositorio del proyecto. 
6. Abrir Docker Desktop y asegurarse de que esté en ejecución. 
6. Abrir una terminal en la carpeta raíz del proyecto (donde se encuentra docker-compose.yml). 
6. Ejecutar el comando: 

   docker compose up --build![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.026.png)

La  primera  ejecución  puede  tomar  varios  minutos  mientras  Docker  descarga  las  imágenes.  Las siguientes ejecuciones son más rápidas. 

10. Cuando la terminal muestre el mensaje de inicio del servidor, abrir el navegador y acceder a: http://localhost:8080![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.027.png)

Para detener el entorno: presionar Ctrl+C en la terminal o ejecutar docker compose down. 

2. ***Aspectos<a name="_page16_x82.00_y588.92"></a> Generales del Entorno*** 

Al acceder a la aplicación, el usuario ve primero la pantalla de bienvenida con el nombre del proyecto, los integrantes y el botón "Abrir Editor". Al hacer clic, se accede al editor principal, que se divide en cuatro áreas: ![ref2]



|**Área**|**Ubicación**|**Descripción**|
| - | - | - |
|Barra lateral (Sidebar)|Panel izquierdo|Paleta de bloques por categoría con búsqueda de texto|
|Lienzo (Canvas)|Panel central|Zona de construcción del programa mediante drag & drop|
|Panel derecho|Panel derecho|Pestaña Escenario (mascota Cheems) o pestaña Código C++|



|**Área**|**Ubicación**|**Descripción**|
| - | - | - |
|Consola|Panel inferior|Salida del programa, errores de compilación y entrada de datos|
|Barra de herramientas|Parte superior|Botones de compilar, detener, limpiar, exportar e importar|

3. ***Explicación<a name="_page17_x82.00_y151.92"></a> de la Funcionalidad por Casos de Uso*** 

<a name="_page17_x82.00_y179.92"></a>**CU-01: Crear un programa — Ejemplo "Hola Mundo"**

11. En la barra lateral, buscar "print" o desplegar la categoría "Avanzado (C++)". 
11. Arrastrar el bloque "print (cout)" al lienzo central. 
11. En el campo de texto del bloque, escribir: "Hola, Mundo!" 
11. Hacer clic en el botón Compilar en la barra de herramientas. 
11. Observar el código C++ generado en la pestaña "Código C++" del panel derecho. 
11. Si la compilación es exitosa, la salida aparecerá en la consola inferior. 

<a name="_page17_x82.00_y329.92"></a>**CU-02: Usar variables y estructuras de control**

17. Arrastrar un bloque "crear variable" al lienzo. Escribir "edad" como nombre y "20" como valor. 
17. Arrastrar un bloque "si / sino" debajo del bloque de variable. 
17. En el campo de condición, escribir: edad >= 18 
17. Arrastrar un bloque "print (cout)" al interior del cuerpo del si. Escribir: "Mayor de edad" 
17. Hacer clic en "Agregar else" y agregar otro print con: "Menor de edad" 
17. Compilar y ejecutar. 

<a name="_page17_x82.00_y493.92"></a>**CU-03: Operaciones con bloques**



|**Acción**|**Cómo realizarla**|
| - | - |
|Agregar un bloque|Arrastrar desde la barra lateral y soltar en el lienzo o zona de anidamiento|
|Mover hacia arriba|Clic en el botón ▲ en la cabecera del bloque|
|Mover hacia abajo|Clic en el botón ▼ en la cabecera del bloque|
|Eliminar|Clic en el botón ✕ en la cabecera del bloque|
|Editar parámetros|Clic en los campos de texto del bloque y escribir|
|Cambiar tipo de dato|Clic en el badge de tipo (ej. "int") en bloques de variable|
|Usar variable en expresión|Arrastrar el chip ovalado (reporter) de la variable al slot del bloque destino|

<a name="_page17_x82.00_y697.92"></a>**CU-04: Compilar y ejecutar un programa**

Al hacer clic en Compilar, CheemScript envía el código C++ al backend. Si la compilación falla, los errores de g++ aparecen en rojo en la consola. Si tiene éxito, el programa comienza a  ejecutarse automáticamente. Para detenerlo en cualquier momento, hacer clic en  el botón Detener (ícono de cuadrado rojo). ![ref2]

<a name="_page18_x82.00_y75.92"></a>**CU-05: Interactuar con el programa durante la ejecución**

Si el programa usa bloques de entrada (preguntar / input), la consola muestra la pregunta y espera. Escribir la respuesta en el campo de texto de la consola y presionar Enter para enviarla al proceso en ejecución. 

<a name="_page18_x82.00_y166.92"></a>**CU-06: Exportar e importar un programa**

- Para guardar: hacer clic en Exportar. Se descargará un archivo .json con el estado completo del programa. 
- Para cargar: hacer clic en Importar y seleccionar el archivo .json previamente guardado. 
- El archivo JSON incluye todos los bloques, su configuración y las variables declaradas. Puede compartirse entre compañeros. 

<a name="_page18_x82.00_y292.92"></a>**CU-07: Rastreo de ejecución (Tracing)**

Al activar el modo de rastreo desde la barra de herramientas, el bloque activo se ilumina con un borde dorado en el lienzo durante la ejecución, mostrando en tiempo real qué instrucción está ejecutándose. Este modo es especialmente útil para comprender el flujo de control de bucles y condicionales. 

<a name="_page18_x82.00_y383.92"></a>***4. Solución de Problemas ![ref2]***



|**Problema**|**Solución**|
| - | - |
|La página no carga en localhost:8080|Verificar que Docker Desktop esté abierto. Ejecutar docker compose up --build en la carpeta del proyecto.|
|El botón Compilar no responde|Verificar que el contenedor del backend esté activo con docker ps en la terminal.|
|Un bloque aparece con borde rojo|El autómata detectó un error de estructura. Revisar los parámetros del bloque y completar todos los campos.|
|La consola muestra errores de g++|Leer el mensaje de error. Suele indicar una variable no declarada, tipo incorrecto o sintaxis inválida.|
|El programa no termina (espera entrada)|Si hay bloques de input, escribir la respuesta en el campo de la consola y presionar Enter.|
|El código C++ no se actualiza|Hacer clic en la pestaña "Código C++" del panel derecho para refrescar la vista.|
|Quiero borrar todo y empezar de nuevo|Hacer clic en el botón Limpiar (ícono de papelera) en la barra de herramientas.|
|El programa fue detenido y quiero relanzarlo![](Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.028.png)|Hacer clic nuevamente en el botón Compilar.|

[ref1]: Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.001.png
[ref2]: Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.004.png
[ref3]: Aspose.Words.03b08701-b570-4f50-b0f5-428506c87ab7.006.png
