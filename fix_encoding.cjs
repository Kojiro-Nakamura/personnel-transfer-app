const fs = require('fs');
let code = fs.readFileSync('src/utils/exportExcel.js', 'utf8');
code = code.replace(/extEmp\.specialCircumstances \? '' \+ extEmp\.specialCircumstances : ''/g, "extEmp.specialCircumstances ? '●' + extEmp.specialCircumstances : ''");
code = code.replace(/currEmp\.specialCircumstances \? '' \+ currEmp\.specialCircumstances : ''/g, "currEmp.specialCircumstances ? '●' + currEmp.specialCircumstances : ''");
fs.writeFileSync('src/utils/exportExcel.js', code);
console.log('done');