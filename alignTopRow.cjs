const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldTopRow = `<div className="flex flex-wrap gap-2">
            <FormInput label="職員番号" value={fd.employeeNumber} onChange={v => setFd({...fd, employeeNumber: v})} className="w-[75px]" />
            <FormInput label="氏名" value={fd.name} onChange={v => setFd({...fd, name: v})} className="w-[100px]" />
            <FormInput label="生年月日" type="date" value={fd.birthDate} onChange={v => setFd({...fd, birthDate: v})} className="w-[115px]" />
            <FormInput label="学歴" value={fd.education} onChange={v => setFd({...fd, education: v})} className="w-[90px]" />
            <FormInput label="採用年月" type="date" value={fd.hireDate} onChange={v => setFd({...fd, hireDate: v})} className="w-[115px]" />
            <FormInput label="特記事項" value={fd.note} onChange={v => setFd({...fd, note: v})} className="flex-1 min-w-[100px]" />
          </div>`;

const newTopRow = `<div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <FormInput label="職員番号" value={fd.employeeNumber} onChange={v => setFd({...fd, employeeNumber: v})} className="w-[75px] shrink-0" />
              <FormInput label="氏名" value={fd.name} onChange={v => setFd({...fd, name: v})} className="flex-1 min-w-0" />
              <FormInput label="生年月日" type="date" value={fd.birthDate} onChange={v => setFd({...fd, birthDate: v})} className="w-[115px] shrink-0" />
              <FormInput label="学歴" value={fd.education} onChange={v => setFd({...fd, education: v})} className="flex-1 min-w-0" />
              <FormInput label="採用年月" type="date" value={fd.hireDate} onChange={v => setFd({...fd, hireDate: v})} className="w-[115px] shrink-0" />
            </div>
            <FormInput label="特記事項" value={fd.note} onChange={v => setFd({...fd, note: v})} className="w-full" />
          </div>`;

content = content.replace(oldTopRow, newTopRow);

fs.writeFileSync(file, content, 'utf8');
