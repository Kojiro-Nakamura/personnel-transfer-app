const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const t = `    th, td { border: 1px solid #ccc; padding: 4px 8px; vertical-align: top; } 
    th, strong, b { font-weight: 600; }
    thead { position: sticky; top: 0; z-index: 20; background-color: #fff; }
    th { background-color: #f0f0f0; border-bottom: 2px solid #94a3b8; }`;

const r = `    th, td { border: 1px solid #ccc; padding: 4px 8px; vertical-align: top; } 
    th, strong, b { font-weight: 600; }
    thead { position: sticky; top: 0; z-index: 20; background-color: #fff; }
    thead th { border: 1px solid #333 !important; outline: 1px solid #333; outline-offset: -1px; }
    th { background-color: #f0f0f0; border-bottom: 2px solid #333; }`;

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
console.log("Patched HTML export CSS to make header borders black and not bleed");
