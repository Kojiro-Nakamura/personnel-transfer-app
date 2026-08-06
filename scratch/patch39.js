import fs from 'fs';
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

const t1 = `      <th onclick="sortTable(22)" class="bg-fuchsia" style="width: 80px;">係長級(主査)</th>
      <th onclick="sortTable(23)" class="bg-fuchsia" style="width: 80px;">補佐級I(主任)</th>
      <th onclick="sortTable(24)" class="bg-fuchsia" style="width: 80px;">補佐級II(班長)</th>
      <th onclick="sortTable(25)" class="bg-fuchsia" style="width: 80px;">補佐級III</th>
      <th onclick="sortTable(26)" class="bg-fuchsia" style="width: 80px;">課長級</th>
      <th onclick="sortTable(27)" class="bg-fuchsia" style="width: 80px;">所属長級</th>
      <th onclick="sortTable(28)" class="bg-fuchsia" style="width: 80px;">次長級</th>
      <th onclick="sortTable(29)" class="bg-fuchsia" style="width: 80px;">部長級</th>`;
const r1 = `      <th onclick="sortTable(22)" style="width: 80px; background-color: \${getPromotedBgColorCode('係長級(主査)')};">係長級(主査)</th>
      <th onclick="sortTable(23)" style="width: 80px; background-color: \${getPromotedBgColorCode('補佐級I(主任)')};">補佐級I(主任)</th>
      <th onclick="sortTable(24)" style="width: 80px; background-color: \${getPromotedBgColorCode('補佐級II(班長)')};">補佐級II(班長)</th>
      <th onclick="sortTable(25)" style="width: 80px; background-color: \${getPromotedBgColorCode('補佐級III(補佐兼班長)')};">補佐級III</th>
      <th onclick="sortTable(26)" style="width: 80px; background-color: \${getPromotedBgColorCode('課長級')};">課長級</th>
      <th onclick="sortTable(27)" style="width: 80px; background-color: \${getPromotedBgColorCode('所属長級')};">所属長級</th>
      <th onclick="sortTable(28)" style="width: 80px; background-color: \${getPromotedBgColorCode('次長級')};">次長級</th>
      <th onclick="sortTable(29)" style="width: 80px; background-color: \${getPromotedBgColorCode('部長級')};">部長級</th>`;

const t2 = `import { getGradeLevel, getEraFormattedYear, calculateAge, getPlacementName, getPromotedBgColorCode } from './helpers.js';

export const generateAndDownloadHTML = (employees, departments, targetYear, fileName) => {`;
const r2 = `import { getGradeLevel, getEraFormattedYear, calculateAge, getPlacementName, getPromotedBgColorCode } from './helpers.js';

const getBorderHexColor = (grade) => {
  switch (grade) {
    case "部長級": return "#c084fc";
    case "次長級": return "#f87171";
    case "所属長級": return "#fb923c";
    case "課長級": return "#facc15";
    case "補佐級III(補佐兼班長)": return "#38bdf8";
    case "補佐級II(班長)": return "#34d399";
    case "補佐級I(主任)": return "#f472b6";
    case "係長級(主査)": return "#94a3b8";
    case "一般": return "#a5b4fc";
    default: return "#cbd5e1";
  }
};

export const generateAndDownloadHTML = (employees, departments, targetYear, fileName) => {`;

const t3 = `      let histHtml = '';
      let prevDept = null;
      
      historyYears.forEach(year => {`;
const r3 = `      const promoYearMap = {};
      if (emp.promoYearChief) promoYearMap[emp.promoYearChief] = "係長級(主査)";
      if (emp.promoYearAssistant1) promoYearMap[emp.promoYearAssistant1] = "補佐級I(主任)";
      if (emp.promoYearAssistant2) promoYearMap[emp.promoYearAssistant2] = "補佐級II(班長)";
      if (emp.promoYearAssistant3) promoYearMap[emp.promoYearAssistant3] = "補佐級III(補佐兼班長)";
      if (emp.promoYearSecHead) promoYearMap[emp.promoYearSecHead] = "課長級";
      if (emp.promoYearDivHead) promoYearMap[emp.promoYearDivHead] = "所属長級";
      if (emp.promoYearDeputyHead) promoYearMap[emp.promoYearDeputyHead] = "次長級";
      if (emp.promoYearDeptHead) promoYearMap[emp.promoYearDeptHead] = "部長級";

      let histHtml = '';
      let prevDept = null;
      
      historyYears.forEach(year => {`;

const t4 = `          if (histAge !== null && !isNaN(histAge)) {
            displayStr = \`\${hStr} <span style="font-size: 0.85em;">(\${histAge}歳)</span>\`;
          }
        }

        const histStyleAttr = histStyleCss ? \` style="\${histStyleCss}"\` : '';
        histHtml += \`<td class="bg-emerald" data-val="\${hStr}"\${histStyleAttr}>\${displayStr}</td>\`;`;
const r4 = `          if (histAge !== null && !isNaN(histAge)) {
            displayStr = \`\${hStr} <span style="font-size: 0.85em;">(\${histAge}歳)</span>\`;
          }
        }

        const promoGrade = promoYearMap[year];
        if (promoGrade) {
          histStyleCss += \`box-shadow: inset 0 0 0 2px \${getBorderHexColor(promoGrade)}; \`;
        }

        const histStyleAttr = histStyleCss ? \` style="\${histStyleCss}"\` : '';
        histHtml += \`<td class="bg-emerald" data-val="\${hStr}"\${histStyleAttr}>\${displayStr}</td>\`;`;


const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let newContent = content;

const replacements = [
  {t: t1, r: r1, n: 't1'},
  {t: t2, r: r2, n: 't2'},
  {t: t3, r: r3, n: 't3'},
  {t: t4, r: r4, n: 't4'},
];

for (const rep of replacements) {
  let replacedStr = replaceWithCRLF(newContent, rep.t, rep.r);
  if (!replacedStr) {
    console.log("Failed " + rep.n);
    process.exit(1);
  }
  newContent = replacedStr;
}

fs.writeFileSync('src/utils/exportHtml.js', newContent);
console.log("Patched exportHtml.js for history cell borders and column header colors");
