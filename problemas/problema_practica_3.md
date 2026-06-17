# Problema de Práctica 3: Diagnóstico de Estabilidad del Servidor CheemServer (DESC)

## Contexto
En el centro de datos de Cheems se requiere realizar pruebas de estrés periódicas sobre el rendimiento de la CPU del servidor web principal. El programa debe monitorear el estado del procesador de forma iterativa, simular la presencia de picos de carga aleatorios y solicitar aprobación manual de reinicio al administrador del sistema.

## Requisitos del Programa

1.  **Variables del Servidor:**
    *   Crear una variable (`var_new`) llamada `carga_cpu` inicializada en `0.0`.
    *   Crear una variable tipada (`var`) llamada `fallos_consecutivos` de tipo `int` inicializada en `0`.
    *   Crear una variable (`var_new`) llamada `respuesta_admin` inicializada en `""`.

2.  **Bucle de Estabilidad (Repeat Until):**
    *   Repetir la secuencia hasta que (`repeatUntil`) la condición `fallos_consecutivos == 5` sea verdadera:
        *   Generar un decimal aleatorio (`random`) entre `30.0` y `95.0` con `2` decimales y guardarlo en `carga_cpu`.
        *   Mostrar en pantalla (`show_var`) el porcentaje de `carga_cpu`.
        *   Si `carga_cpu > 80.0` (bloque `if` con rama principal y rama `else`):
            *   Incrementar (`change_var`) `fallos_consecutivos` en `1` unidad.
            *   Decir (`say`) por `1 segundo`: `"¡Alerta! Temperatura y carga elevadas."`.
        *   Sino (`else`):
            *   Establecer (`set_var`) `fallos_consecutivos` en `0` (reinicio de fallos tras lectura estable).
        *   Pausar la telemetría esperando (`sleep`) `150` milisegundos.

3.  **Confirmación Operativa (Entrada y Consola):**
    *   Imprimir por consola (`print`) `"Alarma de sobrecarga activada. Ingrese 'OK' para reiniciar servidor: "`.
    *   Leer del teclado (`input`) el comando y almacenarlo directamente en `respuesta_admin`.
    *   Si `respuesta_admin == "OK"` (condicional `if` simple):
        *   Decir (`say`) por `3 segundos`: `"Reiniciando servidor. Espere un momento..."`.
        *   Esperar (`wait`) `2 segundos` para estabilizar el sistema.

4.  **Cierre:**
    *   Imprimir por terminal (`print`) `"Diagnóstico del servidor finalizado."`.
