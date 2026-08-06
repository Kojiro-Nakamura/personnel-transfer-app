import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t = `.sticky-name { position: sticky; left: 0; font-weight: 600; max-width: 115px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }`;
const r = `.sticky-name { position: sticky; left: 0; font-weight: 600; min-width: 125px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, t, r);

if (!replacedStr) {
  console.log("Failed to patch sticky-name CSS");
  process.exit(1);
}

fs.writeFileSync('src/utils/exportHtml.js', replacedStr);
console.log("Patched exportHtml.js to adjust sticky-name width");
