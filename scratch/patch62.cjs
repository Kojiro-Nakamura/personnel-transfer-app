const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const lines = content.split('\n');

const cssStart = lines.findIndex(l => l.includes('table { border-collapse: collapse;'));
const cssEnd = lines.findIndex(l => l.includes('.filter-container { display:flex;'));

if (cssStart !== -1 && cssEnd !== -1) {
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
    
  lines.splice(cssStart, cssEnd - cssStart, rCSS);
}

content = lines.join('\n');

const htmlOld = `  <table>
    <thead>`;
const htmlNew = `  <table>
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
  return str;
}

let replacedStr = replaceWithCRLF(content, htmlOld, htmlNew);

fs.writeFileSync('src/hooks/useExportActions.js', replacedStr);
console.log("Patched HTML export to use fixed table layout with colgroup");
