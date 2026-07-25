const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < 20; i++) {
  if (lines[i].includes('ArrowDown, ChevronDown')) {
    lines[i] = lines[i].replace('ArrowDown, ChevronDown', 'ArrowDown, ArrowRight, ChevronDown');
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
