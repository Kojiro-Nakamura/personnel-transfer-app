import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">'''

repl = '''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="google" content="notranslate">'''

if target in content:
    content = content.replace(target, repl)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS patched html translation issue")
else:
    print("ERROR: Target string not found")
