const fs = require('fs');
let text = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

// 1. CSS
const cssStart = text.indexOf('  body { font-family: "Helvetica Neue"');
const cssEnd = text.indexOf('</style>', cssStart);
if (cssStart > -1 && cssEnd > -1) {
  const newCss = `  body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", "Meiryo", sans-serif; font-size: 11px; margin: 20px; color: #334155; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  table { border-collapse: separate; border-spacing: 0; width: max-content; }
  th, td { border-right: 1px solid #94a3b8; border-bottom: 1px solid #94a3b8; padding: 4px; text-align: center; vertical-align: middle; white-space: nowrap; background-clip: padding-box; }
  th { cursor: pointer; user-select: none; }
  th:hover { opacity: 0.8; }
  
  /* Fix borders */
  thead tr:first-child th { border-top: 1px solid #94a3b8; }
  th:first-child, td:first-child { border-left: 1px solid #94a3b8; }
  
  /* Header backgrounds */
  thead th.bg-slate { background-color: #cbd5e1; }
  thead th.bg-blue { background-color: #bfdbfe; }
  thead th.bg-fuchsia { background-color: #f5d0fe; }
  thead th.bg-emerald { background-color: #a7f3d0; }
  
  /* Body backgrounds */
  tbody td.bg-slate { background-color: #f8fafc; }
  tbody td.bg-blue { background-color: #eff6ff; }
  tbody td.bg-fuchsia { background-color: #fdf4ff; }
  tbody td.bg-emerald { background-color: #ecfdf5; }
  
  /* Sticky left column */
  .sticky-col { position: sticky; left: 0; font-weight: bold; }
  tbody td.sticky-col { z-index: 10; background-color: #e2e8f0; }
  thead th.sticky-col { z-index: 30; background-color: #94a3b8; color: #fff; }
  
  /* Thead sticky */
  thead { position: sticky; top: 0; z-index: 20; }
  
  .text-left { text-align: left; }
  .arrow { color: #64748b; font-size: 10px; margin: 0 2px; }
  .diff-span { font-size: 10px; font-weight: bold; border-radius: 2px; padding: 1px 3px; margin-right: 2px; border: 1px solid; }
  .diff-emerald { color: #059669; background-color: #ecfdf5; border-color: #d1fae5; }
  .diff-blue { color: #2563eb; background-color: #eff6ff; border-color: #bfdbfe; }
  .highlight > td { background-color: #fef08a !important; }
  tbody tr { cursor: pointer; }
  tbody tr:hover > td { opacity: 0.9; }
`;
  text = text.substring(0, cssStart) + newCss + text.substring(cssEnd);
  console.log('CSS replaced');
} else {
  console.log('CSS search string not found');
}

// 2. TH
const thSearch = '<th colspan="6" class="bg-slate">基本情報</th>';
if (text.includes(thSearch)) {
  text = text.replace(thSearch, '<th class="sticky-col bg-slate"></th>\n      <th colspan="5" class="bg-slate">基本情報</th>');
  console.log('TH replaced');
} else {
  console.log('TH search string not found');
}

// 3. TD and Age calculation
const tdStart = text.indexOf('html += `\\n    <tr>\\n      <td class="sticky-col text-left"');
const tdEnd = text.indexOf('</td>', tdStart) + 5;
if (tdStart > -1 && tdEnd > -1) {
  const newTd = `      let ageStr = '';
      if (emp.birthDate) {
        const age = calculateAge(emp.birthDate, targetYear - 1);
        if (age !== null && !isNaN(age)) {
          ageStr = '(' + age + ')';
        }
      }
      const nameVal = emp.name || '';
      const nameWithAge = nameVal + ageStr;

      html += \`
    <tr>
      <td class="sticky-col text-left" data-val="\${nameVal}">\${nameWithAge}</td>`;
  text = text.substring(0, tdStart) + newTd + text.substring(tdEnd);
  console.log('TD replaced');
} else {
  console.log('TD search string not found');
}

fs.writeFileSync('src/components/modals/Modals.jsx', text, 'utf8');
