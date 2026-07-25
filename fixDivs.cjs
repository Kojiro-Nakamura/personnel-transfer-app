const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

lines.splice(430, 2);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
