import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = """  employees.forEach(emp => {
    (emp.history || []).forEach(h => {
      if (h.year >= targetYear - 10 && h.year <= targetYear) {
         allHistoryYears.add(h.year);
      }
    });
  });"""

r = """  allHistoryYears.add(targetYear);
  employees.forEach(emp => {
    (emp.history || []).forEach(h => {
      allHistoryYears.add(h.year);
    });
  });"""

if t in code:
    code = code.replace(t, r)
    print("Fixed history years range")
else:
    print("Pattern not found")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)