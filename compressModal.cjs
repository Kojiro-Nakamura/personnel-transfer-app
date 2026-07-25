const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. EmployeeFormSection compressions
content = content.replace(
  /<div className={cx\("p-3 rounded border flex flex-col"/,
  '<div className={cx("p-2 rounded border flex flex-col"'
);
content = content.replace(
  /<div className="flex justify-between items-center mb-2 border-b pb-1">/,
  '<div className="flex justify-between items-center mb-1.5 border-b pb-1">'
);
content = content.replace(
  /<div className="space-y-2">/,
  '<div className="space-y-1.5">'
);

// 2. EmployeeModal compressions and Top Row fixes
content = content.replace(
  /<div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-2">/,
  '<div className="space-y-3 overflow-y-auto flex-1 pr-2 pb-1">'
);

content = content.replace(
  /<div className="flex gap-4">/,
  '<div className="flex flex-wrap gap-2">'
);

content = content.replace(
  /<FormInput label="職員番号" value=\{fd.employeeNumber\} onChange=\{v => setFd\(\{\.\.\.fd, employeeNumber: v\}\)\} className="w-24" \/>/,
  '<FormInput label="職員番号" value={fd.employeeNumber} onChange={v => setFd({...fd, employeeNumber: v})} className="w-[75px]" />'
);

content = content.replace(
  /<FormInput label="氏名" value=\{fd.name\} onChange=\{v => setFd\(\{\.\.\.fd, name: v\}\)\} className="w-32" \/>/,
  '<FormInput label="氏名" value={fd.name} onChange={v => setFd({...fd, name: v})} className="w-[100px]" />'
);

content = content.replace(
  /<FormInput label="生年月日" type="date" value=\{fd.birthDate\} onChange=\{v => setFd\(\{\.\.\.fd, birthDate: v\}\)\} className="w-32" \/>/,
  '<FormInput label="生年月日" type="date" value={fd.birthDate} onChange={v => setFd({...fd, birthDate: v})} className="w-[115px]" />'
);

content = content.replace(
  /<FormInput label="学歴" value=\{fd.education\} onChange=\{v => setFd\(\{\.\.\.fd, education: v\}\)\} className="w-32" \/>/,
  '<FormInput label="学歴" value={fd.education} onChange={v => setFd({...fd, education: v})} className="w-[90px]" />'
);

content = content.replace(
  /<FormInput label="採用年月" type="date" value=\{fd.hireDate\} onChange=\{v => setFd\(\{\.\.\.fd, hireDate: v\}\)\} className="w-32" \/>/,
  '<FormInput label="採用年月" type="date" value={fd.hireDate} onChange={v => setFd({...fd, hireDate: v})} className="w-[115px]" />'
);

content = content.replace(
  /<FormInput label="備考\(休\)" value=\{fd.note\} onChange=\{v => setFd\(\{\.\.\.fd, note: v\}\)\} className="flex-1" \/>/,
  '<FormInput label="備考(休)" value={fd.note} onChange={v => setFd({...fd, note: v})} className="flex-1 min-w-[100px]" />'
);

content = content.replace(
  /<div className="border border-slate-300 rounded p-3 mt-4 mb-4 bg-slate-50\/50">/,
  '<div className="border border-slate-300 rounded p-2.5 my-3 bg-slate-50/50">'
);

content = content.replace(
  /<h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">/,
  '<h4 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2">'
);

content = content.replace(
  /<div className="grid grid-cols-\[85px_1fr_85px_1fr_85px_1fr_85px_1fr_85px_1fr\] gap-y-5 items-end justify-items-center">/,
  '<div className="grid grid-cols-[85px_1fr_85px_1fr_85px_1fr_85px_1fr_85px_1fr] gap-y-3 items-end justify-items-center">'
);

content = content.replace(
  /<div className="grid grid-cols-2 gap-4">/,
  '<div className="grid grid-cols-2 gap-3">'
);

content = content.replace(
  /<div className="mt-4 pt-4 border-t flex justify-end gap-3">/,
  '<div className="mt-3 pt-3 border-t flex justify-end gap-3">'
);


fs.writeFileSync(file, content, 'utf8');
