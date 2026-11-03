import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t1 = """          if (((c >= 11 && c <= 17) || c === 4 || c === 5 || c === 19 || c === 39) && !isRetired && !isUnassigned) {
             const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
             const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;
             if (nextPromoColor) {
                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
             }
          }"""

r1 = """          if (((c >= 11 && c <= 17) || c === 4 || c === 5 || c === 19 || c === 39 || (c >= 31 && c <= 38)) && !isRetired && !isUnassigned) {
             const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
             const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;
             if (nextPromoColor) {
                 if (c >= 31 && c <= 38) {
                     const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };
                     const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
                     const key = pKeys[c - 30];
                     if (gradeToPromoKey[emp.nextGrade] === key) {
                         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
                     }
                 } else {
                     cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
                 }
             }
          }"""

code = code.replace(t1, r1)

t2 = """        if (((c >= 11 && c <= 17) || c === 4 || c === 5 || c === 19 || c === 39) && !isRetired && !isUnassigned) {
           const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
           const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;
           if (nextPromoColor) {
               cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
           }
        }"""

r2 = """        if (((c >= 11 && c <= 17) || c === 4 || c === 5 || c === 19 || c === 39 || (c >= 31 && c <= 38)) && !isRetired && !isUnassigned) {
           const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
           const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;
           if (nextPromoColor) {
               if (c >= 31 && c <= 38) {
                   const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };
                   const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
                   const key = pKeys[c - 30];
                   if (gradeToPromoKey[emp.nextGrade] === key) {
                       cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
                   }
               } else {
                   cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
               }
           }
        }"""

code = code.replace(t2, r2)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)