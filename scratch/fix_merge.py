import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = """  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(39 + historyYears.length).letter;
    const startColCode = ws.getColumn(40).letter;
    ws.mergeCells(`${startColCode}5:${endColCode}5`);
  }"""

if t in code:
    code = code.replace(t, "")
    print("Fixed merge")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)