import fs from 'fs';
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const t = `    .filter-container { margin-bottom:16px; font-family:sans-serif; font-size:14px; background:#fff; padding:12px; border:1px solid #e2e8f0; border-radius:6px; display:inline-block; } 
    .filter-container label { margin-right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size: 13px; }`;
const r = `    .filter-container { position:fixed; bottom:20px; right:20px; z-index:100; margin:0; font-family:sans-serif; font-size:12px; background:rgba(255,255,255,0.95); padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); display:flex; align-items:center; gap:12px; flex-wrap:wrap; max-width:800px; } 
    .filter-container label { margin:0; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:12px; }`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, t, r);
if (!replacedStr) {
  console.log("Failed to patch CSS rule");
  process.exit(1);
}

fs.writeFileSync('src/hooks/useExportActions.js', replacedStr);
console.log("Patched HTML export CSS to make filter-container fixed and compact");
