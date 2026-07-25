const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldHireBlock = `<div className="px-1 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold shadow-inner text-center border border-slate-300 h-[30px] flex items-center justify-center tracking-tighter">
                  {fd.hireDate ? \`\${fd.hireDate.substring(0, 4)} \${getEraSuffix(fd.hireDate.substring(0, 4))}\` : '----'}
                </div>`;

const newHireBlock = `<div className="px-1 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold shadow-inner border border-slate-300 h-[30px] flex items-center justify-center tracking-tighter overflow-hidden">
                  {fd.hireDate ? (
                    <div className="flex items-baseline">
                      <span>{fd.hireDate.substring(0, 4)}</span>
                      <span className="ml-2 text-[10px] text-slate-500 font-bold">{getEraSuffix(fd.hireDate.substring(0, 4))}</span>
                    </div>
                  ) : '----'}
                </div>`;

content = content.replace(oldHireBlock, newHireBlock);
fs.writeFileSync(file, content, 'utf8');
