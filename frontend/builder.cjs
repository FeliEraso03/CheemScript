const fs = require('fs');

const nodes = {};
const rootNodes = [];
const variables = {};

let idCounter = 1;
function genId(prefix) {
  return `${prefix}_${idCounter++}`;
}

function addVar(name, type, val) {
  variables[name] = { name, inferredType: type, blockId: 'gen', firstValue: val, createdAt: Date.now() };
}

function createNode(type, data, children = {}) {
  const id = genId(type);
  nodes[id] = { id, type, data, children };
  return id;
}

const build = {
  arr: (name, type, size) => createNode('arr', { name, type, size }),
  var_new: (name, value) => createNode('var_new', { name, value }),
  set_var: (variable, value) => createNode('set_var', { variable, value }),
  change_var: (variable, amount) => createNode('change_var', { variable, amount }),
  print: (value) => createNode('print', { value }),
  ask: (variable, question) => createNode('ask', { variable, question }),
  say: (value, duration) => createNode('say', { value, duration, unit: 's' }),
  if: (condition, bodyIds, elseBodyIds = []) => {
    const hasElse = elseBodyIds.length > 0;
    return createNode('if', { condition, elseIfs: [], hasElse }, { body: bodyIds, elseBody: elseBodyIds });
  },
  while: (condition, bodyIds) => createNode('while', { condition }, { body: bodyIds }),
  for: (init, condition, increment, bodyIds) => createNode('for', { init, condition, increment }, { body: bodyIds })
};

// --- Variables ---
addVar('totalEstudiantes', 'int', '0');
addVar('opcion', 'int', '0');
addVar('i', 'int', '0');
addVar('buscarCed', 'int', '0');
addVar('encontrado', 'int', '-1');
addVar('aprobados', 'int', '0');
addVar('reprobados', 'int', '0');
addVar('sumaPromedios', 'float', '0.0');
addVar('mejorProm', 'float', '-1.0');
addVar('peorProm', 'float', '6.0');
addVar('idxMejor', 'int', '0');
addVar('idxPeor', 'int', '0');

// --- Arrays ---
const setupNodes = [
  build.arr('cedulas', 'int', '100'),
  build.arr('nombres', 'string', '100'),
  build.arr('edades', 'int', '100'),
  build.arr('grados', 'string', '100'),
  build.arr('nota1', 'float', '100'),
  build.arr('nota2', 'float', '100'),
  build.arr('nota3', 'float', '100'),
  build.arr('promedios', 'float', '100'),
  build.arr('estados', 'string', '100'),
  build.var_new('totalEstudiantes', '0'),
  build.var_new('opcion', '0'),
  build.var_new('i', '0'),
  build.var_new('buscarCed', '0'),
  build.var_new('encontrado', '-1'),
  build.var_new('aprobados', '0'),
  build.var_new('reprobados', '0'),
  build.var_new('sumaPromedios', '0.0'),
  build.var_new('mejorProm', '-1.0'),
  build.var_new('peorProm', '6.0'),
  build.var_new('idxMejor', '0'),
  build.var_new('idxPeor', '0')
];

rootNodes.push(...setupNodes);

// --- Menu Loop ---
const menuLoopBody = [];

menuLoopBody.push(build.print('"================================="'));
menuLoopBody.push(build.print('"       EDUNOTAS++"'));
menuLoopBody.push(build.print('"================================="'));
menuLoopBody.push(build.print('"1. Registrar estudiante"'));
menuLoopBody.push(build.print('"2. Ingresar notas"'));
menuLoopBody.push(build.print('"3. Consultar promedio"'));
menuLoopBody.push(build.print('"4. Listar aprobados y reprobados"'));
menuLoopBody.push(build.print('"5. Buscar por cedula"'));
menuLoopBody.push(build.print('"6. Estadisticas generales"'));
menuLoopBody.push(build.print('"7. Salir"'));
menuLoopBody.push(build.print('"================================="'));
menuLoopBody.push(build.ask('opcion', '"Seleccione una opcion:"'));

// Case 1
const case1 = build.if('opcion == 1', [
  build.print('"--- Registrar Estudiante ---"'),
  build.ask('cedulas[totalEstudiantes]', '"Cedula:"'),
  build.ask('nombres[totalEstudiantes]', '"Nombre:"'),
  build.ask('edades[totalEstudiantes]', '"Edad:"'),
  build.ask('grados[totalEstudiantes]', '"Grado:"'),
  build.change_var('totalEstudiantes', '1'),
  build.print('"Estudiante registrado con exito!"')
]);
menuLoopBody.push(case1);

// Case 2
const case2 = build.if('opcion == 2', [
  build.print('"--- Ingresar Notas ---"'),
  build.ask('buscarCed', '"Ingrese cedula del estudiante:"'),
  build.set_var('encontrado', '-1'),
  build.for('int i = 0', 'i < totalEstudiantes', 'i++', [
    build.if('cedulas[i] == buscarCed', [
      build.set_var('encontrado', 'i')
    ])
  ]),
  build.if('encontrado != -1', [
    build.ask('nota1[encontrado]', '"Nota 1 (0.0 - 5.0):"'),
    build.ask('nota2[encontrado]', '"Nota 2 (0.0 - 5.0):"'),
    build.ask('nota3[encontrado]', '"Nota 3 (0.0 - 5.0):"'),
    build.set_var('promedios[encontrado]', '(nota1[encontrado] + nota2[encontrado] + nota3[encontrado]) / 3.0'),
    build.if('promedios[encontrado] >= 3.0', [
      build.set_var('estados[encontrado]', '"Aprobado"')
    ], [
      build.set_var('estados[encontrado]', '"Reprobado"')
    ]),
    build.print('"Notas guardadas y promedio calculado."')
  ], [
    build.print('"Error: Estudiante no encontrado."')
  ])
]);
menuLoopBody.push(case2);

// Case 3
const case3 = build.if('opcion == 3', [
  build.print('"--- Consultar Promedio ---"'),
  build.ask('buscarCed', '"Ingrese cedula del estudiante:"'),
  build.set_var('encontrado', '-1'),
  build.for('int i = 0', 'i < totalEstudiantes', 'i++', [
    build.if('cedulas[i] == buscarCed', [
      build.set_var('encontrado', 'i')
    ])
  ]),
  build.if('encontrado != -1', [
    build.print('"Nombre: " + nombres[encontrado]'),
    build.print('"Promedio: " + to_string(promedios[encontrado])'),
    build.print('"Estado: " + estados[encontrado]')
  ], [
    build.print('"Error: Estudiante no encontrado."')
  ])
]);
menuLoopBody.push(case3);

// Case 4
const case4 = build.if('opcion == 4', [
  build.print('"--- Listado de Aprobados ---"'),
  build.set_var('aprobados', '0'),
  build.for('int i = 0', 'i < totalEstudiantes', 'i++', [
    build.if('promedios[i] >= 3.0', [
      build.print('nombres[i] + " - " + to_string(promedios[i])'),
      build.change_var('aprobados', '1')
    ])
  ]),
  build.print('"Total aprobados: " + to_string(aprobados)'),
  
  build.print('"--- Listado de Reprobados ---"'),
  build.set_var('reprobados', '0'),
  build.for('int i = 0', 'i < totalEstudiantes', 'i++', [
    build.if('promedios[i] < 3.0', [
      build.print('nombres[i] + " - " + to_string(promedios[i])'),
      build.change_var('reprobados', '1')
    ])
  ]),
  build.print('"Total reprobados: " + to_string(reprobados)')
]);
menuLoopBody.push(case4);

// Case 5
const case5 = build.if('opcion == 5', [
  build.print('"--- Buscar Estudiante ---"'),
  build.ask('buscarCed', '"Ingrese cedula:"'),
  build.set_var('encontrado', '-1'),
  build.for('int i = 0', 'i < totalEstudiantes', 'i++', [
    build.if('cedulas[i] == buscarCed', [
      build.set_var('encontrado', 'i')
    ])
  ]),
  build.if('encontrado != -1', [
    build.print('"Cedula: " + to_string(cedulas[encontrado])'),
    build.print('"Nombre: " + nombres[encontrado]'),
    build.print('"Edad: " + to_string(edades[encontrado])'),
    build.print('"Grado: " + grados[encontrado]'),
    build.print('"Nota 1: " + to_string(nota1[encontrado])'),
    build.print('"Nota 2: " + to_string(nota2[encontrado])'),
    build.print('"Nota 3: " + to_string(nota3[encontrado])'),
    build.print('"Promedio: " + to_string(promedios[encontrado])'),
    build.print('"Estado: " + estados[encontrado]')
  ], [
    build.print('"Estudiante no encontrado."')
  ])
]);
menuLoopBody.push(case5);

// Case 6
const case6 = build.if('opcion == 6', [
  build.print('"--- Estadisticas Generales ---"'),
  build.print('"Total Estudiantes: " + to_string(totalEstudiantes)'),
  build.if('totalEstudiantes > 0', [
    build.set_var('aprobados', '0'),
    build.set_var('reprobados', '0'),
    build.set_var('sumaPromedios', '0.0'),
    build.set_var('mejorProm', '-1.0'),
    build.set_var('peorProm', '6.0'),
    build.set_var('idxMejor', '0'),
    build.set_var('idxPeor', '0'),
    
    build.for('int i = 0', 'i < totalEstudiantes', 'i++', [
      build.if('promedios[i] >= 3.0', [ build.change_var('aprobados', '1') ], [ build.change_var('reprobados', '1') ]),
      build.change_var('sumaPromedios', 'promedios[i]'),
      build.if('promedios[i] > mejorProm', [
        build.set_var('mejorProm', 'promedios[i]'),
        build.set_var('idxMejor', 'i')
      ]),
      build.if('promedios[i] < peorProm', [
        build.set_var('peorProm', 'promedios[i]'),
        build.set_var('idxPeor', 'i')
      ])
    ]),
    
    build.print('"Aprobados: " + to_string(aprobados)'),
    build.print('"Reprobados: " + to_string(reprobados)'),
    build.print('"Promedio General: " + to_string(sumaPromedios / totalEstudiantes)'),
    build.print('"Mejor Promedio: " + nombres[idxMejor] + " (" + to_string(mejorProm) + ")"'),
    build.print('"Peor Promedio: " + nombres[idxPeor] + " (" + to_string(peorProm) + ")"')
  ], [
    build.print('"No hay estudiantes registrados para calcular estadisticas."')
  ])
]);
menuLoopBody.push(case6);

const mainLoop = build.while('opcion != 7', menuLoopBody);
rootNodes.push(mainLoop);
rootNodes.push(build.print('"Saliendo del sistema EduNotas++..."'));

const finalData = { nodes, rootNodes, variables };
fs.writeFileSync('edunotas.json', JSON.stringify(finalData, null, 2));
console.log('Generado edunotas.json!');
