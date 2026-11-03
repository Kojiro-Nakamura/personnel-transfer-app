import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """      let hireStr = '';
      if (extEmp.hireDate) hireStr = formatDateForDisplay(extEmp.hireDate);
      rowVals[24] = hireStr;"""

replace = """      let hireStr = '';
      if (extEmp.hireDate) {
        hireStr = formatDateForDisplay(extEmp.hireDate);
        const y = parseInt(String(extEmp.hireDate).split('-')[0], 10);
        if (extEmp.birthDate && !isNaN(y)) {
           const ag = calculateAge(extEmp.birthDate, y);
           if (ag) hireStr += `(${ag}歳)`;
        }
      }
      rowVals[24] = hireStr;"""

if search in code:
    code = code.replace(search, replace)
    print("Fixed hire date formatting in addSimplePlanSheet")
else:
    print("Could not find hireStr search string in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)