export type EstadoCmp = 'q0' | 'q_id1' | 'q_esp1' | 'q_op1' | 'q_op2' | 'q_esp2' | 'q_val' | 'qERR';

const ESTADO_EXPR_MSG: Record<EstadoCmp, string> = {
  'q0':     'Esperando identificador (ej: x, contador)',
  'q_id1':  'Leyendo identificador... falta operador',
  'q_esp1': 'Esperando operador de comparacion (<, >, ==, !=)',
  'q_op1':  'Leyendo operador... falta valor',
  'q_op2':  'Operador leido. Esperando espacio y valor',
  'q_esp2': 'Esperando valor a comparar (ej: 10, limite)',
  'q_val':  'Expresion valida',
  'qERR':   'Caracter no esperado',
};

export interface AfdExprResult {
  valid: boolean;
  estadoFinal: EstadoCmp;
  mensaje: string;
  posError?: number;
}

/**
 * AFD4: Valida expresiones de comparacion simples (ej. `i < 10`, `x == 0`).
 * Formato aceptado: identificador op (identificador | numero)
 */
export function afd4_comparacion(entrada: string): AfdExprResult {
  if (entrada.trim().length === 0) {
    return {
      valid: false,
      estadoFinal: 'q0',
      mensaje: 'Campo vacio. Escribe una condicion (ej: x > 0)',
    };
  }

  let estado: EstadoCmp = 'q0';

  for (let i = 0; i < entrada.length; i++) {
    const c = entrada[i];
    const esLetra  = /[a-zA-Z_]/.test(c);
    const esDigito = /[0-9]/.test(c);
    const esEsp    = c === ' ';
    const esOp     = /[<>!=]/.test(c);
    const estadoPrevio = estado;

    switch (estado) {
      case 'q0':    
        estado = esLetra ? 'q_id1' : 'qERR'; 
        break;
      
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
        else if (esLetra || esDigito) estado = 'q_val';
        else                     estado = 'qERR';
        break;
      
      case 'q_val':
        if (!esLetra && !esDigito) estado = 'qERR';
        break;
    }

    if (estado === 'qERR') {
      return {
        valid: false,
        estadoFinal: 'qERR',
        mensaje: `Error en pos ${i + 1}: "${c}" inesperado. ${ESTADO_EXPR_MSG[estadoPrevio]}`,
        posError: i,
      };
    }
  }

  const esValido = estado === 'q_val';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? 'Expresion valida' : `Incompleta: ${ESTADO_EXPR_MSG[estado]}`,
  };
}
