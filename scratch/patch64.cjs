const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const oldColgroup = `    <colgroup>
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

const newColgroup = `    <colgroup>
      <col style="width: calc((100% - 550px) * 0.15);" />
      <col style="width: calc((100% - 550px) * 0.15);" />
      <col style="width: 50px;" />
      <col style="width: calc((100% - 550px) * 0.08);" />
      <col style="width: 80px;" />
      <col style="width: 130px;" />
      <col style="width: 40px;" />
      <col style="width: calc((100% - 550px) * 0.12);" />
      <col style="width: calc((100% - 550px) * 0.10);" />
      <col style="width: calc((100% - 550px) * 0.08);" />
      <col style="width: 80px;" />
      <col style="width: 130px;" />
      <col style="width: 40px;" />
      <col style="width: calc((100% - 550px) * 0.12);" />
      <col style="width: calc((100% - 550px) * 0.10);" />
      <col style="width: calc((100% - 550px) * 0.10);" />
    </colgroup>`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, oldColgroup, newColgroup);
if (!replacedStr) {
  console.log("Failed to patch Colgroup");
  process.exit(1);
}

fs.writeFileSync('src/hooks/useExportActions.js', replacedStr);
console.log('Done');
