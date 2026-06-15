

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

function parseSum(tokens: TokenCount[], pos: number): [boolean, number] {
  let [ok, cur] = parseTerm(tokens, pos);
  if (!ok) return [false, pos];

  while (cur < tokens.length && tokens[cur].tipo === 'OP_ADD') {
    const [ok2, cur2] = parseTerm(tokens, cur + 1);
    if (!ok2) return [false, pos];
    cur = cur2;
  }

  return [true, cur];
}

function parseTerm(tokens: TokenCount[], pos: number): [boolean, number] {
  let [ok, cur] = parseFactor(tokens, pos);
  if (!ok) return [false, pos];

  while (cur < tokens.length && tokens[cur].tipo === 'OP_MUL') {
    const [ok2, cur2] = parseFactor(tokens, cur + 1);
    if (!ok2) return [false, pos];
    cur = cur2;
  }

  return [true, cur];
}

function parseFactor(tokens: TokenCount[], pos: number): [boolean, number] {
  let cur = pos;

  if (cur < tokens.length &&
      tokens[cur].tipo === 'OP_ADD' &&
      (tokens[cur] as { tipo: 'OP_ADD'; valor: string }).valor === '-') {
    cur++;
  }

  return parseAtom(tokens, cur);
}

function parseAtom(tokens: TokenCount[], pos: number): [boolean, number] {
  if (pos >= tokens.length) return [false, pos];

  const t = tokens[pos];

  if (t.tipo === 'NUM') {
    return afd_num_pos(t.valor).valid ? [true, pos + 1] : [false, pos];
  }

  if (t.tipo === 'ID') {
    return afd_id_count(t.valor).valid ? [true, pos + 1] : [false, pos];
  }

  if (t.tipo === 'PAREN_A') {
    const [ok, cur] = parseSum(tokens, pos + 1);
    if (!ok) return [false, pos];
    if (cur >= tokens.length || tokens[cur].tipo !== 'PAREN_C') return [false, pos];
    return [true, cur + 1];
  }

  return [false, pos];
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

  const [ok, consumidos] = parseSum(tokens, 0);
  const todosConsumidos = ok && consumidos === tokens.length;

  if (!ok) {
    return {
      valid: false,
      mensaje: MSG_PARSER_COUNT['pcERR'],
      estadoFinal: 'pcERR',
    };
  }

  if (!todosConsumidos) {
    return {
      valid: false,
      mensaje: `Tokens sobrantes después de la expresión`,
      estadoFinal: 'pcERR',
    };
  }

  return {
    valid: true,
    mensaje: MSG_PARSER_COUNT['pc_expr_valida'],
    estadoFinal: 'pc_expr_valida',
  };
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
