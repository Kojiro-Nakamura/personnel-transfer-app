import fs from 'fs';
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const t = `    td:nth-child(7), td:nth-child(13), thead tr:nth-child(2) th:nth-child(4), thead tr:nth-child(2) th:nth-child(10) { white-space: nowrap; width: 28px; min-width: 28px; max-width: 28px; padding-left: 2px; padding-right: 2px; text-align: center; overflow: hidden; }`;
const r = `    td:nth-child(5), td:nth-child(11), thead tr:nth-child(2) th:nth-child(2), thead tr:nth-child(2) th:nth-child(8) { white-space: nowrap; min-width: 85px; }
    td:nth-child(7), td:nth-child(13), thead tr:nth-child(2) th:nth-child(4), thead tr:nth-child(2) th:nth-child(10) { white-space: nowrap; width: 28px; min-width: 28px; max-width: 28px; padding-left: 2px; padding-right: 2px; text-align: center; overflow: hidden; }`;

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
console.log("Patched HTML export CSS to widen name column");
