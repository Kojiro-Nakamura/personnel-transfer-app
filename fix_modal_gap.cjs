const fs = require('fs');
let code = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

code = code.replace(/<div className="space-y-3 overflow-y-auto flex-1 pr-2 pb-1">/g, '<div className="space-y-2 overflow-y-auto flex-1 pr-2 pb-1">');
code = code.replace(/<div className="flex flex-col gap-2 w-full">/g, '<div className="flex flex-col gap-1 w-full">');
code = code.replace(/<div className="flex gap-2 w-full">/g, '<div className="flex gap-1 w-full">');
code = code.replace(/<div className="grid grid-cols-2 gap-4">/g, '<div className="grid grid-cols-2 gap-2">');
code = code.replace(/<div className="space-y-2 border rounded-lg p-3/g, '<div className="space-y-1 border rounded-lg p-2');
code = code.replace(/<h4 className="font-bold text-sm text-\[\#065084\] mb-2">/g, '<h4 className="font-bold text-[13px] text-[#065084] mb-1">');
code = code.replace(/<div className="grid grid-cols-4 gap-2">/g, '<div className="grid grid-cols-4 gap-1">');

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', code);
