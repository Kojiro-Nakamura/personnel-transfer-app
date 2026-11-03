import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 3. Fix addSimplePlanSheet
t3 = """  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 35 + currYearIndex;"""
r3 = """  const targetYearIndex = Math.max(0, historyYears.indexOf(targetYear));
  const legendEndCol = 35 + targetYearIndex;"""
code = code.replace(t3, r3)

# 4. Fix addListSheet
t4 = """  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 36 + currYearIndex;"""
r4 = """  const targetYearIndex = Math.max(0, historyYears.indexOf(targetYear));
  const legendEndCol = 34 + targetYearIndex;"""
code = code.replace(t4, r4)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)