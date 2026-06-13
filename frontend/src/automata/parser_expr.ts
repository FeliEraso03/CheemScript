import { tokenizeExpr } from './lexer_expr';
import type { TokenExpr } from './lexer_expr';

export interface ParserResult {
  valid: boolean;
  mensaje: string;
}

/**
 * Parser recursivo descendente para expresiones booleanas complejas (PDA simulado).
 * Devuelve [esValida, tokensConsumidos, mensajeError].
 */
export function parseExpr(tokens: TokenExpr[], pos = 0): [boolean, number, string] {
  if (tokens.length === 0) return [false, 0, "Expresion vacia"];
  
  const [ok, cur, error] = parseOr(tokens, pos);
  
  if (ok && cur < tokens.length) {
    return [false, cur, `Token inesperado al final de la expresion: '${(tokens[cur] as any).valor ?? tokens[cur].tipo}'`];
  }
  
  return [ok, cur, error];
}

function parseOr(tokens: TokenExpr[], pos: number): [boolean, number, string] {
  let [ok, cur, error] = parseAnd(tokens, pos);
  if (!ok) return [false, pos, error];
  
  while (cur < tokens.length && tokens[cur].tipo === 'OP_LOG' && (tokens[cur] as any).valor === '||') {
    const [ok2, cur2, error2] = parseAnd(tokens, cur + 1);
    if (!ok2) return [false, pos, error2];
    cur = cur2;
  }
  return [true, cur, ""];
}

function parseAnd(tokens: TokenExpr[], pos: number): [boolean, number, string] {
  let [ok, cur, error] = parseNot(tokens, pos);
  if (!ok) return [false, pos, error];
  
  while (cur < tokens.length && tokens[cur].tipo === 'OP_LOG' && (tokens[cur] as any).valor === '&&') {
    const [ok2, cur2, error2] = parseNot(tokens, cur + 1);
    if (!ok2) return [false, pos, error2];
    cur = cur2;
  }
  return [true, cur, ""];
}

function parseNot(tokens: TokenExpr[], pos: number): [boolean, number, string] {
  if (pos < tokens.length && tokens[pos].tipo === 'NOT') {
    const [ok, cur, error] = parseNot(tokens, pos + 1);
    if (!ok) return [false, pos, error];
    return [true, cur, ""];
  }
  return parseAtom(tokens, pos);
}

function parseAtom(tokens: TokenExpr[], pos: number): [boolean, number, string] {
  if (pos >= tokens.length) return [false, pos, "Expresion incompleta: se esperaba un valor, variable o '('"];
  
  const t = tokens[pos];

  // Subexpresion entre parentesis: ( OR_EXPR )
  if (t.tipo === 'PAREN_A') {
    const [ok, cur, error] = parseOr(tokens, pos + 1);
    if (!ok) return [false, pos, error];
    if (cur >= tokens.length || tokens[cur].tipo !== 'PAREN_C') {
      return [false, pos, "Falta parentesis de cierre ')'"];
    }
    return [true, cur + 1, ""];
  }

  // ID opcionalmente seguido de operador relacional y valor
  if (t.tipo === 'ID') {
    const next = tokens[pos + 1];
    if (next && next.tipo === 'OP_REL') {
      const val = tokens[pos + 2];
      if (!val) return [false, pos, `Falta valor despues del operador '${next.valor}'`];
      if (!['ID', 'NUM', 'STR', 'BOOL'].includes(val.tipo)) {
        return [false, pos, `Valor invalido despues de '${next.valor}'`];
      }
      return [true, pos + 3, ""];
    }
    return [true, pos + 1, ""]; // ID solo, tratado como booleano
  }
  
  // Boolean literals can stand alone
  if (t.tipo === 'BOOL') {
     return [true, pos + 1, ""];
  }
  
  // Si encontramos un NUM o STR sin ID o operador relacional previo, es un error sintactico en este contexto
  if (t.tipo === 'NUM' || t.tipo === 'STR') {
     // Permítimos que un valor numérico o string esté en una comparación simple si está a la izquierda? 
     // El doc define ATOM ::= ID OP_REL VALOR | ID | ( OR_EXPR ). No permite NUM OP_REL VALOR, solo ID.
     // Pero si alguien escribe `10 < x`, técnicamente el doc solo dice ID OP_REL VALOR.
     // Añadiremos soporte basico:
     const next = tokens[pos + 1];
     if (next && next.tipo === 'OP_REL') {
       const val = tokens[pos + 2];
       if (!val) return [false, pos, `Falta valor despues del operador '${next.valor}'`];
       if (!['ID', 'NUM', 'STR', 'BOOL'].includes(val.tipo)) {
         return [false, pos, `Valor invalido despues de '${next.valor}'`];
       }
       return [true, pos + 3, ""];
     }
     
     // Y si esta solo? (ej: if (true) o if (1)). En C++ if (1) es valido, tratémoslo como válido:
     return [true, pos + 1, ""];
  }

  return [false, pos, `Token invalido para inicio de expresion: '${(t as any).valor ?? t.tipo}'`];
}

/**
 * Punto de entrada unificado: Tokeniza y Parsea un string.
 */
export function validarExpr(input: string): ParserResult {
  if (input.trim() === '') {
    return { valid: false, mensaje: 'La condicion esta vacia' };
  }

  // 1. Tokenizar (Lexer)
  const lexRes = tokenizeExpr(input);
  if (!lexRes.valid) {
    return { valid: false, mensaje: lexRes.errorMsg || 'Error lexico desconocido' };
  }

  // 2. Parsear (PDA)
  const [ok, consumidos, error] = parseExpr(lexRes.tokens, 0);
  
  if (!ok) {
    return { valid: false, mensaje: error || 'Error de sintaxis' };
  }
  
  if (consumidos < lexRes.tokens.length) {
    return { valid: false, mensaje: 'Existen tokens extra al final de la expresion' };
  }

  return { valid: true, mensaje: 'Expresion valida' };
}
