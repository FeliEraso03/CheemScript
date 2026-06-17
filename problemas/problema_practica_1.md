# Problema de Práctica 1: Sistema de Riego Automatizado en Invernadero (SRAI)

## Contexto
Se requiere programar un controlador automatizado en CheemScript para monitorear la humedad del suelo de un invernadero hidropónico. El sistema debe comprobar la humedad a intervalos definidos, emitir advertencias interactivas si el suelo está seco, y activar la válvula de riego simulando pulsos eléctricos.

## Requisitos del Programa

1.  **Variables Iniciales:**
    *   Crear una variable (`var_new`) llamada `humedad` inicializada en `0`.
    *   Crear una variable (`var_new`) llamada `valvula_abierta` inicializada en `false`.
    *   Crear una variable tipada (`var`) llamada `ciclos_restantes` de tipo `int` inicializada en `3`.

2.  **Monitoreo y Lectura:**
    *   Generar un número entero aleatorio (`random`) entre `10` y `90` y guardarlo en la variable `humedad` para simular la telemetría del sensor higrómetro.
    *   Mostrar en pantalla (`show_var`) el valor obtenido de `humedad`.

3.  **Lógica del Regador (Condicionales):**
    *   Si `humedad < 40`:
        *   Establecer (`set_var`) `valvula_abierta` en `true`.
        *   Decir (`say`) por `3 segundos`: `"Humedad baja detectada. Abriendo válvula de riego..."`.
        *   **Secuencia de Pulsos de Riego (Ciclo):** Repetir (`repeat`) `3` veces usando el iterador `k`:
            *   Imprimir por consola (`print`) `"Emitiendo pulso de irrigación..."`.
            *   Esperar (`wait`) `2 segundos` entre pulso y pulso.
    *   Sino (`else`):
        *   Decir (`say`) por `2 segundos`: `"Nivel de humedad óptimo. Válvula cerrada."`.

4.  **Bucle de Inspección de Seguridad (Ciclo C++):**
    *   Usando un bucle C++ (`while`), mientras `ciclos_restantes > 0`:
        *   Imprimir por consola (`print`) `"Inspección del sensor activa. Ciclos restantes: " + to_string(ciclos_restantes)`.
        *   Esperar (`sleep`) `200` milisegundos.
        *   Decrementar (`change_var`) `ciclos_restantes` en `-1`.

5.  **Cierre:**
    *   Imprimir por terminal (`print`) `"Monitoreo completado con éxito."`.
