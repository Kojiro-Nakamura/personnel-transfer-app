const fs = require('fs');
let code = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

// Restore DateInput
code = code.replace(/h-\[28px\] w-full px-1.5 py-0/g, 'h-[34px] w-full px-1.5 py-0.5');
code = code.replace(/mt-\[-4px\] min-h-\[14px\]/g, 'mt-[-2px] min-h-[14px]');
code = code.replace(/mb-0.5">{label}<\/span>/g, 'mb-1">{label}</span>');

// Make sure çÃóp box matches
code = code.replace(/h-\[36px\] flex flex-col justify-center leading-tight/g, 'h-[34px] flex flex-col justify-center leading-tight');

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', code);
