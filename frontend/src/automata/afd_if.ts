export type TokenIf = 'if' | 'else' | '(' | ')' | '{' | '}' | 'EXPR' | 'INSTR';

export type EstadoIf =
  | 'q0' | 'q_if'
  | 'q_abreParen'  | 'q_cond'  | 'q_cierraParen'
  | 'q_abreLlave'  | 'q_cuerpo'  | 'q_cierraLlave'
  | 'q_else' | 'q_elseif'
  | 'q_abreParen2' | 'q_cond2' | 'q_cierraParen2'
  | 'q_abreLlave2' | 'q_cuerpo2' | 'q_cierraLlave2'
  | 'q_abreLlaveF' | 'q_cuerpoF' | 'q_fin'
  | 'qERR';

// Mensajes descriptivos para cada estado del automata
const ESTADO_MSG: Record<EstadoIf, string> = {
  'q0':              'Esperando palabra clave "if"',
  'q_if':            'Esperando parentesis de apertura "("',
  'q_abreParen':     'Esperando expresion de condicion',
  'q_cond':          'Esperando parentesis de cierre ")"',
  'q_cierraParen':   'Esperando llave de apertura "{"',
  'q_abreLlave':     'Esperando instrucciones o llave de cierre "}"',
  'q_cuerpo':        'Procesando instrucciones del cuerpo if',
  'q_cierraLlave':   'Bloque if valido',
  'q_else':          'Esperando "if" o llave de apertura "{"',
  'q_elseif':        'Esperando parentesis de apertura "("',
  'q_abreParen2':    'Esperando expresion de condicion (else if)',
  'q_cond2':         'Esperando parentesis de cierre ")" (else if)',
  'q_cierraParen2':  'Esperando llave de apertura "{" (else if)',
  'q_abreLlave2':    'Esperando instrucciones o llave de cierre "}" (else if)',
  'q_cuerpo2':       'Procesando instrucciones del cuerpo else if',
  'q_cierraLlave2':  'Bloque else if valido',
  'q_abreLlaveF':    'Esperando instrucciones o llave de cierre "}" (else)',
  'q_cuerpoF':       'Procesando instrucciones del cuerpo else',
  'q_fin':           'Bloque if/else completo y valido',
  'qERR':            'Error de estructura: token inesperado',
};

export interface AfdIfResult {
  valid: boolean;
  estadoFinal: EstadoIf;
  mensaje: string;
  // Token y posicion donde fallo (si fallo)
  tokenError?: TokenIf;
  posError?: number;
}

/**
 * Valida la estructura del bloque IF mediante un Automata Finito Determinista (AFD).
 * Devuelve informacion detallada del resultado incluyendo estado final y mensaje.
 */
export function afd_if(tokens: TokenIf[]): AfdIfResult {
  let estado: EstadoIf = 'q0';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const estadoPrevio = estado;

    switch (estado) {
      case 'q0':
        estado = token === 'if' ? 'q_if' : 'qERR';
        break;

      case 'q_if':
        estado = token === '(' ? 'q_abreParen' : 'qERR';
        break;

      case 'q_abreParen':
        estado = token === 'EXPR' ? 'q_cond' : 'qERR';
        break;

      case 'q_cond':
        estado = token === ')' ? 'q_cierraParen' : 'qERR';
        break;

      case 'q_cierraParen':
        estado = token === '{' ? 'q_abreLlave' : 'qERR';
        break;

      case 'q_abreLlave':
        if      (token === 'INSTR') estado = 'q_cuerpo';
        else if (token === '}')     estado = 'q_cierraLlave';
        else                        estado = 'qERR';
        break;

      case 'q_cuerpo':
        if      (token === 'INSTR') estado = 'q_cuerpo';
        else if (token === '}')     estado = 'q_cierraLlave';
        else                        estado = 'qERR';
        break;

      case 'q_cierraLlave':
        if      (token === 'else')  estado = 'q_else';
        else                        estado = 'qERR';
        break;

      case 'q_else':
        if      (token === 'if')    estado = 'q_elseif';
        else if (token === '{')     estado = 'q_abreLlaveF';
        else                        estado = 'qERR';
        break;

      case 'q_elseif':
        estado = token === '(' ? 'q_abreParen2' : 'qERR';
        break;

      case 'q_abreParen2':
        estado = token === 'EXPR' ? 'q_cond2' : 'qERR';
        break;

      case 'q_cond2':
        estado = token === ')' ? 'q_cierraParen2' : 'qERR';
        break;

      case 'q_cierraParen2':
        estado = token === '{' ? 'q_abreLlave2' : 'qERR';
        break;

      case 'q_abreLlave2':
        if      (token === 'INSTR') estado = 'q_cuerpo2';
        else if (token === '}')     estado = 'q_cierraLlave2';
        else                        estado = 'qERR';
        break;

      case 'q_cuerpo2':
        if      (token === 'INSTR') estado = 'q_cuerpo2';
        else if (token === '}')     estado = 'q_cierraLlave2';
        else                        estado = 'qERR';
        break;

      case 'q_cierraLlave2':
        if      (token === 'else')  estado = 'q_else';
        else                        estado = 'qERR';
        break;

      case 'q_abreLlaveF':
        if      (token === 'INSTR') estado = 'q_cuerpoF';
        else if (token === '}')     estado = 'q_fin';
        else                        estado = 'qERR';
        break;

      case 'q_cuerpoF':
        if      (token === 'INSTR') estado = 'q_cuerpoF';
        else if (token === '}')     estado = 'q_fin';
        else                        estado = 'qERR';
        break;
    }

    if (estado === 'qERR') {
      return {
        valid: false,
        estadoFinal: 'qERR',
        mensaje: `Error en estado ${estadoPrevio}: token "${token}" inesperado. ${ESTADO_MSG[estadoPrevio]}`,
        tokenError: token,
        posError: i,
      };
    }
  }

  const esValido = estado === 'q_cierraLlave' 
      || estado === 'q_cierraLlave2'
      || estado === 'q_fin';

  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? ESTADO_MSG[estado] : `Estructura incompleta en estado "${estado}": ${ESTADO_MSG[estado]}`,
  };
}
