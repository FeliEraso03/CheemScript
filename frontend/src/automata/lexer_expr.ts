export type TokenExpr =
  | { tipo: 'ID'; valor: string }
  | { tipo: 'NUM'; valor: number }
  | { tipo: 'STR'; valor: string }
  | { tipo: 'BOOL'; valor: boolean }
  | { tipo: 'OP_REL'; valor: '<' | '>' | '<=' | '>=' | '==' | '!=' }
  | { tipo: 'OP_LOG'; valor: '&&' | '||' }
  | { tipo: 'NOT' }
  | { tipo: 'PAREN_A' }
  | { tipo: 'PAREN_C' };

export interface LexerResult {
  valid: boolean;
  tokens: TokenExpr[];
  errorMsg?: string;
}

/**
 * Escanea un string y lo convierte en una lista de tokens para el parser de expresiones.
 */
export function tokenizeExpr(input: string): LexerResult {
  const tokens: TokenExpr[] = [];
  let i = 0;

  // Saltamos espacios
  const saltarEspacios = () => {
    while (i < input.length && /\s/.test(input[i])) {
      i++;
    }
  };

  while (i < input.length) {
    saltarEspacios();
    if (i >= input.length) break;

    const char = input[i];
    const substr = input.substring(i);

    // Parentesis
    if (char === '(') {
      tokens.push({ tipo: 'PAREN_A' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ tipo: 'PAREN_C' });
      i++;
      continue;
    }

    // Operadores Logicos
    if (substr.startsWith('&&')) {
      tokens.push({ tipo: 'OP_LOG', valor: '&&' });
      i += 2;
      continue;
    }
    if (substr.startsWith('||')) {
      tokens.push({ tipo: 'OP_LOG', valor: '||' });
      i += 2;
      continue;
    }

    // Negacion
    if (char === '!') {
      // Verificamos si no es un !=
      if (substr.startsWith('!=')) {
        tokens.push({ tipo: 'OP_REL', valor: '!=' });
        i += 2;
      } else {
        tokens.push({ tipo: 'NOT' });
        i++;
      }
      continue;
    }

    // Operadores Relacionales
    if (substr.startsWith('==') || substr.startsWith('<=') || substr.startsWith('>=')) {
      tokens.push({ tipo: 'OP_REL', valor: substr.substring(0, 2) as any });
      i += 2;
      continue;
    }
    if (char === '<' || char === '>') {
      tokens.push({ tipo: 'OP_REL', valor: char as any });
      i++;
      continue;
    }

    // Strings
    if (char === '"' || char === "'") {
      const comilla = char;
      let j = i + 1;
      let strVal = '';
      while (j < input.length && input[j] !== comilla) {
        strVal += input[j];
        j++;
      }
      if (j >= input.length) {
        return { valid: false, tokens, errorMsg: `Error lexico: String sin cerrar en pos ${i}` };
      }
      tokens.push({ tipo: 'STR', valor: strVal });
      i = j + 1;
      continue;
    }

    // Numeros
    if (/[0-9]/.test(char)) {
      let numStr = '';
      while (i < input.length && /[0-9.]/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      const num = Number(numStr);
      if (isNaN(num)) {
        return { valid: false, tokens, errorMsg: `Error lexico: Numero invalido "${numStr}"` };
      }
      tokens.push({ tipo: 'NUM', valor: num });
      continue;
    }

    // Identificadores y Booleanos
    if (/[a-zA-Z_]/.test(char)) {
      let idStr = '';
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        idStr += input[i];
        i++;
      }
      
      if (idStr === 'true') {
        tokens.push({ tipo: 'BOOL', valor: true });
      } else if (idStr === 'false') {
        tokens.push({ tipo: 'BOOL', valor: false });
      } else {
        tokens.push({ tipo: 'ID', valor: idStr });
      }
      continue;
    }

    // Caracter no reconocido
    return { valid: false, tokens, errorMsg: `Error lexico: Caracter inesperado "${char}" en pos ${i}` };
  }

  return { valid: true, tokens };
}
