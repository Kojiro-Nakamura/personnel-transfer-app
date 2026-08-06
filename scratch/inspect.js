import fs from 'fs';
const lines = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes('<div className="fixed inset-0 bg-black/50 flex'));
console.log(lines.slice(start - 10, start + 5).join('\n'));
