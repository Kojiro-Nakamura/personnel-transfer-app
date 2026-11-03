import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t1 = "  const legendEndCol = 37 + targetYearIndex;"
r1 = "  const legendEndCol = 36 + targetYearIndex;"
code = code.replace(t1, r1)

t2 = "  const legendEndCol = 35 + targetYearIndex;"
r2 = "  const legendEndCol = 34 + targetYearIndex;"
code = code.replace(t2, r2)

t3 = "  const legendEndCol = 34 + targetYearIndex;"
r3 = "  const legendEndCol = 33 + targetYearIndex;"
# Wait! Since I just replaced 35 -> 34, there might be TWO instances of 34 now!
# I should do replacements sequentially but carefully, or use regex.