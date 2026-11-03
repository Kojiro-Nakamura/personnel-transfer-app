import re
with open("index.html", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace(
    '<html lang="ja">',
    '<html lang="ja" translate="no">'
)
code = code.replace(
    '<meta charset="UTF-8" />',
    '<meta charset="UTF-8" />\n    <meta name="google" content="notranslate" />'
)

with open("index.html", "w", encoding="utf8") as f:
    f.write(code)
print("Updated index.html to disable translation")