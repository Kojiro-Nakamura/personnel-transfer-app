import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

historyYears_logic = """  const allHistoryYears = new Set();
  employees.forEach(emp => {
    (emp.history || []).forEach(h => {
      if (h.year >= targetYear - 10 && h.year <= targetYear) {
         allHistoryYears.add(h.year);
      }
    });
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);
  
"""

target = "  const getEraSuffixLocal = (yearStr) => {"

code = code.replace(target, historyYears_logic + target)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)