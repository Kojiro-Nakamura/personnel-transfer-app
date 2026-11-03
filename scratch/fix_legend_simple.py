import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 3. Fix addSimplePlanSheet (line 877)
# Old:
#   const currYearIndex = Math.max(0, historyYears.indexOf(targetYear - 1));
#   const legendEndCol = 35 + currYearIndex;
# Let's find out where history starts for addSimplePlanSheet.