import { afd_id } from './afd_print';
import { validarCount } from './afd_repeat';
import { validarExpr } from './parser_expr';
import type { ParserResult } from './parser_expr';

export type TipoForInit = 'int' | 'long' | 'size_t';
const TIPOS_VALIDOS_FOR = new Set<TipoForInit>(['int', 'long', 'size_t']);

export type TokenInit =
  | { tipo: 'TIPO';   valor: string }
  | { tipo: 'ID';     valor: string }
  | { tipo: 'ASIGNA' }
  | { tipo: 'EXPR';   valor: string }
  | { tipo: 'ERR';    valor?: string };

export type EstadoInit =
  | 'in0'
  | 'in_tipo'
  | 'in_id'
  | 'in_id_decl'
  | 'in_asigna'
  | 'in_expr'
  | 'inERR';

const MSG_INIT: Record<EstadoInit, string> = {
  'in0':         'Esperando tipo ("int", "long", "size_t") o identificador',
  'in_tipo':     'Esperando nombre de variable después del tipo',
  'in_id':       'Esperando "=" para asignar la variable',
  'in_id_decl':  'Esperando "=" para inicializar la variable declarada',
  'in_asigna':   'Esperando expresión aritmética inicial',
  'in_expr':     'Inicialización válida',
  'inERR':       'Estructura de inicialización inválida',
};

export interface AfdInitResult {
  valid: boolean;
  estadoFinal: EstadoInit;
  mensaje: string;
}

export function tokenizarInit(raw: string): TokenInit[] {
  const tokens: TokenInit[] = [];
  const partes = raw.trim().split(/\s+/);
  let i = 0;

  while (i < partes.length) {
    const p = partes[i];
    if (!p) { i++; continue; }

    // TIPO
    if (TIPOS_VALIDOS_FOR.has(p as TipoForInit)) {
      tokens.push({ tipo: 'TIPO', valor: p });
      i++;
      continue;
    }

    // ASIGNA '='
    if (p === '=') {
      tokens.push({ tipo: 'ASIGNA' });
      const exprRaw = partes.slice(i + 1).filter(Boolean).join(' ');
      if (exprRaw) {
        tokens.push(validarCount(exprRaw).valid
          ? { tipo: 'EXPR', valor: exprRaw }
          : { tipo: 'ERR', valor: exprRaw });
      }
      break;
    }

    // ID — puede ser 'i=0' pegado
    if (p.includes('=')) {
      const idx = p.indexOf('=');
      const before = p.slice(0, idx);
      const after  = p.slice(idx + 1);
      if (before) {
        if (afd_id(before)) {
          tokens.push({ tipo: 'ID', valor: before });
        } else {
          tokens.push({ tipo: 'ERR', valor: before });
        }
      }
      tokens.push({ tipo: 'ASIGNA' });
      if (after || i + 1 < partes.length) {
        const exprRaw = [after, ...partes.slice(i + 1)].filter(Boolean).join(' ');
        tokens.push(validarCount(exprRaw).valid
          ? { tipo: 'EXPR', valor: exprRaw }
          : { tipo: 'ERR', valor: exprRaw });
      }
      break;
    }

    // ID puro
    if (afd_id(p)) {
      tokens.push({ tipo: 'ID', valor: p });
      i++;
      continue;
    }

    // Todo lo demás: intentar como inicio de expresión aritmética
    const exprRaw = partes.slice(i).join(' ');
    tokens.push(validarCount(exprRaw).valid
      ? { tipo: 'EXPR', valor: exprRaw }
      : { tipo: 'ERR', valor: exprRaw });
    break;
  }

  return tokens;
}

export function validarInit(raw: string): AfdInitResult {
  const s = raw.trim();
  if (s === '') {
    return { valid: false, estadoFinal: 'in0', mensaje: 'El campo de inicialización está vacío' };
  }

  const tokens = tokenizarInit(s);
  const tokenErr = tokens.find(t => t.tipo === 'ERR');
  if (tokenErr) {
    return {
      valid: false,
      estadoFinal: 'inERR',
      mensaje: `Token o expresión inválida: "${tokenErr.valor ?? ''}"`,
    };
  }

  let estado: EstadoInit = 'in0';

  for (const t of tokens) {
    const estadoPrevio = estado;
    switch (estado) {
      case 'in0':
        if      (t.tipo === 'TIPO') estado = 'in_tipo';
        else if (t.tipo === 'ID')   estado = 'in_id';
        else                        estado = 'inERR';
        break;
      case 'in_tipo':
        estado = t.tipo === 'ID' ? 'in_id_decl' : 'inERR';
        break;
      case 'in_id':
      case 'in_id_decl':
        estado = t.tipo === 'ASIGNA' ? 'in_asigna' : 'inERR';
        break;
      case 'in_asigna':
        estado = t.tipo === 'EXPR' ? 'in_expr' : 'inERR';
        break;
      case 'in_expr':
        estado = 'inERR';
        break;
    }

    if (estado === 'inERR') {
      return {
        valid: false,
        estadoFinal: 'inERR',
        mensaje: `Error en estado "${estadoPrevio}": ${MSG_INIT[estadoPrevio]}`,
      };
    }
  }

  const esValido = estado === 'in_expr';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? MSG_INIT[estado] : `Estructura incompleta en estado "${estado}": ${MSG_INIT[estado]}`,
  };
}

export function validarConditionFor(raw: string): ParserResult {
  return validarExpr(raw);
}

export type TokenIncr =
  | { tipo: 'ID';      valor: string }
  | { tipo: 'OP_POST'; valor: '++' | '--' }
  | { tipo: 'OP_COMP'; valor: string }
  | { tipo: 'ASIGNA' }
  | { tipo: 'EXPR';    valor: string }
  | { tipo: 'ERR';     valor?: string };

export type EstadoIncr =
  | 'ic0'
  | 'ic_id'
  | 'ic_op_pre'
  | 'ic_postfijo'
  | 'ic_prefijo'
  | 'ic_comp_asigna'
  | 'ic_expr'
  | 'icERR';

const OPS_COMPUESTOS = new Set(['+=', '-=', '*=', '/=', '%=']);

const MSG_INCR: Record<EstadoIncr, string> = {
  'ic0':            'Esperando identificador o operador de incremento/decremento (++ o --)',
  'ic_id':          'Esperando "++", "--", operador compuesto (+=, -=, etc.) o "="',
  'ic_op_pre':      'Esperando identificador después del operador',
  'ic_postfijo':    'Incremento/decremento postfijo válido',
  'ic_prefijo':     'Incremento/decremento prefijo válido',
  'ic_comp_asigna': 'Esperando expresión aritmética',
  'ic_expr':        'Incremento/decremento válido',
  'icERR':          'Estructura de incremento inválida',
};

export interface AfdIncrResult {
  valid: boolean;
  estadoFinal: EstadoIncr;
  mensaje: string;
}

export function tokenizarIncrement(raw: string): TokenIncr[] {
  const tokens: TokenIncr[] = [];
  let i = 0;
  const s = raw.trim();

  while (i < s.length) {
    if (s[i] === ' ' || s[i] === '\t') { i++; continue; }

    if (i + 1 < s.length) {
      const dos = s.slice(i, i + 2);
      if (dos === '++' || dos === '--') {
        tokens.push({ tipo: 'OP_POST', valor: dos as '++' | '--' });
        i += 2;
        continue;
      }
      if (OPS_COMPUESTOS.has(dos)) {
        tokens.push({ tipo: 'OP_COMP', valor: dos });
        i += 2;
        const exprRaw = s.slice(i).trim();
        if (exprRaw) {
          tokens.push(validarCount(exprRaw).valid
            ? { tipo: 'EXPR', valor: exprRaw }
            : { tipo: 'ERR', valor: exprRaw });
        }
        break;
      }
    }

    if (s[i] === '=') {
      tokens.push({ tipo: 'ASIGNA' });
      i++;
      const exprRaw = s.slice(i).trim();
      if (exprRaw) {
        tokens.push(validarCount(exprRaw).valid
          ? { tipo: 'EXPR', valor: exprRaw }
          : { tipo: 'ERR', valor: exprRaw });
      }
      break;
    }

    if ((s[i] >= 'a' && s[i] <= 'z') || (s[i] >= 'A' && s[i] <= 'Z') || s[i] === '_') {
      let j = i;
      while (j < s.length &&
             ((s[j] >= 'a' && s[j] <= 'z') || (s[j] >= 'A' && s[j] <= 'Z') ||
              (s[j] >= '0' && s[j] <= '9') || s[j] === '_')) j++;
      const id = s.slice(i, j);
      tokens.push(afd_id(id)
        ? { tipo: 'ID', valor: id }
        : { tipo: 'ERR', valor: id });
      i = j;
      continue;
    }

    tokens.push({ tipo: 'ERR', valor: s[i] });
    i++;
  }

  return tokens;
}

export function validarIncrement(raw: string): AfdIncrResult {
  const s = raw.trim();
  if (s === '') {
    return { valid: false, estadoFinal: 'ic0', mensaje: 'El campo de incremento está vacío' };
  }

  const tokens = tokenizarIncrement(s);
  const tokenErr = tokens.find(t => t.tipo === 'ERR');
  if (tokenErr) {
    return {
      valid: false,
      estadoFinal: 'icERR',
      mensaje: `Token o expresión inválida: "${tokenErr.valor ?? ''}"`,
    };
  }

  let estado: EstadoIncr = 'ic0';

  for (const t of tokens) {
    const estadoPrevio = estado;
    switch (estado) {
      case 'ic0':
        if      (t.tipo === 'ID')      estado = 'ic_id';
        else if (t.tipo === 'OP_POST') estado = 'ic_op_pre';
        else                           estado = 'icERR';
        break;
      case 'ic_id':
        if      (t.tipo === 'OP_POST') estado = 'ic_postfijo';
        else if (t.tipo === 'OP_COMP') estado = 'ic_comp_asigna';
        else if (t.tipo === 'ASIGNA')  estado = 'ic_comp_asigna';
        else                           estado = 'icERR';
        break;
      case 'ic_op_pre':
        estado = t.tipo === 'ID' ? 'ic_prefijo' : 'icERR';
        break;
      case 'ic_postfijo':
      case 'ic_prefijo':
        estado = 'icERR';
        break;
      case 'ic_comp_asigna':
        estado = t.tipo === 'EXPR' ? 'ic_expr' : 'icERR';
        break;
      case 'ic_expr':
        estado = 'icERR';
        break;
    }

    if (estado === 'icERR') {
      return {
        valid: false,
        estadoFinal: 'icERR',
        mensaje: `Error en estado "${estadoPrevio}": ${MSG_INCR[estadoPrevio]}`,
      };
    }
  }

  const esValido = estado === 'ic_postfijo'
      || estado === 'ic_prefijo'
      || estado === 'ic_expr';

  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? MSG_INCR[estado] : `Estructura incompleta en estado "${estado}": ${MSG_INCR[estado]}`,
  };
}

export interface ResultadoFor {
  init:      AfdInitResult;
  condition: ParserResult;
  increment: AfdIncrResult;
  valido:    boolean;
}

export function validarFor(
  init:      string,
  condition: string,
  increment: string
): ResultadoFor {
  const resInit = validarInit(init);
  const resCond = validarConditionFor(condition);
  const resIncr = validarIncrement(increment);

  return {
    init: resInit,
    condition: resCond,
    increment: resIncr,
    valido: resInit.valid && resCond.valid && resIncr.valid,
  };
}
