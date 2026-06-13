import type { UINode } from '../context/ASTContext';
import { printValueToCpp } from '../automata/afd_print';
import { validarYInferirTipo } from '../automata/afd_var_infer';

export function generateCppCode(nodes: Record<string, UINode>, rootNodes: string[]): string {
  let code = '#include <iostream>\n';
  code += '#include <thread>\n';
  code += '#include <chrono>\n';
  code += '#include <vector>\n';
  code += '#include <string>\n\n';
  code += 'using namespace std;\n\n';
  code += 'int main() {\n';
  
  if (rootNodes.length === 0) {
    code += '    // Código generado por CheemScript\n';
    code += '    // woof! woof!\n';
  } else {
    rootNodes.forEach(rootId => {
      code += generateNodeCode(nodes, rootId, 1);
    });
  }
  
  code += '\n    return 0;\n';
  code += '}\n';
  return code;
}

function generateNodeCode(nodes: Record<string, UINode>, nodeId: string, indentLevel: number): string {
  const node = nodes[nodeId];
  if (!node) return '';

  const indent = '    '.repeat(indentLevel);
  let code = '';

  switch (node.type) {
    case 'if': {
      const condition = node.data.condition || 'true';
      code += `${indent}if (${condition}) {\n`;
      
      const bodyIds = node.children['body'] || [];
      bodyIds.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1);
      });
      
      const elseIfs = node.data.elseIfs || [];
      elseIfs.forEach((ei: any) => {
        code += `${indent}} else if (${ei.condition || 'true'}) {\n`;
        const eiBodyIds = node.children[`elseIf_${ei.id}`] || [];
        eiBodyIds.forEach(childId => {
          code += generateNodeCode(nodes, childId, indentLevel + 1);
        });
      });

      if (node.data.hasElse) {
        code += `${indent}} else {\n`;
        const elseBodyIds = node.children['elseBody'] || [];
        elseBodyIds.forEach(childId => {
          code += generateNodeCode(nodes, childId, indentLevel + 1);
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
        code += generateNodeCode(nodes, childId, indentLevel + 1);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'while': {
      const condition = node.data.condition ?? 'true';
      code += `${indent}while (${condition}) {\n`;
      const bodyIds = node.children['body'] || [];
      bodyIds.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'switch': {
      const variable = node.data.variable ?? 'val';
      code += `${indent}switch (${variable}) {\n`;
      const bodyIds = node.children['body'] || [];
      bodyIds.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'var': {
      const dataType = node.data.dataType ?? 'int';
      const name = node.data.name ?? 'x';
      const val = node.data.value ?? '0';
      let formattedVal = val;
      if (dataType === 'string' && !val.startsWith('"') && !val.endsWith('"')) {
        formattedVal = `"${val}"`;
      }
      code += `${indent}${dataType} ${name} = ${formattedVal};\n`;
      break;
    }
    case 'arr': {
      const dataType = node.data.dataType ?? 'int';
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
      code += `${indent}cout << ${question};\n`;
      code += `${indent}cin >> ${variable};\n`;
      break;
    }
    case 'repeat': {
      const count = node.data.count ?? '10';
      code += `${indent}for (int _i_${nodeId.replace(/-/g, '_')} = 0; _i_${nodeId.replace(/-/g, '_')} < ${count}; _i_${nodeId.replace(/-/g, '_')}++) {\n`;
      const bodyIds = node.children['body'] || [];
      bodyIds.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'repeatUntil': {
      const conditionRU = node.data.condition ?? 'true';
      code += `${indent}while (!(${conditionRU})) {\n`;
      const bodyIdsRU = node.children['body'] || [];
      bodyIdsRU.forEach(childId => {
        code += generateNodeCode(nodes, childId, indentLevel + 1);
      });
      code += `${indent}}\n`;
      break;
    }
    case 'say': {
      const valSay = node.data.value ?? '';
      const durSay = node.data.duration ?? '2';
      const cppValSay = printValueToCpp(valSay);
      code += `${indent}cout << ${cppValSay} << endl;\n`;
      code += `${indent}this_thread::sleep_for(chrono::seconds(${durSay}));\n`;
      break;
    }
    case 'ask': {
      const qAsk = node.data.question ?? '';
      const varAsk = node.data.variable ?? 'respuesta';
      code += `${indent}cout << ${qAsk} << endl;\n`;
      code += `${indent}cin >> ${varAsk};\n`;
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
    default:
      code += `${indent}// Unknown block type: ${node.type}\n`;
  }

  return code;
}
