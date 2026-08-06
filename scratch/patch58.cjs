const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// 1. Change font-size of summaryHtml
content = content.replace(
  'font-size:14px;background:#f8fafc;',
  'font-size:12px;background:#f8fafc;'
);

// 2. Change .filter-container CSS
const filterCssOld = `    .filter-container { position:fixed; bottom:20px; right:20px; z-index:100; margin:0; font-family:sans-serif; font-size:12px; background:rgba(255,255,255,0.95); padding:8px 12px; border:1px solid #cbd5e1; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); display:flex; align-items:center; gap:12px; flex-wrap:wrap; max-width:800px; } 
    .filter-container label { margin:0; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:12px; }`;
const filterCssNew = `    .filter-container { display:flex; align-items:center; gap:12px; flex-wrap:wrap; font-size:12px; font-weight: normal; } 
    .filter-container label { margin:0; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight: normal; }`;

content = content.replace(filterCssOld, filterCssNew);
content = content.replace(filterCssOld.replace(/\n/g, '\r\n'), filterCssNew.replace(/\n/g, '\r\n'));

// 3. Add .print-hide to print media query
const printCssOld = `    @media print {
      .filter-container { display: none !important; }`;
const printCssNew = `    @media print {
      .print-hide { display: none !important; }
      .filter-container { display: none !important; }`;

content = content.replace(printCssOld, printCssNew);
content = content.replace(printCssOld.replace(/\n/g, '\r\n'), printCssNew.replace(/\n/g, '\r\n'));

// 4. Move <div class="filter-container"> into thead
const htmlOld = `  ${"${summaryHtml}"}
  <div class="filter-container">
  </div>
  <table>
    <thead>
      <tr>`;
const htmlNew = `  ${"${summaryHtml}"}
  <table>
    <thead>
      <tr class="print-hide">
        <th colspan="16" style="background-color: #cbd5e1; border-bottom: 1px solid #94a3b8; text-align: left; padding: 6px 12px;">
          <div class="filter-container">
          </div>
        </th>
      </tr>
      <tr>`;

content = content.replace(htmlOld, htmlNew);
content = content.replace(htmlOld.replace(/\n/g, '\r\n'), htmlNew.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Successfully patched useExportActions.js');
