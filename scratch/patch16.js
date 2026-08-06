import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t = `const textColors = ["text-red-600", "text-blue-700", "text-emerald-700"];`;
const r = `const textColors = ["text-blue-700", "text-orange-600", "text-fuchsia-700"];`;

if (content.includes(t)) {
  content = content.replace(t, r);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Colors replaced successfully');
} else {
  console.log('Target string not found');
}
