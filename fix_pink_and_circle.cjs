const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// Darker pink
code = code.replace(/argb = 'FFFCE7F3'; \/\/ Pink 100/g, "argb = 'FFFBCFE8'; // Pink 200");

// add Åú to special circumstances
code = code.replace(/rowVals\.push\(extEmp\.specialCircumstances \|\| ''\);/g, "rowVals.push(extEmp.specialCircumstances ? 'Åú' + extEmp.specialCircumstances : '');");
code = code.replace(/rowVals\[2\] = currEmp\.specialCircumstances \|\| '';/g, "rowVals[2] = currEmp.specialCircumstances ? 'Åú' + currEmp.specialCircumstances : '';");
code = code.replace(/emp\.specialCircumstances \|\| '',/g, "emp.specialCircumstances ? 'Åú' + emp.specialCircumstances : '',");

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');
