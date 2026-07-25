const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const yearInputDef = `
const getEraSuffix = (year) => {
  const y = parseInt(year);
  if (isNaN(y)) return '';
  if (y >= 2019) return \`(R\${y - 2018})\`;
  if (y >= 1989) return \`(H\${y - 1988})\`;
  if (y >= 1926) return \`(S\${y - 1925})\`;
  return '';
};

const YearInput = ({ label, value, onChange }) => (
  <div className="flex flex-col w-full">
    <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
    <div className="relative">
      <input 
        type="text" 
        maxLength={4}
        value={value || ''} 
        onChange={e => {
          const val = e.target.value.replace(/[^0-9]/g, '');
          onChange(val);
        }} 
        placeholder="YYYY"
        className="w-full px-1.5 py-1 text-sm border rounded bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-7" 
      />
      {value && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none tracking-tighter">
          {getEraSuffix(value)}
        </span>
      )}
    </div>
  </div>
);
`;

// Insert the definition before EmployeeModal
content = content.replace(
  /export const EmployeeModal = \(\{ isOpen, onClose, onSave, initialData, departments \}\) => \{/,
  yearInputDef + '\nexport const EmployeeModal = ({ isOpen, onClose, onSave, initialData, departments }) => {'
);

// Update 採用 block
const oldHireBlock = `<div className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-sm font-bold shadow-inner text-center border border-slate-300 h-[30px] flex items-center justify-center">
                  {fd.hireDate ? fd.hireDate.substring(0, 4) : '----'}
                </div>`;
const newHireBlock = `<div className="px-1 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold shadow-inner text-center border border-slate-300 h-[30px] flex items-center justify-center tracking-tighter">
                  {fd.hireDate ? \`\${fd.hireDate.substring(0, 4)}\${getEraSuffix(fd.hireDate.substring(0, 4))}\` : '----'}
                </div>`;
content = content.replace(oldHireBlock, newHireBlock);

// Replace all FormInputs in the promotion grid with YearInput
// Since they all follow a pattern: <div className="w-full"><FormInput label="..." type="number" placeholder="YYYY" value={fd.X} onChange={...} /></div>
// We can use a regex to replace them all.

content = content.replace(
  /<div className="w-full"><FormInput label="([^"]+)" type="number" placeholder="YYYY" value=\{fd\.([^}]+)\} onChange=\{v => setFd\(\{\.\.\.fd, ([^:]+): v\}\)\} \/><\/div>/g,
  '<YearInput label="$1" value={fd.$2} onChange={v => setFd({...fd, $3: v})} />'
);

fs.writeFileSync(file, content, 'utf8');
