import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make the max-width a bit larger to fit both buttons, and adjust button padding
target_css = '.sticky-name { position: sticky; left: 0; font-weight: bold; max-width: 90px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }'
repl_css = '.sticky-name { position: sticky; left: 0; font-weight: bold; max-width: 115px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }'

if target_css in text:
    text = text.replace(target_css, repl_css)
    print("CSS updated")
else:
    print("CSS not found")

# Shrink the buttons slightly to ensure they fit well
target_btn = '<th class="sticky-name bg-slate" style="vertical-align: middle; padding: 2px;"><div style="display:flex; gap:2px; justify-content:center;"><button onclick="resetSort()" style="cursor: pointer; font-size: 10px; padding: 2px 4px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 4px; color: #334155;">最初に戻す</button><button onclick="clearSelection()" style="cursor: pointer; font-size: 10px; padding: 2px 4px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 4px; color: #334155;">選択解除</button></div></th>'
repl_btn = '<th class="sticky-name bg-slate" style="vertical-align: middle; padding: 1px;"><div style="display:flex; gap:2px; justify-content:center;"><button onclick="resetSort()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">最初に戻す</button><button onclick="clearSelection()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">選択解除</button></div></th>'

if target_btn in text:
    text = text.replace(target_btn, repl_btn)
    print("Button HTML updated")
else:
    print("Button HTML not found")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
