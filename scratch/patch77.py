import re

with open('src/hooks/useExportActions.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the CSS for page-style
content = content.replace(
    '<style id="page-style">@page { size: A4 landscape; margin: 10mm; }</style>',
    '<style id="page-style">@page { size: A4 portrait; margin: 10mm; }</style>'
)

# 2. Update the JS block
old_block = """      const filterContainer = document.querySelector(".filter-container");
      let radioHtml = '<div style="display: flex; gap: 16px; align-items: center; justify-content: flex-end; width: 100%;">';
      radioHtml += '<div><strong>印刷向き：</strong> <label><input type="radio" name="orientation" value="landscape" checked> 横</label> <label><input type="radio" name="orientation" value="portrait"> 縦</label></div>';
      radioHtml += '<div style="border-left: 1px solid #94a3b8; height: 16px;"></div>';
      radioHtml += '<div><strong>表示切替：</strong> <label title="すべての職員を表示する"><input type="radio" name="filter" value="0" checked> 全件表示</label>';
      
      const filteredOptions = GRADE_OPTIONS.filter(g => g !== "");
      filteredOptions.forEach(g => {
         radioHtml += `<label title="${g}以上の職員のみを表示する"><input type="radio" name="filter" value="${GRADE_LEVELS[g]}"> ${g}以上</label>`;
      });
      
      radioHtml += '</div>';
      radioHtml += '<button onclick="window.print()" style="padding: 4px 12px; background-color: #0ea5e9; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">印刷</button>';
      radioHtml += '</div>';"""

new_block = """      const filterContainer = document.querySelector(".filter-container");
      let radioHtml = '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">';
      
      radioHtml += '<div style="display: flex; gap: 12px; align-items: center;">';
      radioHtml += '<div><strong>表示切替：</strong> <label title="すべての職員を表示する"><input type="radio" name="filter" value="0" checked> 全件表示</label>';
      
      const filteredOptions = GRADE_OPTIONS.filter(g => g !== "");
      filteredOptions.forEach(g => {
         radioHtml += `<label title="${g}以上の職員のみを表示する"><input type="radio" name="filter" value="${GRADE_LEVELS[g]}"> ${g}以上</label>`;
      });
      radioHtml += '</div>';
      radioHtml += '</div>';
      
      radioHtml += '<div style="display: flex; gap: 16px; align-items: center;">';
      radioHtml += '<div><strong>印刷向き：</strong> <label><input type="radio" name="orientation" value="landscape"> 横</label> <label><input type="radio" name="orientation" value="portrait" checked> 縦</label></div>';
      radioHtml += '<button onclick="window.print()" style="padding: 4px 12px; background-color: #0ea5e9; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">印刷</button>';
      radioHtml += '</div>';
      
      radioHtml += '</div>';"""

# Fix template literals backslashes in Python string by doing a regex replacement safely
import re

content = re.sub(
    r'const filterContainer = document\.querySelector\("\.filter-container"\);[\s\S]*?radioHtml \+= \'</div>\';',
    new_block,
    content,
    flags=re.MULTILINE
)

with open('src/hooks/useExportActions.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Patch 77 complete.')
