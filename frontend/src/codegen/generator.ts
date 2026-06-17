import type { UINode, VariableEntry } from '../context/ASTContext';
import { printValueToCpp } from '../automata/afd_print';
import { validarYInferirTipo } from '../automata/afd_var_infer';

export interface CodeGenResult {
  code: string;
  sourceMap: Record<string, number>;
}

export function generateCppCode(
  nodes: Record<string, UINode>,
  rootNodes: string[],
  variables: Record<string, VariableEntry>,
  isTracingEnabled: boolean = false
): CodeGenResult {
  let code = '#include <iostream>\n';
  code += '#include <thread>\n';
  code += '#include <chrono>\n';
  code += '#include <vector>\n';
  code += '#include <string>\n';
  code += '#include <limits>\n';
  code += '#include <random>\n';
  code += '#include <cmath>\n\n';
  code += 'using namespace std;\n\n';
  code += 'int main() {\n';
  code += '    random_device rd;\n';
  code += '    mt19937 gen(rd());\n\n';
  
  if (rootNodes.length === 0) {
    code += '    // Código generado por CheemScript\n';
    code += '    // woof! woof!\n';
  } else {
    rootNodes.forEach(rootId => {
      code += generateNodeCode(nodes, rootId, 1, variables, isTracingEnabled);
    });
  }
  
  code += '\n    return 0;\n';
  code += '}\n';

  const sourceMap: Record<string, number> = {};
  const lines = code.split('\n');
  const finalLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const mapMatch = lines[i].match(/\/\/__MAP_(.+)/);
    if (mapMatch) {
      sourceMap[mapMatch[1]] = finalLines.length + 1;
    } else {
      finalLines.push(lines[i]);
    }
  }

  return { code: finalLines.join('\n'), sourceMap };
}

function generateNodeCode(
  nodes: Record<string, UINode>,
  nodeId: string,
  indentLevel: number,
  variables: Record<string, VariableEntry>,
  isTracingEnabled: boolean
): string {
  const node = nodes[nodeId];
  if (!node) return '';

  const indent = '    '.repeat(indentLevel);
  let code = '';

  // Always inject source map marker
  code += `${indent}//__MAP_${nodeId}\n`;

  if (isTracingEnabled) {
    code += `${indent}cout << "__CHEEMS_TRACE__${nodeId}" << endl;\n`;
  }

  switch (node.type) {
    case 'if': {
      const condition = node.data.condition || 'true';
      code += `${indent}if (${condition}) {\n`;
      
      const bodyIds = node.children['body'] || [];
      bodyIds.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1, variables, isTracingEnabled);
      });
      
      const elseIfs = node.data.elseIfs || [];
      elseIfs.forEach((ei: any) => {
        code += `${indent}} else if (${ei.condition || 'true'}) {\n`;
        const eiBodyIds = node.children[`elseIf_${ei.id}`] || [];
        eiBodyIds.forEach(childId => {
          code += generateNodeCode(nodes, childId, indentLevel + 1, variables, isTracingEnabled);
        });
      });

      if (node.data.hasElse) {
        code += `${indent}} else {\n`;
        const elseBodyIds = node.children['elseBody'] || [];
        elseBodyIds.forEach(childId => {
          code += generateNodeCode(nodes, childId, indentLevel + 1, variables, isTracingEnabled);
        });
      }
      
      code += `${indent}}\n`;
      break;
    }
    case 'for': {
      const init = node.data.init ?? 'int i = 0';
      const condition = node.data.condition ?? 'i < 10';
      const increment = node.data.increment ?? 'i++';
      code += `${indent}for (${init}; ${condition}; ${increment}) {\n`;
      const bodyIds = node.children['body'] || [];
      bodyIds.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1, variables, isTracingEnabled);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'while': {
      const condition = node.data.condition ?? 'true';
      code += `${indent}while (${condition}) {\n`;
      const bodyIds = node.children['body'] || [];
      bodyIds.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1, variables, isTracingEnabled);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'switch': {
      const variable = node.data.variable ?? 'val';
      code += `${indent}switch (${variable}) {\n`;
      const cases = node.data.cases || [];
      const hasDefault = node.data.hasDefault || false;

      cases.forEach((c: any) => {
        code += `${indent}  case ${c.value}:\n`;
        const caseBodyIds = node.children[`case_${c.id}`] || [];
        if (caseBodyIds.length > 0) {
          code += `${indent}  {\n`;
          caseBodyIds.forEach((childId: string) => {
            code += generateNodeCode(nodes, childId, indentLevel + 2, variables, isTracingEnabled);
          });
          code += `${indent}    break;\n`;
          code += `${indent}  }\n`;
        } else {
          code += `${indent}    break;\n`;
        }
      });

      if (hasDefault) {
        code += `${indent}  default:\n`;
        const defBodyIds = node.children['default'] || [];
        if (defBodyIds.length > 0) {
          code += `${indent}  {\n`;
          defBodyIds.forEach((childId: string) => {
            code += generateNodeCode(nodes, childId, indentLevel + 2, variables, isTracingEnabled);
          });
          code += `${indent}    break;\n`;
          code += `${indent}  }\n`;
        } else {
          code += `${indent}    break;\n`;
        }
      }

      code += `${indent}}\n`;
      break;
    }
    case 'var': {
      const name = node.data.name ?? 'x';
      const variableDef = variables[name];
      const dataType = node.data.dataType ?? variableDef?.inferredType ?? 'int';
      const val = node.data.value ?? '0';
      let formattedVal = val;
      if (dataType === 'string' && !val.startsWith('"') && !val.endsWith('"')) {
        formattedVal = `"${val}"`;
      }
      code += `${indent}${dataType} ${name} = ${formattedVal};\n`;
      break;
    }
    case 'arr': {
      const dataType = node.data.dataType ?? node.data.type ?? 'int';
      const name = node.data.name ?? 'arr';
      const size = node.data.size ?? '5';
      const values = node.data.values ?? '';
      if (values.trim()) {
        code += `${indent}${dataType} ${name}[${size}] = {${values}};\n`;
      } else {
        code += `${indent}${dataType} ${name}[${size}];\n`;
      }
      break;
    }
    case 'mat': {
      const dataType = node.data.dataType ?? 'int';
      const name = node.data.name ?? 'mat';
      const rows = node.data.rows ?? '3';
      const cols = node.data.cols ?? '3';
      code += `${indent}${dataType} ${name}[${rows}][${cols}];\n`;
      break;
    }
    case 'print': {
      const val = node.data.value ?? '';
      const cppVal = printValueToCpp(val);
      code += `${indent}cout << ${cppVal} << endl;\n`;
      break;
    }
    case 'input': {
      const question = node.data.question ?? '';
      const variable = node.data.variable ?? '';
      const isString = variables[variable]?.inferredType === 'string';
      code += `${indent}cout << ${question};\n`;
      if (isString) {
        code += `${indent}cin.ignore(numeric_limits<streamsize>::max(), '\\n');\n`;
        code += `${indent}getline(cin, ${variable});\n`;
      } else {
        code += `${indent}cin >> ${variable};\n`;
      }
      break;
    }
    case 'repeat': {
      const count = node.data.count ?? '10';
      const iter = node.data.iterator?.trim() || 'i';
      code += `${indent}for (int ${iter} = 0; ${iter} < ${count}; ${iter}++) {\n`;
      const bodyIds = node.children['body'] || [];
      bodyIds.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1, variables, isTracingEnabled);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'repeatUntil': {
      const conditionRU = node.data.condition ?? 'true';
      code += `${indent}while (!(${conditionRU})) {\n`;
      const bodyIdsRU = node.children['body'] || [];
      bodyIdsRU.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1, variables, isTracingEnabled);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'say': {
      const valSay = node.data.value ?? '';
      const durSay = node.data.duration ?? '2';
      const unitSay = node.data.unit ?? 's';
      const cppValSay = printValueToCpp(valSay);
      code += `${indent}cout << ${cppValSay} << endl;\n`;
      if (unitSay === 's') {
        code += `${indent}this_thread::sleep_for(chrono::seconds(${durSay}));\n`;
      } else {
        code += `${indent}this_thread::sleep_for(chrono::milliseconds(${durSay}));\n`;
      }
      code += `${indent}cout << "__CHEEMS_CLEAR__" << endl;\n`;
      break;
    }
    case 'ask': {
      const qAsk = node.data.question ?? '';
      const varAsk = node.data.variable ?? 'respuesta';
      const isStringAsk = variables[varAsk]?.inferredType === 'string';
      code += `${indent}cout << ${qAsk} << endl;\n`;
      if (isStringAsk) {
        code += `${indent}cin.ignore(numeric_limits<streamsize>::max(), '\\n');\n`;
        code += `${indent}getline(cin, ${varAsk});\n`;
      } else {
        code += `${indent}cin >> ${varAsk};\n`;
      }
      break;
    }
    case 'wait': {
      const durWait = node.data.duration ?? '1';
      const unitWait = node.data.unit ?? 's';
      if (unitWait === 's') {
        code += `${indent}this_thread::sleep_for(chrono::seconds(${durWait}));\n`;
      } else {
        code += `${indent}this_thread::sleep_for(chrono::milliseconds(${durWait}));\n`;
      }
      break;
    }
    case 'list': {
      const nameList = node.data.name ?? 'lista';
      const valuesList = node.data.values ?? '';
      const elements = valuesList ? valuesList.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
      let listType = 'int';
      if (elements.length > 0) {
        const t = validarYInferirTipo(elements[0]);
        listType = t === 'unknown' ? 'int' : t;
      }
      if (elements.length > 0) {
        code += `${indent}vector<${listType}> ${nameList} = {${valuesList}};\n`;
      } else {
        code += `${indent}vector<${listType}> ${nameList};\n`;
      }
      break;
    }
    case 'var_new': {
      const nameV = node.data.name ?? 'x';
      const valueV = node.data.value ?? '0';
      const inferredType = validarYInferirTipo(valueV);
      if (inferredType === 'unknown') {
        console.warn(`generateNodeCode[${nodeId}]: No se pudo inferir tipo para "${valueV}", se usara int como fallback`);
        code += `${indent}int ${nameV} = ${valueV};\n`;
      } else {
        code += `${indent}${inferredType} ${nameV} = ${valueV};\n`;
      }
      break;
    }
    case 'sleep': {
      const duration = node.data.duration ?? '1000';
      code += `${indent}this_thread::sleep_for(chrono::milliseconds(${duration}));\n`;
      break;
    }
    case 'set_var': {
      const varName = node.data.variable ?? '';
      const val = node.data.value ?? '';
      code += `${indent}${varName} = ${val};\n`;
      break;
    }
    case 'change_var': {
      const cvName = node.data.variable ?? '';
      const amt = node.data.amount ?? '1';
      code += `${indent}${cvName} += ${amt};\n`;
      break;
    }
    case 'show_var': {
      const svName = node.data.variable ?? '';
      code += `${indent}cout << ${svName} << endl;\n`;
      break;
    }
    case 'random': {
      const varName = node.data.variable ?? '';
      const min = node.data.min ?? '1';
      const max = node.data.max ?? '100';
      const dataType = node.data.dataType ?? 'int';
      const decimals = node.data.decimals ?? '2';

      if (dataType === 'int') {
        code += `${indent}uniform_int_distribution<int> dist(${min}, ${max});\n`;
        code += `${indent}${varName} = dist(gen);\n`;
      } else {
        code += `${indent}uniform_real_distribution<double> dist(${min}, ${max});\n`;
        code += `${indent}double raw = dist(gen);\n`;
        code += `${indent}${varName} = round(raw * pow(10, ${decimals})) / pow(10, ${decimals});\n`;
      }
      break;
    }
    default:
      code += `${indent}// Unknown block type: ${node.type}\n`;
  }

  return code;
}
