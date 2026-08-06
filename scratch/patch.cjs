const fs = require('fs');
let content = fs.readFileSync('src/components/ui/CommonUI.jsx', 'utf8');

const target = `export const FormSelect = ({ label, value, onChange, options, disabled = false, className = "" }) => (
  <div className={className}>
    <label className={cx("block text-xs mb-1", disabled ? "text-slate-400" : "text-slate-600")}>{label}</label>
    <select 
      value={value !== undefined ? value : ''} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      className={cx("w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : "bg-white")}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);`;

const replacement = `export const FormSelect = ({ label, value, onChange, options, disabled = false, className = "", selectClassName = "" }) => (
  <div className={className}>
    <label className={cx("block text-xs mb-1", disabled ? "text-slate-400" : "text-slate-600")}>{label}</label>
    <select 
      value={value !== undefined ? value : ''} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      className={cx("w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : (selectClassName || "bg-white"))}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);`;

// Handle possible \r\n differences
const regexTarget = target.replace(/\r?\n/g, '\\r?\\n').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\+/g, '\\+').replace(/\?/g, '\\?').replace(/\./g, '\\.');

const match = content.match(new RegExp(regexTarget));

if (match) {
  content = content.replace(new RegExp(regexTarget), replacement);
  fs.writeFileSync('src/components/ui/CommonUI.jsx', content);
  console.log('Successfully patched FormSelect.');
} else {
  console.log('Target not found.');
}
