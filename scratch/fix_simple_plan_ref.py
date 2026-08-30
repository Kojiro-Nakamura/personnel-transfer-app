import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Change const extEmp = nextEmp || currEmp; to const extEmp = nextEmp;
search1 = "const extEmp = nextEmp || currEmp;"
replace1 = "const extEmp = nextEmp;"
code = code.replace(search1, replace1)

# 2. Fix the history tracking logic and add coloring
search2 = """      const pKeys = ['promoYearHire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };
      
      for (let idx = 1; idx < pKeys.length; idx++) {
        const key = pKeys[idx];
        let cellVal = extEmp[key] || '';
        if (extEmp.nextGrade && gradeToPromoKey[extEmp.nextGrade] === key) {
           cellVal = targetYear + '-04-01';
        }
        rowVals[24 + idx] = cellVal ? formatDateForDisplay(cellVal) : '';
      }
      rowVals[33] = extEmp.nextEmploymentType || '';
      
      historyYears.forEach((y, i) => {
        let historyStr = '';
        if (extEmp.history) {
          const h = extEmp.history.find(x => x.year === y);
          if (h) historyStr = h.deptName ? h.deptName + ' / ' + h.title : h.title;
        }
        rowVals[34 + i] = historyStr;
      });"""

replace2 = """      const pKeys = ['promoYearHire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };
      const curPromoColors = {};

      const promoYearMap = {};
      if (extEmp.promoYearChief) promoYearMap[parseInt(extEmp.promoYearChief)] = "係長級(主査)";
      if (extEmp.promoYearAssistant1) promoYearMap[parseInt(extEmp.promoYearAssistant1)] = "補佐級I(主任)";
      if (extEmp.promoYearAssistant2) promoYearMap[parseInt(extEmp.promoYearAssistant2)] = "補佐級II(班長)";
      if (extEmp.promoYearAssistant3) promoYearMap[parseInt(extEmp.promoYearAssistant3)] = "補佐級III(補佐兼班長)";
      if (extEmp.promoYearSecHead) promoYearMap[parseInt(extEmp.promoYearSecHead)] = "課長級";
      if (extEmp.promoYearDivHead) promoYearMap[parseInt(extEmp.promoYearDivHead)] = "所属長級";
      if (extEmp.promoYearDeputyHead) promoYearMap[parseInt(extEmp.promoYearDeputyHead)] = "次長級";
      if (extEmp.promoYearDeptHead) promoYearMap[parseInt(extEmp.promoYearDeptHead)] = "部長級";

      let isPromotedThisYear = false;
      for (let idx = 1; idx < pKeys.length; idx++) {
        const key = pKeys[idx];
        let cellVal = extEmp[key] || '';
        let isNextPromo = false;
        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === key) {
           isNextPromo = true;
           isPromotedThisYear = true;
           cellVal = targetYear + '-04-01';
        }
        rowVals[24 + idx] = cellVal ? formatDateForDisplay(cellVal) : '';
        if (isNextPromo) {
           curPromoColors[24 + idx + 1] = getPromotedBgColorCode(extEmp.nextGrade); // +1 because rowVals is 0-indexed, excel columns are 1-indexed
        }
      }
      
      if (isPromotedThisYear) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[14] = c; // 氏名
             curPromoColors[15] = c; // 年齢
         }
      }
      
      rowVals[33] = extEmp.nextEmploymentType || '';
      
      historyYears.forEach((y, i) => {
        let historyStr = '';
        if (extEmp.history) {
          const h = extEmp.history.find(x => x.year === y);
          if (h) historyStr = h.department ? h.department + (h.title ? ' / ' + h.title : '') : (h.title || '');
        }
        rowVals[34 + i] = historyStr;
        if (promoYearMap[y]) {
           const c = getPromotedBgColorCode(promoYearMap[y]);
           if (c) curPromoColors[34 + i + 1] = c;
        }
      });
"""
code = code.replace(search2, replace2)

search3 = """    const tr = ws.addRow(rowVals);

    for (let c = 1; c <= totalCols; c++) {"""

replace3 = """    const tr = ws.addRow(rowVals);

    if (extEmp && typeof curPromoColors !== 'undefined') {
      Object.keys(curPromoColors).forEach(cIdx => {
         const cell = tr.getCell(parseInt(cIdx));
         const color = curPromoColors[cIdx].replace('#', '').toUpperCase();
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color } };
      });
    }

    for (let c = 1; c <= totalCols; c++) {"""

code = code.replace(search3, replace3)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Applied fix for reference rows in simple plan")