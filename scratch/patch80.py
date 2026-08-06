import re

with open('src/hooks/useExportActions.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    if 'radioHtml +=' in line and '以上の職員のみを表示する' in line:
        lines[i] = '         radioHtml += \'<label title="\' + g + \'以上の職員のみを表示する"><input type="radio" name="filter" value="\' + GRADE_LEVELS[g] + \'"> \' + g + \'以上</label>\';'

with open('src/hooks/useExportActions.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Fixed syntax error with string concatenation.')
