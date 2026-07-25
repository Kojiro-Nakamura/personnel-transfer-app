const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 420; i < 430; i++) {
  if (lines[i].includes(']')) {
    if (lines[i-1].includes('【次年度】')) {
      lines[i-1] += ', "部長級昇進", "次長級昇進", "所属長級昇進", "課長級昇進", "補佐級III昇進", "補佐級II昇進", "補佐級I昇進", "係長級昇進"';
      break;
    }
  }
}

for (let i = 490; i < 520; i++) {
  if (lines[i].includes('emp.nextExclude || \'\'')) {
    lines[i] = lines[i] + ',\n        emp.promoYearDeptHead || \'\',\n        emp.promoYearDeputyHead || \'\',\n        emp.promoYearDivHead || \'\',\n        emp.promoYearSecHead || \'\',\n        emp.promoYearAssistant3 || \'\',\n        emp.promoYearAssistant2 || \'\',\n        emp.promoYearAssistant1 || \'\',\n        emp.promoYearChief || \'\'';
    break;
  }
}

for (let i = 590; i < 630; i++) {
  if (lines[i].includes('if (existingEmpMap.has(empNum)) {')) {
    lines[i] = `        if (cols.length >= 32) {
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
` + lines[i];
    break;
  }
}

for (let i = 600; i < 640; i++) {
  if (lines[i].includes('let newEmp = {')) {
    lines.splice(i + 1, 0, `          promoYearDeptHead: cols[24] || '',\n          promoYearDeputyHead: cols[25] || '',\n          promoYearDivHead: cols[26] || '',\n          promoYearSecHead: cols[27] || '',\n          promoYearAssistant3: cols[28] || '',\n          promoYearAssistant2: cols[29] || '',\n          promoYearAssistant1: cols[30] || '',\n          promoYearChief: cols[31] || '',`);
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
