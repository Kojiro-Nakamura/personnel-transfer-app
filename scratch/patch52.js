import fs from 'fs';
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const t = `    table { border-collapse: collapse; width: 100%; }`;
const r = `    table { border-collapse: collapse; width: max-content; }`;

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
console.log("Patched HTML export CSS to use max-content for table");
