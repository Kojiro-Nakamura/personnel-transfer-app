import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t1 = `      function clearSelection() {`;
const r1 = `      function saveHTML() {
        var htmlContent = "<!DOCTYPE html>\\n<html>\\n" + document.documentElement.innerHTML + "\\n</html>";
        var blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        var now = new Date();
        var y = now.getFullYear();
        var m = ("0" + (now.getMonth() + 1)).slice(-2);
        var d = ("0" + now.getDate()).slice(-2);
        var h = ("0" + now.getHours()).slice(-2);
        var min = ("0" + now.getMinutes()).slice(-2);
        a.download = "職員一覧_保存_" + y + m + d + "_" + h + min + ".html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function clearSelection() {`;

const t2 = `<button onclick="clearSelection()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">選択解除</button></div></th>`;
const r2 = `<button onclick="clearSelection()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">選択解除</button><button onclick="saveHTML()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">保存</button></div></th>`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let newContent = content;

const replacements = [
  {t: t1, r: r1, n: 't1'},
  {t: t2, r: r2, n: 't2'},
];

for (const rep of replacements) {
  let replacedStr = replaceWithCRLF(newContent, rep.t, rep.r);
  if (!replacedStr) {
    console.log("Failed " + rep.n);
    process.exit(1);
  }
  newContent = replacedStr;
}

fs.writeFileSync('src/utils/exportHtml.js', newContent);
console.log("Patched exportHtml.js to add saveHTML button");
