const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

// prepend 〇 to desiredAssignment
code = code.replace(/extEmp\.desiredAssignment \|\| ''/g, "extEmp.desiredAssignment ? '〇' + extEmp.desiredAssignment : ''");
code = code.replace(/currEmp\.desiredAssignment \|\| ''/g, "currEmp.desiredAssignment ? '〇' + currEmp.desiredAssignment : ''");
code = code.replace(/emp\.desiredAssignment \|\| ''/g, "emp.desiredAssignment ? '〇' + emp.desiredAssignment : ''");

fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');