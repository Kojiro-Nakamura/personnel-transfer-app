import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'cellHtml += `<span class="arrow">&gt;</span><span class="diff-span diff-blue">${diff >= 0 ? diff : 0}年</span>`;'
repl = 'cellHtml += `<span class="arrow">&gt;</span><span class="diff-span diff-blue">${diff >= 0 ? diff : 0}年目</span>`;'

if target in text:
    text = text.replace(target, repl)
    print("Replaced '年' with '年目'")
else:
    print("Target not found")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
