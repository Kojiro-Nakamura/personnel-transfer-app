import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const target1 = "const YearInput = ({ label, value, onChange, birthDate }) => {\r\n  let promoAge = null;\r\n  if (birthDate && value && !isNaN(parseInt(value))) {\r\n    promoAge = calculateAge(birthDate, parseInt(value));\r\n  }\r\n  return (\r\n    <div className=\"flex flex-col w-full\">\r\n      <span className=\"text-[11px] font-bold text-slate-600 mb-1\">{label}</span>\r\n      <div className=\"flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden\">";
const replacement1 = "const YearInput = ({ label, value, onChange, birthDate, bgClass }) => {\r\n  let promoAge = null;\r\n  if (birthDate && value && !isNaN(parseInt(value))) {\r\n    promoAge = calculateAge(birthDate, parseInt(value));\r\n  }\r\n  return (\r\n    <div className=\"flex flex-col w-full\">\r\n      <span className=\"text-[11px] font-bold text-slate-600 mb-1\">{label}</span>\r\n      <div className={cx(\"flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden\", bgClass || \"bg-white\")}>";

const target2 = "const YearInput = ({ label, value, onChange, birthDate }) => {\n  let promoAge = null;\n  if (birthDate && value && !isNaN(parseInt(value))) {\n    promoAge = calculateAge(birthDate, parseInt(value));\n  }\n  return (\n    <div className=\"flex flex-col w-full\">\n      <span className=\"text-[11px] font-bold text-slate-600 mb-1\">{label}</span>\n      <div className=\"flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden\">";
const replacement2 = "const YearInput = ({ label, value, onChange, birthDate, bgClass }) => {\n  let promoAge = null;\n  if (birthDate && value && !isNaN(parseInt(value))) {\n    promoAge = calculateAge(birthDate, parseInt(value));\n  }\n  return (\n    <div className=\"flex flex-col w-full\">\n      <span className=\"text-[11px] font-bold text-slate-600 mb-1\">{label}</span>\n      <div className={cx(\"flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden\", bgClass || \"bg-white\")}>";

if(content.includes(target1)) {
  content = content.replace(target1, replacement1);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Fixed YearInput CRLF');
} else if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Fixed YearInput LF');
} else {
  console.log('Not found YearInput');
}
