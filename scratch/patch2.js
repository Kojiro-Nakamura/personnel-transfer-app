import fs from 'fs';
let content = fs.readFileSync('src/components/ui/CommonUI.jsx', 'utf8');

const newContent = content.replace(
  'export const FormSelect = ({ label, value, onChange, options, disabled = false, className = "" }) => (',
  'export const FormSelect = ({ label, value, onChange, options, disabled = false, className = "", selectClassName = "" }) => ('
).replace(
  'className={cx("w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : "bg-white")}',
  'className={cx("w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : (selectClassName || "bg-white"))}'
);

fs.writeFileSync('src/components/ui/CommonUI.jsx', newContent);
console.log('Patched');
