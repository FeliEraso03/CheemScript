import { tokenizeExpr } from './lexer_expr';
import type { TokenExpr } from './lexer_expr';

export interface ParserResult {
  valid: boolean;
  mensaje: string;
}

// ── DPDA: Autómata de Pila Determinista para expresiones booleanas/relacionales ─
//
// Definición formal: M = (Q, Σ, Γ, δ, q₀, Z₀, F)
//
//   Q  = { qe_inicio, qe_unario, qe_operando, qeERR }
//   Σ  = { ID, NUM, STR, BOOL, OP_REL, OP_LOG, OP_ARITH, NOT, PAREN_A, PAREN_C }
//   Γ  = { Z₀, PAREN }
//   q₀ = qe_inicio
//   Z₀ = Z₀ (símbolo inicial de pila)
//   F  = { qe_operando }  (aceptación por estado final con pila vacía: pila = [Z₀])
//
// Tabla de transiciones δ(estado, entrada, tope_pila) → (nuevo_estado, operación_pila):
//
//   (qe_inicio,   ID/NUM/STR/BOOL, γ)       → (qe_operando, γ)
//   (qe_inicio,   NOT,              γ)       → (qe_inicio,   γ)          — NOT encadenable
//   (qe_inicio,   OP_ARITH('-'),    γ)       → (qe_unario,   γ)          — menos unario
//   (qe_inicio,   PAREN_A,          γ)       → (qe_inicio,   push PAREN)
//   (qe_unario,   ID/NUM/STR/BOOL,  γ)       → (qe_operando, γ)
//   (qe_unario,   PAREN_A,          γ)       → (qe_inicio,   push PAREN)
//   (qe_operando, OP_REL,           γ)       → (qe_inicio,   γ)
//   (qe_operando, OP_LOG,           γ)       → (qe_inicio,   γ)
//   (qe_operando, OP_ARITH,         γ)       → (qe_inicio,   γ)
//   (qe_operando, PAREN_C,          PAREN·γ) → (qe_operando, pop)
//   Cualquier otra combinación                → (qeERR,       γ)
//
// Condición de aceptación: estado ∈ F ∧ pila = [Z₀] ∧ entrada agotada
// ─────────────────────────────────────────────────────────────────────────────

type EstadoPdaExpr = 'qe_inicio' | 'qe_unario' | 'qe_operando' | 'qeERR';
type SimboloPilaExpr = 'Z0' | 'PAREN';

function pdaExpresion(tokens: TokenExpr[]): [boolean, string] {
  let estado: EstadoPdaExpr = 'qe_inicio';
  const pila: SimboloPilaExpr[] = ['Z0']; // pila explícita con símbolo inicial

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    switch (estado) {
      case 'qe_inicio':
        if (['ID', 'NUM', 'STR', 'BOOL'].includes(t.tipo)) {
          estado = 'qe_operando';
        } else if (t.tipo === 'NOT') {
          // NOT puede encadenarse (!!x), estado permanece en qe_inicio
        } else if (t.tipo === 'OP_ARITH' && (t as any).valor === '-') {
          estado = 'qe_unario'; // menos unario (solo uno permitido)
        } else if (t.tipo === 'PAREN_A') {
          pila.push('PAREN'); // push
        } else {
          estado = 'qeERR';
        }
        break;

      case 'qe_unario':
        // Tras menos unario solo se acepta átomo o paréntesis
        if (['ID', 'NUM', 'STR', 'BOOL'].includes(t.tipo)) {
          estado = 'qe_operando';
        } else if (t.tipo === 'PAREN_A') {
          pila.push('PAREN'); // push
          estado = 'qe_inicio';
        } else {
          estado = 'qeERR';
        }
        break;

      case 'qe_operando':
        if (t.tipo === 'OP_REL' || t.tipo === 'OP_LOG' || t.tipo === 'OP_ARITH') {
          estado = 'qe_inicio';
        } else if (t.tipo === 'PAREN_C') {
          // pop: solo si el tope de la pila es PAREN
          if (pila.length > 1 && pila[pila.length - 1] === 'PAREN') {
            pila.pop();
          } else {
            estado = 'qeERR'; // paréntesis de cierre sin apertura
          }
        } else {
          estado = 'qeERR';
        }
        break;
    }

    if (estado === 'qeERR') {
      return [false, `Token inesperado: '${(t as any).valor ?? t.tipo}'`];
    }
  }

  // Condición de aceptación: estado = qe_operando ∧ pila = [Z₀]
  if (estado === 'qe_operando' && pila.length === 1 && pila[0] === 'Z0') {
    return [true, ''];
  }

  // Pila no vacía → paréntesis sin cerrar
  if (pila.length > 1) {
    return [false, "Falta parentesis de cierre ')'"];
  }

  // Expresión incompleta
  return [false, "Expresion incompleta: se esperaba un valor, variable o '('"];
}

/**
 * Autómata de Pila Determinista (DPDA): valida una secuencia de tokens como expresión.
 * Devuelve [esValida, tokensConsumidos, mensajeError].
 */
export function parseExpr(tokens: TokenExpr[], pos = 0): [boolean, number, string] {
  if (tokens.length === 0) return [false, 0, "Expresion vacia"];

  const subTokens = pos > 0 ? tokens.slice(pos) : tokens;
  const [ok, error] = pdaExpresion(subTokens);

  return ok ? [true, tokens.length, ''] : [false, pos, error];
}

/**
 * Punto de entrada unificado: Tokeniza (Lexer) y valida (DPDA) un string como expresión.
 */
export function validarExpr(input: string): ParserResult {
  if (input.trim() === '') {
    return { valid: false, mensaje: 'La condicion esta vacia' };
  }

  // Fase 1: Tokenizar (Lexer — AFD de caracteres)
  const lexRes = tokenizeExpr(input);
  if (!lexRes.valid) {
    return { valid: false, mensaje: lexRes.errorMsg || 'Error lexico desconocido' };
  }

  // Fase 2: Validar estructura (DPDA — Autómata de Pila)
  const [ok, , error] = parseExpr(lexRes.tokens, 0);

  if (!ok) {
    return { valid: false, mensaje: error || 'Error de sintaxis' };
  }

  return { valid: true, mensaje: 'Expresion valida' };
}
