const fs = require('fs');
let code = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

code = code.replace(/h-\[36px\] w-full px-1.5 py-0.5/g, 'h-[28px] w-full px-1.5 py-0');
code = code.replace(/mb-1"><\/div>/g, 'mb-0.5"></div>'); // oops this might not match exactly.
code = code.replace(/mb-1">{label}<\/span>/g, 'mb-0.5">{label}</span>');
code = code.replace(/mt-\[-2px\] min-h-\[14px\]/g, 'mt-[-4px] min-h-[14px]');
code = code.replace(/p-2.5 mt-3/g, 'p-1.5 mt-1.5');
code = code.replace(/gap-y-2 gap-x-4 pl-4/g, 'gap-y-1 gap-x-3 pl-3');
code = code.replace(/<h4 className="font-bold text-sm text-slate-900 mb-2">—š—ð<\/h4>/g, '<h4 className="font-bold text-[13px] text-slate-900 mb-1">—š—ð</h4>');

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', code);
