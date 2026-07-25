const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldYearInput = `const YearInput = ({ label, value, onChange }) => (
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
);`;

const newYearInput = `const YearInput = ({ label, value, onChange }) => (
  <div className="flex flex-col w-full">
    <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
    <div className="flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden">
      <input 
        type="text" 
        maxLength={4}
        value={value || ''} 
        onChange={e => {
          const val = e.target.value.replace(/[^0-9]/g, '');
          onChange(val);
        }} 
        placeholder="YYYY"
        className="w-[36px] outline-none bg-transparent placeholder-slate-300" 
      />
      {value && (
        <span className="text-[10px] text-slate-600 font-bold tracking-tighter shrink-0 pt-[1px] -ml-0.5 pointer-events-none select-none">
          {getEraSuffix(value)}
        </span>
      )}
    </div>
  </div>
);`;

content = content.replace(oldYearInput, newYearInput);
fs.writeFileSync(file, content, 'utf8');
