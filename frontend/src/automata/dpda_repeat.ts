

export type TokenCount =
  | { tipo: 'NUM';    valor: string }
  | { tipo: 'ID';     valor: string }
  | { tipo: 'OP_ADD'; valor: '+' | '-' }
  | { tipo: 'OP_MUL'; valor: '*' | '/' | '%' }
  | { tipo: 'PAREN_A' }
  | { tipo: 'PAREN_C' }
  | { tipo: 'ERR';    valor: string };

export type EstadoNumPos = 'n0' | 'n_digito' | 'nERR';

const MSG_NUM_POS: Record<EstadoNumPos, string> = {
  'n0':       'Esperando dígito [0-9]',
  'n_digito': 'Número entero positivo válido',
  'nERR':     'Carácter inesperado (solo se permiten dígitos)',
};

export type EstadoIdCount = 'i0' | 'i_id' | 'iERR';

const MSG_ID_COUNT: Record<EstadoIdCount, string> = {
  'i0':   'Esperando letra o guión bajo para iniciar identificador',
  'i_id': 'Identificador válido',
  'iERR': 'Carácter inválido en identificador (solo letras, dígitos y _)',
};

export type EstadoParserCount =
  | 'pc_inicio'
  | 'pc_expr_valida'
  | 'pc_operador'
  | 'pc_paren_abierto'
  | 'pcERR';

const MSG_PARSER_COUNT: Record<EstadoParserCount, string> = {
  'pc_inicio':        'Esperando expresión aritmética (número, variable o paréntesis)',
  'pc_expr_valida':   'Expresión aritmética válida',
  'pc_operador':      'Esperando operando después del operador',
  'pc_paren_abierto': 'Paréntesis sin cerrar',
  'pcERR':            'Expresión aritmética inválida',
};

export interface AfdCountResult<T> {
  valid: boolean;
  estadoFinal: T;
  mensaje: string;
}

export interface ValidacionCount {
  valid: boolean;
  mensaje: string;
  estadoFinal?: EstadoParserCount;
}

export function afd_num_pos(raw: string): AfdCountResult<EstadoNumPos> {
  if (raw.length === 0) {
    return { valid: false, estadoFinal: 'n0', mensaje: 'El campo de número está vacío' };
  }
  let estado: EstadoNumPos = 'n0';

  for (const c of raw) {
    const estadoPrevio = estado;
    const esDigito = c >= '0' && c <= '9';
    switch (estado) {
      case 'n0':
        estado = esDigito ? 'n_digito' : 'nERR';
        break;
      case 'n_digito':
        estado = esDigito ? 'n_digito' : 'nERR';
        break;
    }
    if (estado === 'nERR') {
      return { valid: false, estadoFinal: 'nERR', mensaje: `Error en "${c}": ${MSG_NUM_POS[estadoPrevio]}` };
    }
  }

  const esValido = estado === 'n_digito';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? MSG_NUM_POS[estado] : MSG_NUM_POS[estado],
  };
}

export function afd_id_count(raw: string): AfdCountResult<EstadoIdCount> {
  if (raw.length === 0) {
    return { valid: false, estadoFinal: 'i0', mensaje: 'El identificador está vacío' };
  }
  let estado: EstadoIdCount = 'i0';

  for (const c of raw) {
    const estadoPrevio = estado;
    const esLetra  = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    const esDigito = c >= '0' && c <= '9';
    switch (estado) {
      case 'i0':
        estado = esLetra ? 'i_id' : 'iERR';
        break;
      case 'i_id':
        estado = (esLetra || esDigito) ? 'i_id' : 'iERR';
        break;
    }
    if (estado === 'iERR') {
      return { valid: false, estadoFinal: 'iERR', mensaje: `Error en "${c}": ${MSG_ID_COUNT[estadoPrevio]}` };
    }
  }

  const esValido = estado === 'i_id';
  return {
    valid: esValido,
    estadoFinal: estado,
    mensaje: esValido ? MSG_ID_COUNT[estado] : MSG_ID_COUNT[estado],
  };
}

export function tokenizarCount(raw: string): TokenCount[] {
  const tokens: TokenCount[] = [];
  let i = 0;

  while (i < raw.length) {
    const c = raw[i];

    if (c === ' ' || c === '\t') { i++; continue; }

    if (c >= '0' && c <= '9') {
      let j = i;
      while (j < raw.length && raw[j] >= '0' && raw[j] <= '9') j++;
      tokens.push({ tipo: 'NUM', valor: raw.slice(i, j) });
      i = j;
      continue;
    }

    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_') {
      let j = i;
      while (j < raw.length &&
             ((raw[j] >= 'a' && raw[j] <= 'z') ||
              (raw[j] >= 'A' && raw[j] <= 'Z') ||
              (raw[j] >= '0' && raw[j] <= '9') ||
              raw[j] === '_')) j++;
      const id = raw.slice(i, j);
      tokens.push(
        afd_id_count(id).valid
          ? { tipo: 'ID', valor: id }
          : { tipo: 'ERR', valor: id }
      );
      i = j;
      continue;
    }

    if (c === '+') { tokens.push({ tipo: 'OP_ADD', valor: '+' }); i++; continue; }
    if (c === '-') { tokens.push({ tipo: 'OP_ADD', valor: '-' }); i++; continue; }

    if (c === '*') { tokens.push({ tipo: 'OP_MUL', valor: '*' }); i++; continue; }
    if (c === '/') { tokens.push({ tipo: 'OP_MUL', valor: '/' }); i++; continue; }
    if (c === '%') { tokens.push({ tipo: 'OP_MUL', valor: '%' }); i++; continue; }

    if (c === '(') { tokens.push({ tipo: 'PAREN_A' }); i++; continue; }
    if (c === ')') { tokens.push({ tipo: 'PAREN_C' }); i++; continue; }

    tokens.push({ tipo: 'ERR', valor: c });
    i++;
  }

  return tokens;
}

// ── DPDA: Autómata de Pila Determinista para expresiones aritméticas ─────────
//
// Definición formal: M = (Q, Σ, Γ, δ, q₀, Z₀, F)
//
//   Q  = { pc_inicio, pc_unario, pc_operando, pcERR }
//   Σ  = { NUM, ID, OP_ADD, OP_MUL, PAREN_A, PAREN_C }
//   Γ  = { Z₀, PAREN }
//   q₀ = pc_inicio
//   Z₀ = Z₀ (símbolo inicial de pila)
//   F  = { pc_operando }  (aceptación por estado final con pila vacía: pila = [Z₀])
//
// Tabla de transiciones δ(estado, entrada, tope_pila) → (nuevo_estado, operación_pila):
//
//   (pc_inicio,   NUM,          γ)       → (pc_operando, γ)
//   (pc_inicio,   ID,           γ)       → (pc_operando, γ)
//   (pc_inicio,   PAREN_A,     γ)       → (pc_inicio,   push PAREN)
//   (pc_inicio,   OP_ADD('-'), γ)       → (pc_unario,   γ)
//   (pc_unario,   NUM,          γ)       → (pc_operando, γ)
//   (pc_unario,   ID,           γ)       → (pc_operando, γ)
//   (pc_unario,   PAREN_A,     γ)       → (pc_inicio,   push PAREN)
//   (pc_operando, OP_ADD,      γ)       → (pc_inicio,   γ)
//   (pc_operando, OP_MUL,      γ)       → (pc_inicio,   γ)
//   (pc_operando, PAREN_C,     PAREN·γ) → (pc_operando, pop)
//   Cualquier otra combinación           → (pcERR,       γ)
//
// Condición de aceptación: estado ∈ F ∧ pila = [Z₀] ∧ entrada agotada
// ─────────────────────────────────────────────────────────────────────────────

type EstadoPdaCount = 'pc_inicio' | 'pc_unario' | 'pc_operando' | 'pcERR';
type SimboloPilaCount = 'Z0' | 'PAREN';

function pdaExpresionAritmetica(tokens: TokenCount[]): {
  valid: boolean;
  estadoFinal: EstadoParserCount;
  mensaje: string;
} {
  let estado: EstadoPdaCount = 'pc_inicio';
  const pila: SimboloPilaCount[] = ['Z0']; // pila explícita con símbolo inicial

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    switch (estado) {
      case 'pc_inicio':
        if (t.tipo === 'NUM' && afd_num_pos(t.valor).valid) {
          estado = 'pc_operando';
        } else if (t.tipo === 'ID' && afd_id_count(t.valor).valid) {
          estado = 'pc_operando';
        } else if (t.tipo === 'PAREN_A') {
          pila.push('PAREN'); // push
        } else if (
          t.tipo === 'OP_ADD' &&
          (t as { tipo: 'OP_ADD'; valor: string }).valor === '-'
        ) {
          estado = 'pc_unario'; // menos unario (solo uno permitido)
        } else {
          estado = 'pcERR';
        }
        break;

      case 'pc_unario':
        // Tras menos unario solo se acepta átomo o paréntesis (no otro '-')
        if (t.tipo === 'NUM' && afd_num_pos(t.valor).valid) {
          estado = 'pc_operando';
        } else if (t.tipo === 'ID' && afd_id_count(t.valor).valid) {
          estado = 'pc_operando';
        } else if (t.tipo === 'PAREN_A') {
          pila.push('PAREN'); // push
          estado = 'pc_inicio';
        } else {
          estado = 'pcERR';
        }
        break;

      case 'pc_operando':
        if (t.tipo === 'OP_ADD' || t.tipo === 'OP_MUL') {
          estado = 'pc_inicio';
        } else if (t.tipo === 'PAREN_C') {
          // pop: solo si el tope de la pila es PAREN
          if (pila.length > 1 && pila[pila.length - 1] === 'PAREN') {
            pila.pop();
          } else {
            estado = 'pcERR'; // paréntesis de cierre sin apertura
          }
        } else {
          estado = 'pcERR';
        }
        break;
    }

    if (estado === 'pcERR') {
      return {
        valid: false,
        estadoFinal: 'pcERR',
        mensaje: MSG_PARSER_COUNT['pcERR'],
      };
    }
  }

  // Condición de aceptación: estado = pc_operando ∧ pila = [Z₀]
  if (estado === 'pc_operando' && pila.length === 1 && pila[0] === 'Z0') {
    return {
      valid: true,
      estadoFinal: 'pc_expr_valida',
      mensaje: MSG_PARSER_COUNT['pc_expr_valida'],
    };
  }

  // Pila no vacía → paréntesis sin cerrar
  if (pila.length > 1) {
    return {
      valid: false,
      estadoFinal: 'pc_paren_abierto',
      mensaje: MSG_PARSER_COUNT['pc_paren_abierto'],
    };
  }

  // Expresión incompleta (terminó en estado de espera de operando)
  return {
    valid: false,
    estadoFinal: 'pcERR',
    mensaje: (estado === 'pc_inicio' || estado === 'pc_unario')
      ? MSG_PARSER_COUNT['pc_operador']
      : MSG_PARSER_COUNT['pcERR'],
  };
}

export function validarCount(raw: string): ValidacionCount {
  const s = raw.trim();
  if (s === '') {
    return { valid: false, mensaje: 'El campo count está vacío', estadoFinal: 'pc_inicio' };
  }

  const tokens = tokenizarCount(s);

  const tokenErr = tokens.find(t => t.tipo === 'ERR');
  if (tokenErr) {
    return {
      valid: false,
      mensaje: `Carácter inválido: "${tokenErr.valor}"`,
      estadoFinal: 'pcERR',
    };
  }

  return pdaExpresionAritmetica(tokens);
}

export function validarCountSemantico(raw: string): ValidacionCount {
  const s = raw.trim();

  const resNum = afd_num_pos(s);
  if (resNum.valid) {
    const n = parseInt(s, 10);
    return n > 0
      ? { valid: true, mensaje: `Literal entero positivo válido (${n})`, estadoFinal: 'pc_expr_valida' }
      : { valid: false, mensaje: `El count debe ser mayor a 0 (valor: ${n})`, estadoFinal: 'pcERR' };
  }

  if (s.startsWith('-') && afd_num_pos(s.slice(1)).valid) {
    return { valid: false, mensaje: 'Literal negativo no es válido como count', estadoFinal: 'pcERR' };
  }

  return validarCount(s);
}
