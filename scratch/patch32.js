import fs from 'fs';

let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const target = `<th colspan="10" class="bg-fuchsia">昇進年度 (西暦(和暦))</th>`;
const replacement = `<th colspan="10" class="bg-fuchsia">昇進年度</th>`;

let replaced = false;
if (content.includes(target)) {
  content = content.replace(target, replacement);
  replaced = true;
} else {
  const targetCRLF = target.replace(/\n/g, '\r\n');
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replacement.replace(/\n/g, '\r\n'));
    replaced = true;
  }
}

if (!replaced) {
  console.error("Failed to find target in exportHtml.js");
  process.exit(1);
}

fs.writeFileSync('src/utils/exportHtml.js', content);
console.log("Successfully patched exportHtml.js");
