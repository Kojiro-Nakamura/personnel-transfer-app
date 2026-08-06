const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const oldTableCSS = `    table { border-collapse: collapse; table-layout: fixed; width: max-content; }`;
const newTableCSS = `    table { border-collapse: collapse; table-layout: fixed; width: 100%; min-width: 1150px; }`;

const oldColgroup = `    <colgroup>
      <col style="width: 90px;" />
      <col style="width: 90px;" />
      <col style="width: 50px;" />
      <col style="width: 50px;" />
      <col style="width: 80px;" />
      <col style="width: 130px;" />
      <col style="width: 40px;" />
      <col style="width: 70px;" />
      <col style="width: 60px;" />
      <col style="width: 50px;" />
      <col style="width: 80px;" />
      <col style="width: 130px;" />
      <col style="width: 40px;" />
      <col style="width: 70px;" />
      <col style="width: 60px;" />
      <col style="width: 60px;" />
    </colgroup>`;

const newColgroup = `    <colgroup>
      <col style="width: calc((100% - 730px) * 0.21);" />
      <col style="width: calc((100% - 730px) * 0.21);" />
      <col style="width: 50px;" />
      <col style="width: calc((100% - 730px) * 0.12);" />
      <col style="width: 80px;" />
      <col style="width: 130px;" />
      <col style="width: 40px;" />
      <col style="width: calc((100% - 730px) * 0.17);" />
      <col style="width: 60px;" />
      <col style="width: calc((100% - 730px) * 0.12);" />
      <col style="width: 80px;" />
      <col style="width: 130px;" />
      <col style="width: 40px;" />
      <col style="width: calc((100% - 730px) * 0.17);" />
      <col style="width: 60px;" />
      <col style="width: 60px;" />
    </colgroup>`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, oldTableCSS, newTableCSS);
if (!replacedStr) {
  console.log("Failed to patch CSS");
  process.exit(1);
}

replacedStr = replaceWithCRLF(replacedStr, oldColgroup, newColgroup);
if (!replacedStr) {
  console.log("Failed to patch Colgroup");
  process.exit(1);
}

fs.writeFileSync('src/hooks/useExportActions.js', replacedStr);
console.log('Done');
