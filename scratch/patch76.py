import re

with open('src/hooks/useExportActions.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove @page from @media print
old_print = """    @media print {
      .print-hide { display: none !important; }
      .filter-container { display: none !important; }
      @page {
        size: A4 landscape; /* 自動でA4横向きに設定 */
        margin: 10mm; /* 用紙の余白 */
      }
      body {"""
new_print = """    @media print {
      .print-hide { display: none !important; }
      .filter-container { display: none !important; }
      body {"""
content = content.replace(old_print, new_print)

# 2. Add style block to head
content = content.replace('</style>\n  <script>', '</style>\n  <style id="page-style">@page { size: A4 landscape; margin: 10mm; }</style>\n  <script>')

# 3. Replace filter logic
old_filter = """      const filterContainer = document.querySelector(".filter-container");
      let radioHtml = '<strong>表示切替：</strong> <label title="すべての職員を表示する"><input type="radio" name="filter" value="0" checked> 全件表示</label>';
      
      const filteredOptions = GRADE_OPTIONS.filter(g => g !== "");
      filteredOptions.forEach(g => {
         radioHtml += `<label title="${g}以上の職員のみを表示する"><input type="radio" name="filter" value="${GRADE_LEVELS[g]}"> ${g}以上</label>`;
      });
      
      filterContainer.innerHTML = radioHtml;"""

new_filter = """      const filterContainer = document.querySelector(".filter-container");
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
      radioHtml += '</div>';
      
      filterContainer.innerHTML = radioHtml;
      
      document.querySelectorAll("input[name='orientation']").forEach(r => {
        r.addEventListener("change", (e) => {
          const pageStyle = document.getElementById("page-style");
          if (pageStyle) {
            pageStyle.textContent = `@page { size: A4 ${e.target.value}; margin: 10mm; }`;
          }
        });
      });"""

content = content.replace(old_filter, new_filter)

with open('src/hooks/useExportActions.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Patch Python complete.')
