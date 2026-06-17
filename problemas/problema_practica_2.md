# Problema de Práctica 2: Administración de Combustible en Cohete Espacial (ACCE)

## Contexto
Durante la fase previa al lanzamiento de un cohete espacial, el sistema de telemetría debe revisar el balance de combustible en una matriz de 2x2 tanques de propelente. El operador calibra los coeficientes de flujo mediante un menú interactivo y verifica las alarmas de presión.

## Requisitos del Programa

1.  **Estructuras de Datos:**
    *   Declarar un arreglo lineal (`arr`) de tipo `double` llamado `tanques_aux` de tamaño `3` inicializado con `{15.5, 30.0, 45.5}`.
    *   Declarar una lista (`list`) llamada `tanques_criticos` inicializada con `{1, 3}`.
    *   Declarar una matriz (`mat`) llamada `matriz_combustible` de tamaño `2`x`2`.
    *   Declarar una variable implícita (`var_new`) llamada `opcion_tanque` inicializada en `0`.

2.  **Entrada del Operador:**
    *   Preguntar al operador (`ask`) `"Ingrese tanque a analizar (1-Primario, 2-Secundario): "` y almacenar en `opcion_tanque`.

3.  **Lógica del Filtro de Tanque (Switch y Matrices):**
    *   Evaluar `opcion_tanque` con un bloque de selección múltiple (`switch`):
        *   `case 1`:
            *   Asignar (`set_var`) a `matriz_combustible[0][0]` el valor `100.0`.
            *   Imprimir por terminal (`print`) `"Tanque primario cargado al 100%."`.
        *   `case 2`:
            *   Asignar (`set_var`) a `matriz_combustible[0][1]` el valor `50.0`.
            *   Imprimir por terminal (`print`) `"Tanque secundario en reserva."`.
        *   `default`:
            *   Imprimir por terminal (`print`) `"Opción de tanque inválida."`.

4.  **Bucle de Compensación de Flujo (Ciclo For):**
    *   Usando un bucle C++ clásico (`for`): `for(int j = 0; j < 3; j++)`
        *   Si `tanques_aux[j] > 20.0` (bloque `if` simple):
            *   Decir (`say`) por `2 segundos`: `"Compensando tanque auxiliar..."`.
            *   Imprimir por consola (`print`) `"Flujo liberado: " + to_string(tanques_aux[j])`.

5.  **Cierre y Espera:**
    *   Esperar (`wait`) `2 segundos` para estabilizar presiones.
    *   Imprimir por consola (`print`) `"Secuencia de tanques calibrada."`.
