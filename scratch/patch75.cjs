const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// 1. Remove @page
content = content.replace(/@page\s*\{\s*size:\s*A4\s*landscape;\s*\/\*\s*自動でA4横向きに設定\s*\*\/\s*margin:\s*10mm;\s*\/\*\s*用紙の余白\s*\*\/\s*\}/g, "");

// 2. Add style block to head
content = content.replace(
  "</style>\\n  <script>",
  "</style>\\n  <style id=\\"page-style\\">@page { size: A4 landscape; margin: 10mm; }</style>\\n  <script>"
);

// 3. Regex to replace filter setup
content = content.replace(
  /const filterContainer = document\.querySelector\("\.filter-container"\);[\s\S]*?filterContainer\.innerHTML = radioHtml;/g,
  \`const filterContainer = document.querySelector(".filter-container");
      let radioHtml = '<div style="display: flex; gap: 16px; align-items: center; justify-content: flex-end; width: 100%;">';
      radioHtml += '<div><strong>印刷向き：</strong> <label><input type="radio" name="orientation" value="landscape" checked> 横</label> <label><input type="radio" name="orientation" value="portrait"> 縦</label></div>';
      radioHtml += '<div style="border-left: 1px solid #94a3b8; height: 16px;"></div>';
      radioHtml += '<div><strong>表示切替：</strong> <label title="すべての職員を表示する"><input type="radio" name="filter" value="0" checked> 全件表示</label>';
      
      const filteredOptions = GRADE_OPTIONS.filter(g => g !== "");
      filteredOptions.forEach(g => {
         radioHtml += \\\`<label title="\\\${g}以上の職員のみを表示する"><input type="radio" name="filter" value="\\\${GRADE_LEVELS[g]}"> \\\${g}以上</label>\\\`;
      });
      radioHtml += '</div>';
      radioHtml += '<button onclick="window.print()" style="padding: 4px 12px; background-color: #0ea5e9; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">印刷</button>';
      radioHtml += '</div>';
      
      filterContainer.innerHTML = radioHtml;
      
      document.querySelectorAll("input[name='orientation']").forEach(r => {
        r.addEventListener("change", (e) => {
          const pageStyle = document.getElementById("page-style");
          if (pageStyle) {
            pageStyle.textContent = \\\`@page { size: A4 \\\${e.target.value}; margin: 10mm; }\\\`;
          }
        });
      });\`
);

fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Patch 75 complete.');
