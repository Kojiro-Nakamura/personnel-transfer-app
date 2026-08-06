import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update th
th_target = '<th class="sticky-name bg-slate"></th>'
th_repl = '<th class="sticky-name bg-slate" style="vertical-align: middle; padding: 2px;"><button onclick="resetSort()" style="cursor: pointer; font-size: 10px; padding: 2px 4px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 4px; color: #334155;">最初に戻す</button></th>'

if th_target in text:
    text = text.replace(th_target, th_repl)
    print("TH replaced")

# 2. Update forEach
fe_target = '    sortedEmps.forEach(emp => {'
fe_repl = '    sortedEmps.forEach((emp, index) => {'

if fe_target in text:
    text = text.replace(fe_target, fe_repl)
    print("forEach replaced")

# 3. Update tr
tr_target = '''      html += `
    <tr>
      <td class="sticky-name text-left" data-val="${nameVal}">${nameVal}</td>'''

tr_repl = '''      html += `
    <tr data-original-index="${index}">
      <td class="sticky-name text-left" data-val="${nameVal}">${nameVal}</td>'''

if tr_target in text:
    text = text.replace(tr_target, tr_repl)
    print("TR replaced")

# 4. Inject resetSort function
script_target = '      function sortTable(n) {'
script_repl = '''      function resetSort() {
        var table = document.getElementById("empTable");
        var tbody = table.getElementsByTagName("tbody")[0];
        if (!tbody) return;
        var rows = Array.from(tbody.rows);
        rows.sort(function(a, b) {
          return parseInt(a.getAttribute("data-original-index")) - parseInt(b.getAttribute("data-original-index"));
        });
        for (var i = 0; i < rows.length; i++) {
          tbody.appendChild(rows[i]);
        }
      }

      function sortTable(n) {'''

if script_target in text:
    text = text.replace(script_target, script_repl)
    print("Script replaced")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
