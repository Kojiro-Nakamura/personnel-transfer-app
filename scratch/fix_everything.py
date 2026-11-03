import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Fix the grades so coloring works
code = code.replace('"係長(主査)"', '"係長級(主査)"')
code = code.replace('"補佐I(主任)"', '"補佐級I(主任)"')
code = code.replace('"補佐II(班長)"', '"補佐級II(班長)"')
code = code.replace('"補佐III(補佐兼班長)"', '"補佐級III(補佐兼班長)"')
code = code.replace('"課長"', '"課長級"')
code = code.replace('"所属長"', '"所属長級"')
code = code.replace('"次長"', '"次長級"')
code = code.replace('"部長"', '"部長級"')

# Double check that we don't have r.promoYearMap in the first loop
# The first loop uses 'row' and is around line 2780.
# The second loop uses 'r' and is around line 3090.
# Let's just make sure both are correct.

t1 = """          if (emp.promoYearDeptHead) promoYearMap[parseInt(String(emp.promoYearDeptHead).split('-')[0])] = "部長級";
          r.promoYearMap = promoYearMap;

          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {
             let hStr = '';
             if (hy === targetYear) {
                const nDept = departments.find(d => d.id === extEmp.departmentId);"""

r1 = """          if (emp.promoYearDeptHead) promoYearMap[parseInt(String(emp.promoYearDeptHead).split('-')[0])] = "部長級";
          row.promoYearMap = promoYearMap;

          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {
             let hStr = '';
             if (hy === targetYear) {
                const nDept = departments.find(d => d.id === extEmp.departmentId);"""

if t1 in code:
    code = code.replace(t1, r1)
    print("Fixed first loop 'r' to 'row'")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)