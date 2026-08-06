import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t = `      let histHtml = '';
      historyYears.forEach(year => {
        let hStr = '';
        let histStyle = '';
        if (year === targetYear) {
          hStr = nDeptName;
          if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade)) {
            const c = getPromotedBgColorCode(emp.nextGrade);
            if (c) histStyle = \` style="background-color: \${c} !important;"\`;
          }
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        histHtml += \`<td class="bg-emerald" data-val="\${hStr}"\${histStyle}>\${hStr}</td>\`;
      });`;

const r = `      let histHtml = '';
      const colorMap = {};
      const textColors = ["#FF8000", "#00BFFF", "#4B0082"];
      let colorIdx = 0;
      
      historyYears.forEach(year => {
        let hStr = '';
        let histStyleCss = '';
        if (year === targetYear) {
          hStr = nDeptName;
          if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade)) {
            const c = getPromotedBgColorCode(emp.nextGrade);
            if (c) histStyleCss += \`background-color: \${c} !important; \`;
          }
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        
        if (hStr && hStr !== ' / 課直属' && hStr !== '未配置' && hStr !== '-') {
          if (!colorMap[hStr]) {
            colorMap[hStr] = textColors[colorIdx % textColors.length];
            colorIdx++;
          }
          histStyleCss += \`color: \${colorMap[hStr]}; font-weight: bold;\`;
        }

        const histStyleAttr = histStyleCss ? \` style="\${histStyleCss}"\` : '';
        histHtml += \`<td class="bg-emerald" data-val="\${hStr}"\${histStyleAttr}>\${hStr}</td>\`;
      });`;

const t_crlf = t.replace(/\n/g, '\r\n');
const r_crlf = r.replace(/\n/g, '\r\n');

if (content.includes(t)) {
  content = content.replace(t, r);
} else if (content.includes(t_crlf)) {
  content = content.replace(t_crlf, r_crlf);
} else {
  console.log('Target string not found');
  process.exit(1);
}

fs.writeFileSync('src/utils/exportHtml.js', content);
console.log('Colors logic added to HTML export successfully');
