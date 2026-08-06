import fs from 'fs';
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const t = `      <tr>
        <th style="background-color: #cbd5e1;">職名</th>
        <th style="background-color: #cbd5e1;">氏名</th>
        <th style="background-color: #cbd5e1;">級</th>
        <th style="background-color: #cbd5e1;">年齢</th>
        <th style="background-color: #cbd5e1;">在籍</th>
        <th style="background-color: #cbd5e1;">備考</th>
        <th style="background-color: #bfdbfe;">職名</th>
        <th style="background-color: #bfdbfe;">氏名</th>
        <th style="background-color: #bfdbfe;">級</th>
        <th style="background-color: #bfdbfe;">年齢</th>
        <th style="background-color: #bfdbfe;">在籍</th>
        <th style="background-color: #bfdbfe;">備考</th>
      </tr>`;
const r = `      <tr>
        <th style="background-color: #cbd5e1;">職名</th>
        <th style="background-color: #cbd5e1;">氏名</th>
        <th style="background-color: #cbd5e1;">級</th>
        <th style="background-color: #cbd5e1; width: 32px; min-width: 32px;">年齢</th>
        <th style="background-color: #cbd5e1;">在籍</th>
        <th style="background-color: #cbd5e1;">備考</th>
        <th style="background-color: #bfdbfe;">職名</th>
        <th style="background-color: #bfdbfe;">氏名</th>
        <th style="background-color: #bfdbfe;">級</th>
        <th style="background-color: #bfdbfe; width: 32px; min-width: 32px;">年齢</th>
        <th style="background-color: #bfdbfe;">在籍</th>
        <th style="background-color: #bfdbfe;">備考</th>
      </tr>`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, t, r);

if (!replacedStr) {
  console.log("Failed to patch HTML export headers");
  process.exit(1);
}

fs.writeFileSync('src/hooks/useExportActions.js', replacedStr);
console.log("Patched HTML export headers to narrow age columns");
