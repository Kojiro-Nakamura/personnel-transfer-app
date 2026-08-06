import re

with open('src/hooks/useExportActions.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    if '<strong>印刷向き：</strong>' in line:
        lines[i] = line.replace('<strong>印刷向き：</strong> ', '')

with open('src/hooks/useExportActions.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Removed "印刷向き：" text.')
