// =============================================================================
// AFD para validación del argumento del bloque print — CheemScript
//
// Contiene 4 autómatas + lexer liviano:
//   AFD 1 — afd_string:  cadena literal entre comillas dobles
//   AFD 2 — afd_id:      identificador válido (variable)
//   AFD 3 — afd_num:     número entero o decimal
//   AFD 4 — afd_print:   expresión de concatenación  ATOM ('+' ATOM)*
// =============================================================================

// ---------------------------------------------------------------------------
// Tipos compartidos
// ---------------------------------------------------------------------------

export type TokenPrint = 'STRING' | 'ID' | 'NUM' | '+';

export type EstadoPrint = 'p0' | 'p_atom' | 'p_plus' | 'pERR';

const ESTADO_PRINT_MSG: Record<EstadoPrint, string> = {
  'p0':     'Esperando valor (cadena, variable o número)',
  'p_atom': 'Expresión válida',
  'p_plus': 'Esperando valor después del operador "+"',
  'pERR':   'Token inesperado en la expresión',
};

export interface AfdPrintResult {
  valid: boolean;
  estadoFinal: EstadoPrint;
  mensaje: string;
  tokenError?: string;
  posError?: number;
}

// ---------------------------------------------------------------------------
// AFD 1 — Cadena literal entre comillas dobles
// ---------------------------------------------------------------------------

type TokenStr =
  | { tipo: 'COMILLA' }
  | { tipo: 'CHAR'; valor: string }
  | { tipo: 'BARRA' }
  | { tipo: 'ESC_SEQ'; valor: string };

type EstadoStr = 's0' | 's_dentro' | 's_escape' | 's_cerrada' | 'sERR';

/**
 * Tokeniza los caracteres internos de un posible string literal
 * y los convierte en tokens para el AFD de cadenas.
 */
function tokenizeString(raw: string): TokenStr[] {
  const tokens: TokenStr[] = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '"') {
      tokens.push({ tipo: 'COMILLA' });
    } else if (c === '\\') {
      // Mirar el siguiente carácter para ver si es un escape válido
      const next = raw[i + 1];
      if (next && 'nt\\\\"r0'.includes(next)) {
        tokens.push({ tipo: 'ESC_SEQ', valor: '\\' + next });
        i++; // saltar el carácter escapado
      } else {
        tokens.push({ tipo: 'BARRA' });
      }
    } else {
      tokens.push({ tipo: 'CHAR', valor: c });
    }
  }
  return tokens;
}

/**
 * AFD que valida un lexema de cadena literal entre comillas dobles.
 * Acepta: "hola", "", "con \\n escape"
 * Rechaza: comillas sin cerrar, escape incompleto
 */
export function afd_string(raw: string): boolean {
  const tokens = tokenizeString(raw);
  let estado: EstadoStr = 's0';

  for (const t of tokens) {
    switch (estado) {
      case 's0':
        estado = t.tipo === 'COMILLA' ? 's_dentro' : 'sERR';
        break;

      case 's_dentro':
        if      (t.tipo === 'COMILLA')  estado = 's_cerrada';
        else if (t.tipo === 'CHAR')     estado = 's_dentro';
        else if (t.tipo === 'BARRA')    estado = 's_escape';
        else if (t.tipo === 'ESC_SEQ')  estado = 's_dentro';
        else                            estado = 'sERR';
        break;

      case 's_escape':
        estado = t.tipo === 'ESC_SEQ' ? 's_dentro' : 'sERR';
        break;

      case 's_cerrada':
        estado = 'sERR'; // nada puede venir después de la comilla de cierre
        break;

      case 'sERR':
        return false;
    }
  }

  return estado === 's_cerrada';
}

// ---------------------------------------------------------------------------
// AFD 2 — Identificador (variable)
// ---------------------------------------------------------------------------

type TokenId = { tipo: 'LETRA' } | { tipo: 'DIGITO' } | { tipo: 'BRACKET_A' } | { tipo: 'BRACKET_C' } | { tipo: 'OTRO' };
type EstadoId = 'i0' | 'i_id' | 'i_bracket_a' | 'i_idx' | 'i_bracket_c' | 'iERR';

function tokenizeId(raw: string): TokenId[] {
  return Array.from(raw).map(c => {
    if (/[a-zA-Z_]/.test(c)) return { tipo: 'LETRA' as const };
    if (/[0-9]/.test(c))     return { tipo: 'DIGITO' as const };
    if (c === '[')           return { tipo: 'BRACKET_A' as const };
    if (c === ']')           return { tipo: 'BRACKET_C' as const };
    return { tipo: 'OTRO' as const };
  });
}

/**
 * AFD que valida un identificador o acceso a arreglo: letra (letra | dígito | _)* ('[' (letra | dígito)+ ']')?
 */
export function afd_id(raw: string): boolean {
  if (raw.length === 0) return false;
  const tokens = tokenizeId(raw);
  let estado: EstadoId = 'i0';

  for (const t of tokens) {
    switch (estado) {
      case 'i0':
        estado = t.tipo === 'LETRA' ? 'i_id' : 'iERR';
        break;
      case 'i_id':
        if (t.tipo === 'LETRA' || t.tipo === 'DIGITO') estado = 'i_id';
        else if (t.tipo === 'BRACKET_A') estado = 'i_bracket_a';
        else estado = 'iERR';
        break;
      case 'i_bracket_a':
        estado = (t.tipo === 'LETRA' || t.tipo === 'DIGITO') ? 'i_idx' : 'iERR';
        break;
      case 'i_idx':
        if (t.tipo === 'LETRA' || t.tipo === 'DIGITO') estado = 'i_idx';
        else if (t.tipo === 'BRACKET_C') estado = 'i_bracket_c';
        else estado = 'iERR';
        break;
      case 'i_bracket_c':
        estado = 'iERR'; // no se permite nada despues de cerrar corchete
        break;
      case 'iERR':
        return false;
    }
  }

  return estado === 'i_id' || estado === 'i_bracket_c';
}

// ---------------------------------------------------------------------------
// AFD 3 — Número literal (entero o decimal)
// ---------------------------------------------------------------------------

type TokenNum = { tipo: 'DIGITO' } | { tipo: 'PUNTO' };
type EstadoNum = 'n0' | 'n_entero' | 'n_punto' | 'n_decimal' | 'nERR';

function tokenizeNum(raw: string): TokenNum[] | null {
  const tokens: TokenNum[] = [];
  for (const c of raw) {
    if (/[0-9]/.test(c))   tokens.push({ tipo: 'DIGITO' });
    else if (c === '.')    tokens.push({ tipo: 'PUNTO' });
    else                   return null; // carácter inválido
  }
  return tokens;
}

/**
 * AFD que valida un número: enteros (42) y decimales (3.14).
 * Rechaza: punto colgante (3.), solo punto (.), vacío.
 */
export function afd_num(raw: string): boolean {
  if (raw.length === 0) return false;
  const tokens = tokenizeNum(raw);
  if (tokens === null) return false;

  let estado: EstadoNum = 'n0';

  for (const t of tokens) {
    switch (estado) {
      case 'n0':
        estado = t.tipo === 'DIGITO' ? 'n_entero' : 'nERR';
        break;
      case 'n_entero':
        if      (t.tipo === 'DIGITO') estado = 'n_entero';
        else if (t.tipo === 'PUNTO')  estado = 'n_punto';
        else                          estado = 'nERR';
        break;
      case 'n_punto':
        estado = t.tipo === 'DIGITO' ? 'n_decimal' : 'nERR';
        break;
      case 'n_decimal':
        estado = t.tipo === 'DIGITO' ? 'n_decimal' : 'nERR';
        break;
      case 'nERR':
        return false;
    }
  }

  return estado === 'n_entero' || estado === 'n_decimal';
}

// ---------------------------------------------------------------------------
// AFD 4 — Argumento del print (expresión de concatenación)
// ---------------------------------------------------------------------------

const ATOMS: TokenPrint[] = ['STRING', 'ID', 'NUM'];

/**
 * AFD que valida la estructura de la expresión completa del print:
 *   ATOM ('+' ATOM)*
 * donde ATOM es STRING | ID | NUM (ya validados individualmente).
 */
export function afd_print(tokens: TokenPrint[]): AfdPrintResult {
  if (tokens.length === 0) {
    return {
      valid: false,
      estadoFinal: 'p0',
      mensaje: 'Campo vacío. Escribe un valor (ej: "hola" o variable)',
    };
  }

  let estado: EstadoPrint = 'p0';

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const estadoPrevio = estado;

    switch (estado) {
      case 'p0':
        if (!ATOMS.includes(t)) {
          return { valid: false, estadoFinal: 'pERR', mensaje: `Error en token "${t}": ${ESTADO_PRINT_MSG[estadoPrevio]}`, tokenError: t, posError: i };
        }
        estado = 'p_atom';
        break;
      case 'p_atom':
        if (t !== '+') {
          return { valid: false, estadoFinal: 'pERR', mensaje: `Error en token "${t}": ${ESTADO_PRINT_MSG[estadoPrevio]}`, tokenError: t, posError: i };
        }
        estado = 'p_plus';
        break;
      case 'p_plus':
        if (!ATOMS.includes(t)) {
          return { valid: false, estadoFinal: 'pERR', mensaje: `Error en token "${t}": ${ESTADO_PRINT_MSG[estadoPrevio]}`, tokenError: t, posError: i };
        }
        estado = 'p_atom';
        break;
    }
  }

  const esValido = estado === 'p_atom';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido
      ? ESTADO_PRINT_MSG[estado]
      : `Incompleta: ${ESTADO_PRINT_MSG[estado]}`,
  };
}

// ---------------------------------------------------------------------------
// Lexer liviano — tokeniza el string crudo del input en tokens de alto nivel
// ---------------------------------------------------------------------------

export interface LexPrintResult {
  valid: boolean;
  tokens: TokenPrint[];
  /** Fragmentos crudos de cada átomo (para el generador de código) */
  rawParts: string[];
  errorMsg?: string;
}

/**
 * Tokeniza el valor del campo print en tokens de alto nivel.
 * También extrae los fragmentos crudos para la generación de código.
 */
export function lexPrintValue(raw: string): LexPrintResult {
  const tokens: TokenPrint[] = [];
  const rawParts: string[] = [];
  let i = 0;

  while (i < raw.length) {
    // Espacios: ignorar
    if (raw[i] === ' ' || raw[i] === '\t') { i++; continue; }

    // Operador de concatenación
    if (raw[i] === '+') {
      tokens.push('+');
      rawParts.push('+');
      i++;
      continue;
    }

    // Cadena literal
    if (raw[i] === '"') {
      let j = i + 1;
      while (j < raw.length && raw[j] !== '"') {
        if (raw[j] === '\\') j++; // saltar carácter escapado
        j++;
      }
      if (j >= raw.length) {
        return { valid: false, tokens, rawParts, errorMsg: 'Cadena sin cerrar (falta comilla de cierre)' };
      }
      const fragment = raw.substring(i, j + 1);
      // Validar con afd_string
      if (!afd_string(fragment)) {
        return { valid: false, tokens, rawParts, errorMsg: `Cadena inválida: ${fragment}` };
      }
      tokens.push('STRING');
      rawParts.push(fragment);
      i = j + 1;
      continue;
    }

    // Número
    if (/[0-9]/.test(raw[i])) {
      let j = i;
      while (j < raw.length && /[0-9.]/.test(raw[j])) j++;
      const fragment = raw.substring(i, j);
      if (!afd_num(fragment)) {
        return { valid: false, tokens, rawParts, errorMsg: `Número inválido: ${fragment}` };
      }
      tokens.push('NUM');
      rawParts.push(fragment);
      i = j;
      continue;
    }

    // Identificador
    if (/[a-zA-Z_]/.test(raw[i])) {
      let j = i;
      while (j < raw.length && /[a-zA-Z0-9_]/.test(raw[j])) j++;
      
      // Permitir acceso a arreglos
      if (j < raw.length && raw[j] === '[') {
        j++;
        while (j < raw.length && raw[j] !== ']') j++;
        if (j < raw.length && raw[j] === ']') j++;
      }
      
      // Permitir llamadas a funciones
      let isFunc = false;
      if (j < raw.length && raw[j] === '(') {
        isFunc = true;
        j++;
        let p = 1;
        while (j < raw.length && p > 0) {
          if (raw[j] === '(') p++;
          else if (raw[j] === ')') p--;
          j++;
        }
      }
      
      const fragment = raw.substring(i, j);
      if (!isFunc && !afd_id(fragment)) {
        return { valid: false, tokens, rawParts, errorMsg: `Identificador inválido: ${fragment}` };
      }
      tokens.push('ID');
      rawParts.push(fragment);
      i = j;
      continue;
    }

    // Carácter desconocido
    return {
      valid: false,
      tokens,
      rawParts,
      errorMsg: `Carácter inesperado: "${raw[i]}" en posición ${i + 1}`,
    };
  }

  return { valid: true, tokens, rawParts };
}

// ---------------------------------------------------------------------------
// Punto de entrada — validarPrintValue
// ---------------------------------------------------------------------------

export interface ValidacionPrint {
  valid: boolean;
  mensaje: string;
  estadoFinal?: EstadoPrint;
}

/**
 * Punto de entrada principal: valida el valor completo que va en el print.
 * Combina el lexer liviano + AFD de expresión de concatenación.
 */
export function validarPrintValue(raw: string): ValidacionPrint {
  if (raw.trim() === '') {
    return { valid: false, mensaje: 'Campo vacío' };
  }

  // Fase 1: Lexer
  const lexResult = lexPrintValue(raw);
  if (!lexResult.valid) {
    return {
      valid: false,
      mensaje: lexResult.errorMsg ?? 'Error léxico desconocido',
    };
  }

  // Fase 2: AFD de expresión
  const afdResult = afd_print(lexResult.tokens);
  return {
    valid: afdResult.valid,
    mensaje: afdResult.mensaje,
    estadoFinal: afdResult.estadoFinal,
  };
}

// ---------------------------------------------------------------------------
// Utilidad para generación de código — transforma concatenación a C++
// ---------------------------------------------------------------------------

/**
 * Convierte el valor del print al formato C++ para cout.
 * - Cadena simple o variable: se deja tal cual
 * - Concatenación con +: se reemplaza + por <<
 * 
 * Ejemplo: "hola " + nombre + "!"  →  "hola " << nombre << "!"
 */
export function printValueToCpp(raw: string): string {
  const lexResult = lexPrintValue(raw);
  if (!lexResult.valid || lexResult.rawParts.length === 0) {
    return raw; // fallback: devolver tal cual
  }

  // Filtrar los '+' y unir los átomos con <<
  const atoms = lexResult.rawParts.filter(p => p !== '+');
  return atoms.join(' << ');
}
