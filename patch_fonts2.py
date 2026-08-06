import sys

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

if 'class="antialiased' not in html:
    html = html.replace('<body>', '<body class="antialiased text-slate-800">')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write('''@import "tailwindcss";

@layer base {
  body {
    font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'BIZ UDPGothic', 'Meiryo', sans-serif;
  }
}
''')

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    modals = f.read()

target_css = 'body { font-family: sans-serif; font-size: 11px; margin: 20px; color: #334155; }'
repl_css = 'body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", "Meiryo", sans-serif; font-size: 11px; margin: 20px; color: #334155; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }'

modals = modals.replace(target_css, repl_css)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(modals)

print("SUCCESS")
