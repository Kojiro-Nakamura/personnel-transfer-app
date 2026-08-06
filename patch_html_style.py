import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    modals = f.read()

# 1. Update the CSS
target_css = '''  body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", "Meiryo", sans-serif; font-size: 11px; margin: 20px; color: #334155; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  table { border-collapse: collapse; width: max-content; }
  th, td { border: 1px solid #cbd5e1; padding: 4px; text-align: center; vertical-align: middle; white-space: nowrap; }
  th { cursor: pointer; user-select: none; }
  th:hover { opacity: 0.8; }
  .sticky-col { position: sticky; left: 0; z-index: 10; background-color: #f1f5f9; box-shadow: 2px 0 5px -2px rgba(0,0,0,0.2); }
  .bg-slate { background-color: #f1f5f9; }
  .bg-blue { background-color: #eff6ff; }
  .bg-fuchsia { background-color: #fdf4ff; }
  .bg-emerald { background-color: #ecfdf5; }
  .text-left { text-align: left; }
  .arrow { color: #64748b; font-size: 10px; margin: 0 2px; }
  .diff-span { font-size: 10px; font-weight: bold; border-radius: 2px; padding: 1px 3px; margin-right: 2px; border: 1px solid; }
  .diff-emerald { color: #059669; background-color: #ecfdf5; border-color: #d1fae5; }
  .diff-blue { color: #2563eb; background-color: #eff6ff; border-color: #bfdbfe; }
  thead { position: sticky; top: 0; z-index: 20; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
  thead .sticky-col { z-index: 30; }
  .highlight > td { background-color: #fef08a !important; }
  tbody tr { cursor: pointer; }
  tbody tr:hover > td { opacity: 0.9; }'''

repl_css = '''  body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", "Meiryo", sans-serif; font-size: 11px; margin: 20px; color: #334155; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  table { border-collapse: separate; border-spacing: 0; width: max-content; }
  th, td { border-right: 1px solid #94a3b8; border-bottom: 1px solid #94a3b8; padding: 4px; text-align: center; vertical-align: middle; white-space: nowrap; background-clip: padding-box; }
  th { cursor: pointer; user-select: none; }
  th:hover { opacity: 0.8; }
  
  /* Fix borders for separate collapse */
  thead tr:first-child th { border-top: 1px solid #94a3b8; }
  th:first-child, td:first-child { border-left: 1px solid #94a3b8; }
  
  /* Header backgrounds (distinct, darker colors) */
  thead th.bg-slate { background-color: #cbd5e1; }
  thead th.bg-blue { background-color: #bfdbfe; }
  thead th.bg-fuchsia { background-color: #f5d0fe; }
  thead th.bg-emerald { background-color: #a7f3d0; }
  
  /* Body backgrounds (lighter colors) */
  tbody td.bg-slate { background-color: #f8fafc; }
  tbody td.bg-blue { background-color: #eff6ff; }
  tbody td.bg-fuchsia { background-color: #fdf4ff; }
  tbody td.bg-emerald { background-color: #ecfdf5; }
  
  /* Sticky left column (distinct color) */
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
  tbody tr:hover > td { opacity: 0.9; }'''

if target_css in modals:
    modals = modals.replace(target_css, repl_css)
else:
    print("CSS target not found!")
    sys.exit(1)

# 2. Update the first row of headers to split 基本情報
target_th = '<th colspan="6" class="bg-slate">基本情報</th>'
repl_th = '<th class="sticky-col bg-slate"></th>\n      <th colspan="5" class="bg-slate">基本情報</th>'

if target_th in modals:
    modals = modals.replace(target_th, repl_th)
else:
    print("TH target not found!")
    sys.exit(1)

# 3. Update the data rows to calculate and display age
target_td = 'html += `\n    <tr>\n      <td class="sticky-col text-left" data-val="${emp.name||''}">${emp.name||''}</td>'
repl_td = '''      let ageStr = '';
      if (emp.birthDate) {
        const age = calculateAge(emp.birthDate, targetYear - 1);
        if (age !== null && !isNaN(age)) {
          ageStr = '(' + age + ')';
        }
      }
      const nameVal = emp.name || '';
      const nameWithAge = nameVal + ageStr;

      html += `
    <tr>
      <td class="sticky-col text-left" data-val="${nameVal}">${nameWithAge}</td>'''

if target_td in modals:
    modals = modals.replace(target_td, repl_td)
else:
    print("TD target not found!")
    sys.exit(1)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(modals)

print("SUCCESS")
