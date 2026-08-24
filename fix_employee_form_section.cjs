const fs = require('fs');
let code = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

code = code.replace(/<div className="space-y-1.5">/g, '<div className="space-y-1">');
code = code.replace(/<div className="flex gap-2">/g, '<div className="flex gap-1">');
code = code.replace(/<label className="block text-xs mb-1">配置先<\/label>/g, '<label className="block text-[11px] mb-0.5">配置先</label>');
code = code.replace(/<h4 className={cx\("font-bold text-sm"/g, '<h4 className={cx("font-bold text-[13px]"');
code = code.replace(/<div className="space-y-2 border rounded-lg p-3/g, '<div className="space-y-1 border rounded-lg p-2');

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', code);
