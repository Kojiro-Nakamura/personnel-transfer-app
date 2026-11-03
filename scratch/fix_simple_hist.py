import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """        if (promoYearMap[y]) {
           const c = getPromotedBgColorCode(promoYearMap[y]);
           if (c) curPromoColors[34 + i + 1] = c;
        }"""

replace = """        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && y === targetYear) {
           const c = getPromotedBgColorCode(extEmp.nextGrade);
           if (c) curPromoColors[34 + i + 1] = c;
        } else if (promoYearMap[y]) {
           const c = getPromotedBgColorCode(promoYearMap[y]);
           if (c) curPromoColors[34 + i + 1] = c;
        }"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced simple plan history color")
else:
    print("Could not find simple plan history color block")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Done")