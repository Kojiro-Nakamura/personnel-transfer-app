const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const t = `    thead { position: sticky; top: 0; z-index: 20; }
    th { background-color: #f0f0f0; border-bottom: 2px solid #94a3b8; background-clip: padding-box; }`;
const r = `    thead { position: sticky; top: 0; z-index: 20; background-color: #fff; }
    th { background-color: #f0f0f0; border-bottom: 2px solid #94a3b8; }`;

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
console.log("Patched HTML export CSS to fix transparent borders on sticky header");
