import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

target = """          if (emp.promoYearDeptHead) promoYearMap[parseInt(String(emp.promoYearDeptHead).split('-')[0])] = "部長";
          row.promoYearMap = promoYearMap;

          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {
             let hStr = '';
             if (hy === targetYear) {
                const nDept = departments.find(d => d.id === extEmp.departmentId);"""

replacement = """          if (emp.promoYearDeptHead) promoYearMap[parseInt(String(emp.promoYearDeptHead).split('-')[0])] = "部長";
          r.promoYearMap = promoYearMap;

          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {
             let hStr = '';
             if (hy === targetYear) {
                const nDept = departments.find(d => d.id === extEmp.departmentId);"""

if target in code:
    code = code.replace(target, replacement)
    print("Fixed row reference!")
else:
    print("Row reference target not found!")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)