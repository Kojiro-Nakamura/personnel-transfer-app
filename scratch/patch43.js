import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t1 = `      <th class="sticky-name bg-slate" style="vertical-align: middle; padding: 1px;"><div style="display:flex; gap:2px; justify-content:center;"><button onclick="resetSort()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">最初に戻す</button><button onclick="clearSelection()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">選択解除</button><button onclick="saveHTML()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">保存</button></div></th>
      <th class="sticky-age bg-slate"></th>`;
      
const r1 = `      <th class="sticky-name bg-slate" style="vertical-align: middle; padding: 1px;"><div style="display:flex; gap:2px; justify-content:center;"><button onclick="resetSort()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">最初に戻す</button><button onclick="clearSelection()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">選択解除</button></div></th>
      <th class="sticky-age bg-slate" style="vertical-align: middle; padding: 1px;"><div style="display:flex; justify-content:center;"><button onclick="saveHTML()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">保存</button></div></th>`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, t1, r1);
if (!replacedStr) {
  console.log("Failed t1");
  process.exit(1);
}

fs.writeFileSync('src/utils/exportHtml.js', replacedStr);
console.log("Patched exportHtml.js to move saveHTML button");
