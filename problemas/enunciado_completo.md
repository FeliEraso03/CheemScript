# Enunciado Técnico: Sistema de Control del Reactor Químico Cheemical (SCRQC)

## Contexto
En un reactor químico de alta presión y temperatura se requiere un sistema de control automatizado para simular lecturas de sensores, validar los límites de calibración y permitir intervenciones manuales del operador. 

El programa debe implementar la lógica completa del reactor utilizando todos los bloques del lenguaje CheemScript sin excepción.

## Requisitos de Programación

1.  **Declaraciones de Estructuras (Avanzadas y Básicas):**
    *   Declarar un arreglo C++ lineal (`arr`) llamado `coeficientes` de tipo `double` y tamaño `3` inicializado con `{1.2, 2.4, 3.6}`.
    *   Declarar una matriz (`mat`) llamada `sensores` de tamaño `2`x`2`.
    *   Declarar una lista CheemScript (`list`) llamada `alertas` inicializada con los valores `{101, 102}`.
    *   Declarar una variable tipada C++ (`var`) llamada `lecturas` de tipo `int` inicializada en `0`.
    *   Declarar una variable implícita CheemScript (`var_new`) llamada `opcion` inicializada en `0`.
    *   Declarar una variable implícita CheemScript (`var_new`) llamada `presion` inicializada en `0.0`.

2.  **Entrada del Operador:**
    *   Preguntar al operador `"Seleccione modo (1-Simular, 2-Calibrar, 3-Inspección): "` usando el bloque `ask` y almacenar el resultado en la variable `opcion`.

3.  **Lógica del Diagnóstico (Condicionales y Selección):**
    *   Si `opcion == 1` (bloque `if` con rama principal y rama `else`):
        *   Mostrar una alerta en burbuja de voz (`say`) durante `3 segundos` con el texto `"Iniciando simulacion termica..."`.
        *   Generar un número decimal aleatorio (`random`) en el rango de `0.0` a `5.0` con `2` decimales y guardarlo en `presion`.
        *   Asignar (`set_var`) el valor de `presion` a la celda `sensores[0][0]`.
        *   Mostrar en la pantalla (`show_var`) el valor de la variable `presion`.
        *   Evaluar `opcion` con un bloque de selección múltiple (`switch`):
            *   `case 1`: Imprimir por consola (`print`) el mensaje `"Modo automático activo."`.
            *   `default`: Imprimir por consola (`print`) el mensaje `"Modo estándar."`.
    *   Sino (`else`):
        *   Imprimir por consola (`print`) `"Modo alternativo seleccionado."`.

4.  **Bucle de Retardo y Estabilización (Tiempo y Ciclos):**
    *   Repetir (`repeat`) `3` veces usando el iterador `i`:
        *   Esperar (`wait`) `1 segundo` para estabilizar el hardware.
    *   Repetir hasta que (`repeatUntil`) la condición `lecturas == 3` sea verdadera:
        *   Incrementar (`change_var`) la variable `lecturas` en `1` unidad.

5.  **Ciclos de Avanzada y Telemetría (C++):**
    *   Usando un bucle clásico C++ (`for`): `for(int k = 0; k < 3; k++)`
        *   Imprimir por consola (`print`) la cadena `"Coeficiente: "` concatenada con `to_string(coeficientes[k])`.
    *   Usando un bucle condicional C++ (`while`): `while(lecturas > 0)`
        *   Esperar (`sleep`) `100` milisegundos.
        *   Decrementar (`change_var`) `lecturas` en `-1` unidad.

6.  **Intervención de Emergencia:**
    *   Imprimir por consola (`print`) `"Ingrese lectura manual de presion: "`.
    *   Leer del teclado (`input`) la nueva lectura y almacenarla directamente en la variable `presion`.
    *   Imprimir final `"Simulacion del reactor finalizada."`.
