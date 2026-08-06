const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const tCSS = `    table { border-collapse: collapse; width: max-content; } 
    th, td { border: 1px solid #ccc; padding: 4px 8px; vertical-align: top; } 
    th, strong, b { font-weight: 600; }
    thead { position: sticky; top: 0; z-index: 20; background-color: #fff; }
    thead th { border: 1px solid #333 !important; outline: 1px solid #333; outline-offset: -1px; }
    th { background-color: #f0f0f0; border-bottom: 2px solid #333; } 
    .highlight { background-color: #a7f3d0 !important; cursor: pointer; } 
    .selected { background-color: #fef08a !important; } 
    .post-cell { font-weight: 600; color: #0369a1; background-color: #e0f2fe; } 
    td:nth-child(4), td:nth-child(10), td:nth-child(16) { border-left: 2px solid #475569; } 
    thead tr:first-child th:nth-child(4), thead tr:first-child th:nth-child(5), thead tr:first-child th:nth-child(6) { border-left: 2px solid #475569; }
    thead tr:nth-child(2) th:nth-child(1), thead tr:nth-child(2) th:nth-child(7) { border-left: 2px solid #475569; } 
    td:nth-child(1), thead tr:first-child th:nth-child(1) { width: 100px; max-width: 100px; word-break: break-word; }
    td:nth-child(2), thead tr:first-child th:nth-child(2) { width: 100px; max-width: 100px; word-break: break-word; }
    td:nth-child(3), thead tr:first-child th:nth-child(3) { width: 50px; max-width: 50px; word-break: break-word; }
    td:nth-child(4), td:nth-child(10), thead tr:nth-child(2) th:nth-child(1), thead tr:nth-child(2) th:nth-child(7) { width: 50px; max-width: 50px; word-break: break-word; }
    td:nth-child(9), td:nth-child(15), thead tr:nth-child(2) th:nth-child(6), thead tr:nth-child(2) th:nth-child(12) { width: 50px; max-width: 50px; word-break: break-word; }
    td:nth-child(5), td:nth-child(11), thead tr:nth-child(2) th:nth-child(2), thead tr:nth-child(2) th:nth-child(8) { white-space: nowrap; width: 70px; min-width: 70px; max-width: 70px; overflow: hidden; text-overflow: ellipsis; padding-left: 2px; padding-right: 2px; text-align: center; }
    td:nth-child(7), td:nth-child(13), thead tr:nth-child(2) th:nth-child(4), thead tr:nth-child(2) th:nth-child(10) { white-space: nowrap; width: 28px; min-width: 28px; max-width: 28px; padding-left: 2px; padding-right: 2px; text-align: center; overflow: hidden; }`;

const rCSS = `    table { border-collapse: collapse; table-layout: fixed; width: max-content; } 
    th, td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; } 
    th, strong, b { font-weight: 600; }
    thead { position: sticky; top: 0; z-index: 20; background-color: #fff; }
    thead th { border: 1px solid #333 !important; outline: 1px solid #333; outline-offset: -1px; }
    th { background-color: #f0f0f0; border-bottom: 2px solid #333; } 
    .highlight { background-color: #a7f3d0 !important; cursor: pointer; } 
    .selected { background-color: #fef08a !important; } 
    .post-cell { font-weight: 600; color: #0369a1; background-color: #e0f2fe; } 
    td:nth-child(4), td:nth-child(10), td:nth-child(16) { border-left: 2px solid #475569; } 
    thead tr:nth-child(2) th:nth-child(4), thead tr:nth-child(2) th:nth-child(5), thead tr:nth-child(2) th:nth-child(6) { border-left: 2px solid #475569 !important; }
    thead tr:nth-child(3) th:nth-child(1), thead tr:nth-child(3) th:nth-child(7) { border-left: 2px solid #475569 !important; } 
    td:nth-child(5), td:nth-child(11) { white-space: nowrap; text-overflow: ellipsis; text-align: center; }
    td:nth-child(7), td:nth-child(13) { white-space: nowrap; text-align: center; }`;

const tHTML = `  <table>
    <thead>`;

const rHTML = `  <table>
    <colgroup>
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
    </colgroup>
    <thead>`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, tCSS, rCSS);
if (!replacedStr) {
  console.log("Failed to patch CSS rule");
  process.exit(1);
}
replacedStr = replaceWithCRLF(replacedStr, tHTML, rHTML);
if (!replacedStr) {
  console.log("Failed to patch HTML");
  process.exit(1);
}

fs.writeFileSync('src/hooks/useExportActions.js', replacedStr);
console.log("Patched HTML export to use fixed table layout with colgroup");
