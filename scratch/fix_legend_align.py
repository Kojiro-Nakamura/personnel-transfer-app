import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Fix addPlanSheet (line 164)
# Old:
#   const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
#   const legendEndCol = 39 + currYearIndex;
# New:
#   const targetYearIndex = historyYears.indexOf(targetYear);
#   const legendEndCol = 37 + targetYearIndex;
t1 = """  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 39 + currYearIndex;"""
r1 = """  const targetYearIndex = Math.max(0, historyYears.indexOf(targetYear));
  const legendEndCol = 37 + targetYearIndex;"""
code = code.replace(t1, r1)

# 2. Fix addCurrentBasePlanSheet (line 2421)
# Old:
#   const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
#   const legendEndCol = 42 + currYearIndex;
# New:
#   const targetYearIndex = Math.max(0, historyYears.indexOf(targetYear));
#   const legendEndCol = 40 + targetYearIndex;
t2 = """  const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
  const legendEndCol = 42 + currYearIndex;"""
r2 = """  const targetYearIndex = Math.max(0, historyYears.indexOf(targetYear));
  const legendEndCol = 40 + targetYearIndex;"""
code = code.replace(t2, r2)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)