const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldSpan = `<span className="text-[10px] text-slate-600 font-bold tracking-tighter shrink-0 pt-[1px] -ml-0.5 pointer-events-none select-none">
          {getEraSuffix(value)}
        </span>`;

const newSpan = `<span className="text-[10px] text-slate-500 font-bold tracking-tighter shrink-0 pt-[1px] ml-1 pointer-events-none select-none">
          {getEraSuffix(value)}
        </span>`;

content = content.replace(oldSpan, newSpan);

// Also check the Hire Date block (採用) to match the slight spacing.
// Wait, the hire date block currently looks like:
// {fd.hireDate ? `${fd.hireDate.substring(0, 4)}${getEraSuffix(fd.hireDate.substring(0, 4))}` : '----'}
// I can add a small space in the string:
// {fd.hireDate ? `${fd.hireDate.substring(0, 4)} ${getEraSuffix(fd.hireDate.substring(0, 4))}` : '----'}

const oldHireStr = `\`\${fd.hireDate.substring(0, 4)}\${getEraSuffix(fd.hireDate.substring(0, 4))}\``;
const newHireStr = `\`\${fd.hireDate.substring(0, 4)} \${getEraSuffix(fd.hireDate.substring(0, 4))}\``;
content = content.replace(oldHireStr, newHireStr);

fs.writeFileSync(file, content, 'utf8');
