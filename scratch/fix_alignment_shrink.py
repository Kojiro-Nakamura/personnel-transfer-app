import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t1 = """          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };"""

r1 = """          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;
          const isNoShrink = (c === 28 || c === 29);
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: !isNoShrink, wrapText: false };"""

code = code.replace(t1, r1)

t2 = """          if (bottomStyle) cBorder.bottom = { style: bottomStyle };
          cell.border = cBorder;
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };"""

# Note: this text block might match BOTH loop 1 and loop 2!
# Let's check if the replacement replaces all instances.

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)