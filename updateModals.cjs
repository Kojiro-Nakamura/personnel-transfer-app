const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

// For Export CSV: headers
const oldHeadersStr = `"備考", "今年度_部署", "今年度_ポスト・班名", "今年度_班内ポスト", "今年度_役職", "今年度_位", "今年度_年数", "今年度_資格", "今年度_雇用", "今年度_カウント外",
      "次年度_部署", "次年度_ポスト・班名", "次年度_班内ポスト", "次年度_役職", "次年度_位", "次年度_年数", "次年度_資格", "次年度_雇用", "次年度_カウント外"`;
      
// I need to add 8 fields at the end.
const newHeadersStr = `"次年度_部署", "次年度_ポスト・班名", "次年度_班内ポスト", "次年度_役職", "次年度_位", "次年度_年数", "次年度_資格", "次年度_雇用", "次年度_カウント外", "部長級昇進", "次長級昇進", "所属長級昇進", "課長級昇進", "補佐級III昇進", "補佐級II昇進", "補佐級I昇進", "係長級昇進"`;

// Because of Mojibake, I will match by the array index instead or just do a regex replace on the row construction.
// Let's replace the array push in row map.

content = content.replace(/emp\.nextExclude \|\| ''\n\s+\];/g, `emp.nextExclude || '',
        emp.promoYearDeptHead || '',
        emp.promoYearDeputyHead || '',
        emp.promoYearDivHead || '',
        emp.promoYearSecHead || '',
        emp.promoYearAssistant3 || '',
        emp.promoYearAssistant2 || '',
        emp.promoYearAssistant1 || '',
        emp.promoYearChief || ''
      ];`);

// And for the headers array:
content = content.replace(/\];\n\s+const dMap = new Map\(localDepts/g, `,
      "部長級昇進", "次長級昇進", "所属長級昇進", "課長級昇進", "補佐級III昇進", "補佐級II昇進", "補佐級I昇進", "係長級昇進"
    ];
    const dMap = new Map(localDepts`);

// For Import CSV: cols parsing
// Instead of matching the destructuring, I can just grab the end of the CSV row in the parsing logic.
const newParsing = `
        if (cols.length >= 32) {
          const [,,,,,,,,,,,,,,,,,,,,,,,, nPromoDept, nPromoDep, nPromoDiv, nPromoSec, nPromoA3, nPromoA2, nPromoA1, nPromoChief] = cols;
          targetEmp.promoYearDeptHead = nPromoDept || '';
          targetEmp.promoYearDeputyHead = nPromoDep || '';
          targetEmp.promoYearDivHead = nPromoDiv || '';
          targetEmp.promoYearSecHead = nPromoSec || '';
          targetEmp.promoYearAssistant3 = nPromoA3 || '';
          targetEmp.promoYearAssistant2 = nPromoA2 || '';
          targetEmp.promoYearAssistant1 = nPromoA1 || '';
          targetEmp.promoYearChief = nPromoChief || '';
        }
`;

content = content.replace(/if \(existingEmpMap\.has\(empNum\)\) \{/g, `if (existingEmpMap.has(empNum)) {
        let targetEmp = existingEmpMap.get(empNum);${newParsing}`);

content = content.replace(/let newEmp = \{/g, `let newEmp = {
          promoYearDeptHead: cols[24] || '',
          promoYearDeputyHead: cols[25] || '',
          promoYearDivHead: cols[26] || '',
          promoYearSecHead: cols[27] || '',
          promoYearAssistant3: cols[28] || '',
          promoYearAssistant2: cols[29] || '',
          promoYearAssistant1: cols[30] || '',
          promoYearChief: cols[31] || '',
`);


fs.writeFileSync(file, content, 'utf8');
