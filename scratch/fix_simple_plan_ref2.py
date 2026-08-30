import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search1 = """      if (isPromotedThisYear) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[14] = c; // 氏名
             curPromoColors[15] = c; // 年齢
         }
      }"""

replace1 = """      if (isPromotedThisYear) {
         const c = getPromotedBgColorCode(extEmp.nextGrade);
         if (c) {
             curPromoColors[14] = c; // 氏名
             curPromoColors[15] = c; // 年齢
             curPromoColors[34] = c; // 来年度
         }
      }"""

code = code.replace(search1, replace1)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Applied fix for 来年度 coloring in simple plan")