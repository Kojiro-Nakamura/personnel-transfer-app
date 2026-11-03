import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = """             let bgColor = 'FFA7F3D0'; // Emerald default
             if (targetRow && targetRow.promoYearMap && targetRow.promoYearMap[targetYear]) {
                const pColor = getPromotedBgColorCode(targetRow.promoYearMap[targetYear]);
                if (pColor) bgColor = 'FF' + pColor.replace('#', '').toUpperCase();
             }
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };"""

r = """             let bgColor = null;
             if (targetRow && targetRow.promoYearMap && targetRow.promoYearMap[targetYear]) {
                const pColor = getPromotedBgColorCode(targetRow.promoYearMap[targetYear]);
                if (pColor) bgColor = 'FF' + pColor.replace('#', '').toUpperCase();
             }
             if (bgColor) {
                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
             }"""

code = code.replace(t, r)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)