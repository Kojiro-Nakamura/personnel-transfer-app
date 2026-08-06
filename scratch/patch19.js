import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t = `const textColors = ["text-sky-500", "text-orange-500", "text-lime-600"];`;
const r = `const textColors = ["text-[#FF8000]", "text-[#00BFFF]", "text-[#4B0082]"];`;

if (content.includes(t)) {
  content = content.replace(t, r);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Colors replaced successfully');
} else {
  console.log('Target string not found');
}
