import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    modals = f.read()

target = '''            var valX = x ? (x.getAttribute("data-val") || x.innerText).toLowerCase() : "";
            var valY = y ? (y.getAttribute("data-val") || y.innerText).toLowerCase() : "";'''

repl = '''            var valX = x ? (x.hasAttribute("data-val") ? x.getAttribute("data-val") : x.textContent).toLowerCase() : "";
            var valY = y ? (y.hasAttribute("data-val") ? y.getAttribute("data-val") : y.textContent).toLowerCase() : "";'''

modals = modals.replace(target, repl)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(modals)

print("SUCCESS")
