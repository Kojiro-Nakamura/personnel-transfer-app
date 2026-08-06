import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace button HTML
target_btn = '<th class="sticky-name bg-slate" style="vertical-align: middle; padding: 2px;"><button onclick="resetSort()" style="cursor: pointer; font-size: 10px; padding: 2px 4px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 4px; color: #334155;">最初に戻す</button></th>'
repl_btn = '<th class="sticky-name bg-slate" style="vertical-align: middle; padding: 2px;"><div style="display:flex; gap:2px; justify-content:center;"><button onclick="resetSort()" style="cursor: pointer; font-size: 10px; padding: 2px 4px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 4px; color: #334155;">最初に戻す</button><button onclick="clearSelection()" style="cursor: pointer; font-size: 10px; padding: 2px 4px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 4px; color: #334155;">選択解除</button></div></th>'

if target_btn in text:
    text = text.replace(target_btn, repl_btn)
    print("Button HTML updated")
else:
    print("Target button HTML not found")

# Replace JS to add clearSelection
target_js = '''      function resetSort() {
        var table = document.getElementById("empTable");'''

repl_js = '''      function clearSelection() {
        var table = document.getElementById("empTable");
        var tbody = table.getElementsByTagName("tbody")[0];
        if (!tbody) return;
        var rows = Array.from(tbody.rows);
        for (var i = 0; i < rows.length; i++) {
          rows[i].classList.remove("highlight");
        }
      }

      function resetSort() {
        var table = document.getElementById("empTable");'''

if target_js in text:
    text = text.replace(target_js, repl_js)
    print("JS logic updated")
else:
    print("Target JS not found")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
