import re

with open('src/hooks/useExportActions.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to replace line 296 exactly to:
#          radioHtml += `<label title="${g}以上の職員のみを表示する"><input type="radio" name="filter" value="${GRADE_LEVELS[g]}"> ${g}以上</label>`;

target_str = r'         radioHtml \+= `\\`<label title="\\$\\{g\\}以上の職員のみを表示する"><input type="radio" name="filter" value="\\$\\{GRADE_LEVELS\[g\]\\}"> \\$\\{g\\}以上</label>\\``;'

replacement_str = '         radioHtml += `\\`<label title="\\${g}以上の職員のみを表示する"><input type="radio" name="filter" value="\\${GRADE_LEVELS[g]}"> \\${g}以上</label>\\``;'

# wait, in JS, because it's inside `const htmlContent = \` ... \``, the backticks inside must be escaped as \` and the variables must be escaped as \${g}
# So in Python string it is:
# '         radioHtml += `\\`<label title="\\${g}以上の職員のみを表示する"><input type="radio" name="filter" value="\\${GRADE_LEVELS[g]}"> \\${g}以上</label>\\``;'

content = re.sub(target_str, replacement_str, content)

with open('src/hooks/useExportActions.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed syntax error.')
