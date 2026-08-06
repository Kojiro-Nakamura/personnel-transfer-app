import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t = `      let histHtml = '';
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

const r = `      let histHtml = '';
      let prevDept = null;
      
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
        
        let displayStr = hStr;
        if (hStr && hStr !== ' / 課直属' && hStr !== '未配置' && hStr !== '-') {
          if (prevDept !== null && hStr !== prevDept) {
            histStyleCss += \`color: #2563eb; font-weight: bold; \`;
          }
          prevDept = hStr;

          const histAge = (emp.birthDate && !isNaN(year)) ? calculateAge(emp.birthDate, year) : null;
          if (histAge !== null && !isNaN(histAge)) {
            displayStr = \`\${hStr} \${histAge}歳\`;
          }
        }

        const histStyleAttr = histStyleCss ? \` style="\${histStyleCss}"\` : '';
        histHtml += \`<td class="bg-emerald" data-val="\${hStr}"\${histStyleAttr}>\${displayStr}</td>\`;
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
console.log('Changed history coloring logic to diff-based blue/bold in HTML export');
