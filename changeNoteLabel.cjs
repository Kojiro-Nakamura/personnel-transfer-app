const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<FormInput label="備考\(休\)" value=\{fd\.note\} onChange=\{v => setFd\(\{\.\.\.fd, note: v\}\)\} className="flex-1 min-w-\[100px\]" \/>/g,
  '<FormInput label="特記事項" value={fd.note} onChange={v => setFd({...fd, note: v})} className="flex-1 min-w-[100px]" />'
);

fs.writeFileSync(file, content, 'utf8');
