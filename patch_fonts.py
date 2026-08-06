import sys

# 1. Update index.css
with open('src/index.css', 'r', encoding='utf-8') as f:
    css_text = f.read()

target_css = "font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'BIZ UDPGothic', 'Meiryo', sans-serif;"
repl_css = """font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
    -webkit-font-smoothing: auto;
    -moz-osx-font-smoothing: auto;"""

css_text = css_text.replace(target_css, repl_css)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css_text)

# 2. Update exportHtml.js
with open('src/utils/exportHtml.js', 'r', encoding='utf-8') as f:
    html_text = f.read()

target_html = 'body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "BIZ UDPGothic", "Meiryo", sans-serif; font-size: 11px; margin: 0; color: #334155; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }'
repl_html = 'body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; font-size: 11px; margin: 0; color: #334155; -webkit-font-smoothing: auto; -moz-osx-font-smoothing: auto; }'

html_text = html_text.replace(target_html, repl_html)

with open('src/utils/exportHtml.js', 'w', encoding='utf-8') as f:
    f.write(html_text)

print("Fonts and smoothing updated")
