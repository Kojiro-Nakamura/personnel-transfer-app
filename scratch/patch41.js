import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t = `      function saveHTML() {
        var htmlContent = "<!DOCTYPE html>\\n<html>\\n" + document.documentElement.innerHTML + "\\n</html>";`;

// I want the output to be: var htmlContent = "<!DOCTYPE html><html>" + document.documentElement.innerHTML + "</html>";
// so I avoid backslash escaping issues altogether.
const r = `      function saveHTML() {
        var htmlContent = "<!DOCTYPE html><html>" + document.documentElement.innerHTML + "</html>";`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, t, r);
if (!replacedStr) {
  // Let's try matching exactly what's in the file, where the \n became literal newlines.
  const t2 = `      function saveHTML() {
        var htmlContent = "<!DOCTYPE html>\n<html>\n" + document.documentElement.innerHTML + "\n</html>";`;
  replacedStr = replaceWithCRLF(content, t2, r);
}

if (!replacedStr) {
  console.log("Failed to patch saveHTML syntax error");
  process.exit(1);
}

fs.writeFileSync('src/utils/exportHtml.js', replacedStr);
console.log("Patched exportHtml.js to fix syntax error in saveHTML");
