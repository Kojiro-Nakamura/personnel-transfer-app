import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const target1 = "                  const isLast = i === arr.length - 1;\r\n                  const isRowStart = i % 5 === 0 && i !== 0;\r\n                  return (\r\n                    <div key={i} className=\"relative flex flex-col bg-white border px-2 py-1 rounded shadow-sm w-full min-w-0\" title={h.department || '-'}>";
const replacement1 = "                  const isLast = i === arr.length - 1;\r\n                  const isRowStart = i % 5 === 0 && i !== 0;\r\n                  const cellBg = (h.isNext && isPromoted) ? promoBg : \"bg-white\";\r\n                  return (\r\n                    <div key={i} className={cx(\"relative flex flex-col border px-2 py-1 rounded shadow-sm w-full min-w-0\", cellBg)} title={h.department || '-'}>";

const target2 = "                  const isLast = i === arr.length - 1;\n                  const isRowStart = i % 5 === 0 && i !== 0;\n                  return (\n                    <div key={i} className=\"relative flex flex-col bg-white border px-2 py-1 rounded shadow-sm w-full min-w-0\" title={h.department || '-'}>";
const replacement2 = "                  const isLast = i === arr.length - 1;\n                  const isRowStart = i % 5 === 0 && i !== 0;\n                  const cellBg = (h.isNext && isPromoted) ? promoBg : \"bg-white\";\n                  return (\n                    <div key={i} className={cx(\"relative flex flex-col border px-2 py-1 rounded shadow-sm w-full min-w-0\", cellBg)} title={h.department || '-'}>";

if(content.includes(target1)) {
  content = content.replace(target1, replacement1);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Fixed history CRLF');
} else if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Fixed history LF');
} else {
  console.log('Not found history');
}
