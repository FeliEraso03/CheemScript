import { afd_string, afd_id } from './afd_print';
import { validarExpr } from './dpda_expr';
import { tokenizeExpr } from './lexer_expr';

export type InferredType = 'int' | 'double' | 'bool' | 'string' | 'char' | 'unknown';
export type TipoExplicito = 'int' | 'float' | 'double' | 'char' | 'bool' | 'string';

const RESERVED_CPP = new Set([
  'int','float','double','char','bool','string','void','return',
  'if','else','for','while','do','switch','case','break','continue',
  'default','goto','sizeof','typedef','struct','union','enum',
  'true','false','nullptr','null','class','namespace','template',
  'cout','cin','endl','auto','const','static','extern','register',
  'volatile','signed','unsigned','short','long',
]);

// ── Tokenizador de caracteres ─────────────────────────────────────────────────

type TipoCharToken =
  | 'DIGITO'
  | 'SIGNO'
  | 'PUNTO'
  | 'COMILLA_D'
  | 'COMILLA_S'
  | 'BARRA'
  | 'LETRA'
  | 'CHAR';

interface CharToken { tipo: TipoCharToken; valor: string; }

function tokenizarChars(raw: string): CharToken[] {
  return raw.split('').map(c => {
    if (c >= '0' && c <= '9') return { tipo: 'DIGITO', valor: c };
    if (c === '+' || c === '-') return { tipo: 'SIGNO', valor: c };
    if (c === '.') return { tipo: 'PUNTO', valor: c };
    if (c === '"') return { tipo: 'COMILLA_D', valor: c };
    if (c === "'") return { tipo: 'COMILLA_S', valor: c };
    if (c === '\\') return { tipo: 'BARRA', valor: c };
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_')
      return { tipo: 'LETRA', valor: c };
    return { tipo: 'CHAR', valor: c };
  });
}

// ── Estados y Mensajes de los Sub-AFDs ────────────────────────────────────────

export interface AfdVarResult<T> {
  valid: boolean;
  estadoFinal: T;
  mensaje: string;
}

type EstadoEntero = 'e0' | 'e_signo' | 'e_digito' | 'eERR';
const MSG_ENTERO: Record<EstadoEntero, string> = {
  'e0':       'Esperando dígito o signo (+/-)',
  'e_signo':  'Esperando dígito después del signo',
  'e_digito': 'Número entero válido',
  'eERR':     'Carácter inesperado (solo se permiten dígitos o signo al inicio)',
};

type EstadoDouble = 'd0' | 'd_signo' | 'd_entero' | 'd_punto' | 'd_decimal' | 'dERR';
const MSG_DOUBLE: Record<EstadoDouble, string> = {
  'd0':        'Esperando dígito o signo (+/-)',
  'd_signo':   'Esperando dígito después del signo',
  'd_entero':  'Esperando punto decimal "." para real',
  'd_punto':   'Esperando dígito decimal después del punto',
  'd_decimal': 'Número real/decimal válido',
  'dERR':      'Estructura decimal incorrecta',
};

type EstadoBool =
  | 'b0'
  | 'bt1' | 'bt2' | 'bt3'
  | 'bf1' | 'bf2' | 'bf3' | 'bf4'
  | 'b_ok' | 'bERR';
const MSG_BOOL: Record<EstadoBool, string> = {
  'b0':   'Esperando letra "t" o "f"',
  'bt1':  'Esperando letra "r" para secuencia "true"',
  'bt2':  'Esperando letra "u" para secuencia "true"',
  'bt3':  'Esperando letra "e" para secuencia "true"',
  'bf1':  'Esperando letra "a" para secuencia "false"',
  'bf2':  'Esperando letra "l" para secuencia "false"',
  'bf3':  'Esperando letra "s" para secuencia "false"',
  'bf4':  'Esperando letra "e" para secuencia "false"',
  'b_ok': 'Valor booleano válido',
  'bERR': 'Sólo se acepta la palabra exacta "true" o "false"',
};

type EstadoChar =
  | 'ch0' | 'ch_abre' | 'ch_escape'
  | 'ch_contenido' | 'ch_cierra' | 'chERR';
const MSG_CHAR: Record<EstadoChar, string> = {
  'ch0':          'Esperando comilla simple de apertura \'',
  'ch_abre':      'Esperando carácter o barra invertida \\ para secuencia de escape',
  'ch_escape':    'Esperando secuencia de escape válida (n, t, r, f, v, a, b, \\, \', ", 0)',
  'ch_contenido': 'Esperando comilla simple de cierre \'',
  'ch_cierra':    'Carácter literal válido',
  'chERR':        'Estructura de carácter inválida (debe contener un único carácter o escape)',
};

const ESC_VALIDOS = new Set(['n','t','r','f','v','a','b','\\','\'','"','0']);

// ── AFD: entero con signo opcional ───────────────────────────────────────────

export function esEntero(raw: string): AfdVarResult<EstadoEntero> {
  const tokens = tokenizarChars(raw.trim());
  if (tokens.length === 0) {
    return { valid: false, estadoFinal: 'e0', mensaje: 'El campo de número entero está vacío' };
  }
  let estado: EstadoEntero = 'e0';

  for (const t of tokens) {
    const estadoPrevio = estado;
    switch (estado) {
      case 'e0':
        if      (t.tipo === 'SIGNO')  estado = 'e_signo';
        else if (t.tipo === 'DIGITO') estado = 'e_digito';
        else                          estado = 'eERR';
        break;
      case 'e_signo':
        estado = t.tipo === 'DIGITO' ? 'e_digito' : 'eERR';
        break;
      case 'e_digito':
        estado = t.tipo === 'DIGITO' ? 'e_digito' : 'eERR';
        break;
    }
    if (estado === 'eERR') {
      return { valid: false, estadoFinal: 'eERR', mensaje: `Error en "${t.valor}": ${MSG_ENTERO[estadoPrevio]}` };
    }
  }

  const esValido = estado === 'e_digito';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? MSG_ENTERO[estado] : MSG_ENTERO[estado],
  };
}

// ── AFD: double ───────────────────────────────────────────────────────────────

export function esDouble(raw: string): AfdVarResult<EstadoDouble> {
  const tokens = tokenizarChars(raw.trim());
  if (tokens.length === 0) {
    return { valid: false, estadoFinal: 'd0', mensaje: 'El campo de número decimal está vacío' };
  }
  let estado: EstadoDouble = 'd0';

  for (const t of tokens) {
    const estadoPrevio = estado;
    switch (estado) {
      case 'd0':
        if      (t.tipo === 'SIGNO')  estado = 'd_signo';
        else if (t.tipo === 'DIGITO') estado = 'd_entero';
        else                          estado = 'dERR';
        break;
      case 'd_signo':
        estado = t.tipo === 'DIGITO' ? 'd_entero' : 'dERR';
        break;
      case 'd_entero':
        if      (t.tipo === 'DIGITO') estado = 'd_entero';
        else if (t.tipo === 'PUNTO')  estado = 'd_punto';
        else                          estado = 'dERR';
        break;
      case 'd_punto':
        estado = t.tipo === 'DIGITO' ? 'd_decimal' : 'dERR';
        break;
      case 'd_decimal':
        estado = t.tipo === 'DIGITO' ? 'd_decimal' : 'dERR';
        break;
    }
    if (estado === 'dERR') {
      return { valid: false, estadoFinal: 'dERR', mensaje: `Error en "${t.valor}": ${MSG_DOUBLE[estadoPrevio]}` };
    }
  }

  const esValido = estado === 'd_decimal';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? MSG_DOUBLE[estado] : MSG_DOUBLE[estado],
  };
}

// ── AFD: bool ─────────────────────────────────────────────────────────────────

export function esBool(raw: string): AfdVarResult<EstadoBool> {
  const tokens = tokenizarChars(raw.trim());
  if (tokens.length === 0) {
    return { valid: false, estadoFinal: 'b0', mensaje: 'El campo booleano está vacío' };
  }
  let estado: EstadoBool = 'b0';

  for (const t of tokens) {
    const c = t.valor;
    const estadoPrevio = estado;
    switch (estado) {
      case 'b0':
        if      (c === 't') estado = 'bt1';
        else if (c === 'f') estado = 'bf1';
        else                estado = 'bERR';
        break;
      case 'bt1': estado = c === 'r' ? 'bt2' : 'bERR'; break;
      case 'bt2': estado = c === 'u' ? 'bt3' : 'bERR'; break;
      case 'bt3': estado = c === 'e' ? 'b_ok' : 'bERR'; break;
      case 'bf1': estado = c === 'a' ? 'bf2' : 'bERR'; break;
      case 'bf2': estado = c === 'l' ? 'bf3' : 'bERR'; break;
      case 'bf3': estado = c === 's' ? 'bf4' : 'bERR'; break;
      case 'bf4': estado = c === 'e' ? 'b_ok' : 'bERR'; break;
      case 'b_ok':  estado = 'bERR'; break;
    }
    if (estado === 'bERR') {
      return { valid: false, estadoFinal: 'bERR', mensaje: `Error en "${c}": ${MSG_BOOL[estadoPrevio]}` };
    }
  }

  const esValido = estado === 'b_ok';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? MSG_BOOL[estado] : MSG_BOOL[estado],
  };
}

// ── AFD: char literal ─────────────────────────────────────────────────────────

export function esChar(raw: string): AfdVarResult<EstadoChar> {
  const tokens = tokenizarChars(raw.trim());
  if (tokens.length === 0) {
    return { valid: false, estadoFinal: 'ch0', mensaje: 'El campo de carácter está vacío' };
  }
  let estado: EstadoChar = 'ch0';

  for (const t of tokens) {
    const estadoPrevio = estado;
    switch (estado) {
      case 'ch0':
        estado = t.tipo === 'COMILLA_S' ? 'ch_abre' : 'chERR';
        break;
      case 'ch_abre':
        if      (t.tipo === 'BARRA')     estado = 'ch_escape';
        else if (t.tipo === 'COMILLA_S') estado = 'chERR';
        else                             estado = 'ch_contenido';
        break;
      case 'ch_escape':
        estado = ESC_VALIDOS.has(t.valor) ? 'ch_contenido' : 'chERR';
        break;
      case 'ch_contenido':
        estado = t.tipo === 'COMILLA_S' ? 'ch_cierra' : 'chERR';
        break;
      case 'ch_cierra':
        estado = 'chERR';
        break;
    }
    if (estado === 'chERR') {
      return { valid: false, estadoFinal: 'chERR', mensaje: `Error en "${t.valor}": ${MSG_CHAR[estadoPrevio]}` };
    }
  }

  const esValido = estado === 'ch_cierra';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? MSG_CHAR[estado] : MSG_CHAR[estado],
  };
}

// ── AFD: string literal ───────────────────────────────────────────────────────
// Reutiliza afd_string de afd_print (ya es AFD explícito)

export function esString(raw: string): { valid: boolean; mensaje: string } {
  const trim = raw.trim();
  if (trim === '') return { valid: false, mensaje: 'El campo de cadena está vacío' };
  const valid = afd_string(trim);
  return {
    valid,
    mensaje: valid ? 'Cadena válida' : 'La cadena debe empezar y terminar con comillas dobles y no tener escapes inválidos',
  };
}

// ── AFD: identificador válido ─────────────────────────────────────────────────

function validarNombre(raw: string): boolean {
  return afd_id(raw.trim());
}

// ── Validadores compuestos ────────────────────────────────────────────────────

export function validarYInferirTipo(raw: string): InferredType {
  const trim = raw.trim();
  if (trim === '') return 'unknown';
  if (esBool(trim).valid)   return 'bool';
  if (esChar(trim).valid)   return 'char';
  if (esString(trim).valid) return 'string';
  if (esDouble(trim).valid) return 'double';
  if (esEntero(trim).valid) return 'int';

  // Si no es un literal simple, ver si es una expresión válida (DPDA)
  const exprVal = validarExpr(trim);
  if (exprVal.valid) {
    const lexRes = tokenizeExpr(trim);
    if (lexRes.valid) {
      // Si tiene operadores relacionales o lógicos, es bool
      const tieneBool = lexRes.tokens.some(t => 
        t.tipo === 'BOOL' || t.tipo === 'OP_REL' || t.tipo === 'OP_LOG' || t.tipo === 'NOT'
      );
      if (tieneBool) return 'bool';

      // Si contiene comillas de string
      const tieneString = lexRes.tokens.some(t => t.tipo === 'STR');
      if (tieneString) return 'string';

      // Si contiene algún número con punto decimal o float/double implícito
      const tieneDouble = lexRes.tokens.some(t => t.tipo === 'NUM' && String(t.valor).includes('.'));
      if (tieneDouble) return 'double';
    }
    // Por defecto, si es expresión aritmética simple (ej: x + 5), inferimos int
    return 'int';
  }
  return 'unknown';
}

export interface ResultValidation {
  valid: boolean;
  mensaje: string;
}

export function validarValorTipado(tipo: TipoExplicito, raw: string): ResultValidation {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { valid: false, mensaje: 'El valor no puede estar vacío' };
  }
  switch (tipo) {
    case 'int': {
      const rInt = esEntero(raw);
      if (rInt.valid) return { valid: true, mensaje: rInt.mensaje };
      const exprInt = validarExpr(raw);
      if (exprInt.valid) return { valid: true, mensaje: 'Expresión válida' };
      return { valid: false, mensaje: 'Debe ser un número entero o una expresión matemática válida' };
    }
    case 'float':
    case 'double': {
      const rDbl = esDouble(raw);
      const rIntD = esEntero(raw);
      if (rDbl.valid || rIntD.valid) return { valid: true, mensaje: 'Número válido' };
      const exprDbl = validarExpr(raw);
      if (exprDbl.valid) return { valid: true, mensaje: 'Expresión válida' };
      return { valid: false, mensaje: 'No es un número válido ni una expresión válida (ej: 3.14 o x + 1)' };
    }
    case 'bool': {
      const rBool = esBool(raw);
      if (rBool.valid) return { valid: true, mensaje: rBool.mensaje };
      const exprBool = validarExpr(raw);
      if (exprBool.valid) return { valid: true, mensaje: 'Expresión lógica válida' };
      return { valid: false, mensaje: 'Debe ser true/false o una expresión lógica válida' };
    }
    case 'string': {
      const rStr = esString(raw);
      if (rStr.valid) return { valid: true, mensaje: rStr.mensaje };
      const exprStr = validarExpr(raw);
      if (exprStr.valid) return { valid: true, mensaje: 'Expresión de cadena válida' };
      return { valid: false, mensaje: 'Debe ser una cadena válida o una expresión de cadena' };
    }
    case 'char': {
      const rChar = esChar(raw);
      return rChar.valid
        ? { valid: true, mensaje: rChar.mensaje }
        : { valid: false, mensaje: rChar.mensaje };
    }
    default:
      return { valid: false, mensaje: 'Tipo desconocido' };
  }
}

export function validarNombreVariable(raw: string): ResultValidation {
  const s = raw.trim();
  if (s === '') {
    return { valid: false, mensaje: 'El nombre no puede estar vacío' };
  }
  if (!validarNombre(s)) {
    return { valid: false, mensaje: 'Identificador inválido (debe iniciar con letra o _ y solo usar letras/dígitos)' };
  }
  if (RESERVED_CPP.has(s)) {
    return { valid: false, mensaje: `"${s}" es una palabra reservada de C++` };
  }
  return { valid: true, mensaje: 'Nombre válido' };
}

// ── AFD: amount para change_var ───────────────────────────────────────────────
// Acepta: entero | double | identificador válido (no reservado)

export function validarAmount(raw: string): ResultValidation {
  const s = raw.trim();
  if (s === '') {
    return { valid: false, mensaje: 'El valor no puede estar vacío' };
  }
  if (esEntero(s).valid || esDouble(s).valid) {
    return { valid: true, mensaje: 'Número válido' };
  }
  const nameVal = validarNombreVariable(s);
  if (nameVal.valid) {
    return { valid: true, mensaje: 'Variable válida' };
  }
  const exprRes = validarExpr(s);
  if (exprRes.valid) {
    return { valid: true, mensaje: 'Expresión válida' };
  }
  return { valid: false, mensaje: 'Debe ser un número, una variable o una expresión matemática válida' };
}

// ── Validador: tamaño de arreglo/matriz ───────────────────────────────────────
// Acepta: entero positivo sin signo (1, 2, 10, etc.)

export function validarTamanio(raw: string): ResultValidation {
  const s = raw.trim();
  if (s === '') {
    return { valid: false, mensaje: 'El tamaño no puede estar vacío' };
  }
  const r = esEntero(s);
  if (!r.valid) {
    return { valid: false, mensaje: 'El tamaño debe ser un número entero (ej: 5)' };
  }
  const n = parseInt(s, 10);
  if (n <= 0) {
    return { valid: false, mensaje: 'El tamaño debe ser mayor a 0' };
  }
  return { valid: true, mensaje: 'Tamaño válido' };
}

// ── Validador: tamaño de arreglo/matriz (acepta variables y expresiones) ──────
// Acepta: entero positivo, identificador válido, o expresión aritmética
// Utilizado en ArrayBlock y MatrixBlock para los campos dentro de []

export function validarTamanioOVariable(raw: string): ResultValidation {
  const s = raw.trim();
  if (s === '') {
    return { valid: false, mensaje: 'El tamaño no puede estar vacío' };
  }

  // 1. Si es un entero, verificar que sea positivo
  const rEntero = esEntero(s);
  if (rEntero.valid) {
    const n = parseInt(s, 10);
    if (n <= 0) {
      return { valid: false, mensaje: 'El tamaño debe ser mayor a 0' };
    }
    return { valid: true, mensaje: 'Tamaño numérico válido' };
  }

  // 2. Si es un identificador válido (variable, incluyendo acceso a arreglos como arr[i])
  if (afd_id(s)) {
    if (RESERVED_CPP.has(s)) {
      return { valid: false, mensaje: `"${s}" es una palabra reservada de C++` };
    }
    return { valid: true, mensaje: 'Variable válida como tamaño' };
  }

  // 3. Si es una expresión aritmética válida (ej: n + 1, rows * 2)
  const exprRes = validarExpr(s);
  if (exprRes.valid) {
    return { valid: true, mensaje: 'Expresión válida como tamaño' };
  }

  return { valid: false, mensaje: 'Debe ser un entero positivo, una variable o una expresión (ej: 5, n, n + 1)' };
}

// ── Validador: valores de inicialización (listas, arreglos) ──────────────────
// Acepta: lista de literales separados por coma, todos compatibles con el tipo

export function validarListaValores(raw: string, tipo?: TipoExplicito): ResultValidation {
  const s = raw.trim();
  if (s === '') {
    return { valid: true, mensaje: 'Sin valores de inicialización (válido)' };
  }

  const elementos = s.split(',').map(e => e.trim());
  for (let i = 0; i < elementos.length; i++) {
    const elem = elementos[i];
    if (elem === '') {
      return { valid: false, mensaje: `Elemento ${i + 1} vacío (revise las comas)` };
    }
    if (tipo) {
      const valTipado = validarValorTipado(tipo, elem);
      if (!valTipado.valid) {
        return { valid: false, mensaje: `Elemento ${i + 1} ("${elem}"): ${valTipado.mensaje}` };
      }
    } else {
      const inferido = validarYInferirTipo(elem);
      if (inferido === 'unknown') {
        return { valid: false, mensaje: `Elemento ${i + 1} ("${elem}"): valor no reconocido` };
      }
    }
  }
  return { valid: true, mensaje: `${elementos.length} elemento(s) válido(s)` };
}

// ── Validador: valor de asignación set_var ────────────────────────────────────
// Acepta: literal, variable, o expresión aritmética (reutiliza validarPrintValue)

export function validarValorAsignacion(raw: string): ResultValidation {
  const s = raw.trim();
  if (s === '') {
    return { valid: false, mensaje: 'El valor no puede estar vacío' };
  }
  // Si es un literal reconocido
  if (validarYInferirTipo(s) !== 'unknown') {
    return { valid: true, mensaje: 'Valor literal válido' };
  }
  // Si es un identificador válido (variable)
  const nameVal = validarNombreVariable(s);
  if (nameVal.valid) {
    return { valid: true, mensaje: 'Variable válida' };
  }
  
  // Si es una expresión aritmética o lógica (dpda_expr)
  const exprRes = validarExpr(s);
  if (exprRes.valid) {
    return { valid: true, mensaje: 'Expresión válida' };
  }

  return { valid: false, mensaje: 'Debe ser un literal válido, una variable o una expresión matemática/lógica' };
}