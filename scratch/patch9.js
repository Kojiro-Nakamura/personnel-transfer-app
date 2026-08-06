import fs from 'fs';
let content = fs.readFileSync('src/components/ui/CommonUI.jsx', 'utf8');

const t1 = "export const FormInput = ({ label, value, onChange, type = \"text\", disabled = false, placeholder = \"\", className = \"\" }) => (";
const r1 = "export const FormInput = ({ label, value, onChange, type = \"text\", disabled = false, placeholder = \"\", className = \"\", inputClassName = \"\" }) => (";

const t2 = "      className={cx(\"w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]\", disabled ? \"bg-slate-100 text-slate-500\" : \"bg-white\", placeholder ? \"placeholder:text-slate-400\" : \"\")}";
const r2 = "      className={cx(\"w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]\", disabled ? \"bg-slate-100 text-slate-500\" : (inputClassName || \"bg-white\"), placeholder ? \"placeholder:text-slate-400\" : \"\")}";

if(content.includes(t1) && content.includes(t2)) {
  content = content.replace(t1, r1).replace(t2, r2);
  fs.writeFileSync('src/components/ui/CommonUI.jsx', content);
  console.log('Patched FormInput');
} else {
  console.log('Could not patch FormInput');
}
