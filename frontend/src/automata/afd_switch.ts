export type TokenSwitch = 'switch' | '(' | 'VAR' | ')' | '{' | '}' | 'case' | 'VAL' | ':' | 'default' | 'INSTR';

export type EstadoSwitch =
  | 'q0' | 'q_switch' | 'q_abreParen' | 'q_var' | 'q_cierraParen' | 'q_abreLlave'
  | 'q_case' | 'q_val' | 'q_dosPuntos' | 'q_cuerpoCase'
  | 'q_default' | 'q_dosPuntosDef' | 'q_cuerpoDef'
  | 'q_cierraLlave' | 'qERR';

const ESTADO_MSG: Record<EstadoSwitch, string> = {
  'q0':             'Esperando palabra clave "switch"',
  'q_switch':       'Esperando paréntesis de apertura "("',
  'q_abreParen':    'Esperando variable a evaluar',
  'q_var':          'Esperando paréntesis de cierre ")"',
  'q_cierraParen':  'Esperando llave de apertura "{"',
  'q_abreLlave':    'Esperando "case", "default" o llave de cierre "}"',
  'q_case':         'Esperando valor para el caso',
  'q_val':          'Esperando dos puntos ":"',
  'q_dosPuntos':    'Procesando cuerpo del caso (instrucciones) o esperando nuevo caso/default/"}"',
  'q_cuerpoCase':   'Procesando cuerpo del caso (instrucciones) o esperando nuevo caso/default/"}"',
  'q_default':      'Esperando dos puntos ":" para default',
  'q_dosPuntosDef': 'Procesando cuerpo de default (instrucciones) o llave de cierre "}"',
  'q_cuerpoDef':    'Procesando cuerpo de default (instrucciones) o llave de cierre "}"',
  'q_cierraLlave':  'Bloque switch válido',
  'qERR':           'Error de estructura: token inesperado',
};

export interface AfdSwitchResult {
  valid: boolean;
  estadoFinal: EstadoSwitch;
  mensaje: string;
  tokenError?: TokenSwitch;
  posError?: number;
}

export function afd_switch(tokens: TokenSwitch[]): AfdSwitchResult {
  let estado: EstadoSwitch = 'q0';

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const estadoPrevio = estado;

    switch (estado) {
      case 'q0':
        estado = token === 'switch' ? 'q_switch' : 'qERR';
        break;

      case 'q_switch':
        estado = token === '(' ? 'q_abreParen' : 'qERR';
        break;

      case 'q_abreParen':
        estado = token === 'VAR' ? 'q_var' : 'qERR';
        break;

      case 'q_var':
        estado = token === ')' ? 'q_cierraParen' : 'qERR';
        break;

      case 'q_cierraParen':
        estado = token === '{' ? 'q_abreLlave' : 'qERR';
        break;

      case 'q_abreLlave':
        if      (token === 'case')    estado = 'q_case';
        else if (token === 'default') estado = 'q_default';
        else if (token === '}')       estado = 'q_cierraLlave';
        else                          estado = 'qERR';
        break;

      case 'q_case':
        estado = token === 'VAL' ? 'q_val' : 'qERR';
        break;

      case 'q_val':
        estado = token === ':' ? 'q_dosPuntos' : 'qERR';
        break;

      case 'q_dosPuntos':
        if      (token === 'INSTR')   estado = 'q_cuerpoCase';
        else if (token === 'case')    estado = 'q_case';
        else if (token === 'default') estado = 'q_default';
        else if (token === '}')       estado = 'q_cierraLlave';
        else                          estado = 'qERR';
        break;

      case 'q_cuerpoCase':
        if      (token === 'INSTR')   estado = 'q_cuerpoCase';
        else if (token === 'case')    estado = 'q_case';
        else if (token === 'default') estado = 'q_default';
        else if (token === '}')       estado = 'q_cierraLlave';
        else                          estado = 'qERR';
        break;

      case 'q_default':
        estado = token === ':' ? 'q_dosPuntosDef' : 'qERR';
        break;

      case 'q_dosPuntosDef':
        if      (token === 'INSTR')   estado = 'q_cuerpoDef';
        else if (token === '}')       estado = 'q_cierraLlave';
        else                          estado = 'qERR';
        break;

      case 'q_cuerpoDef':
        if      (token === 'INSTR')   estado = 'q_cuerpoDef';
        else if (token === '}')       estado = 'q_cierraLlave';
        else                          estado = 'qERR';
        break;

      case 'q_cierraLlave':
        estado = 'qERR'; // Nada puede ir después de cerrar el switch
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

  const esValido = estado === 'q_cierraLlave';

  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? ESTADO_MSG[estado] : `Estructura incompleta: ${ESTADO_MSG[estado]}`,
  };
}
