const fs = require('fs');
let code = fs.readFileSync('src/components/ui/CommonUI.jsx', 'utf8');

// Replace padding, height, text size in Form components
code = code.replace(/text-xs mb-1/g, 'text-[11px] mb-0.5');
code = code.replace(/h-\[34px\] border rounded p-1\.5 text-sm/g, 'h-[28px] border rounded px-1.5 py-1 text-xs');
code = code.replace(/className="flex h-\[32px\] gap-1"/g, 'className="flex h-[28px] gap-1"');
code = code.replace(/h-\[34px\] border rounded p-1\.5/g, 'h-[28px] border rounded px-1.5 py-1');

fs.writeFileSync('src/components/ui/CommonUI.jsx', code);
