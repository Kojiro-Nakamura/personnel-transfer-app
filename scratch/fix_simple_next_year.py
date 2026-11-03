import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """      rowVals[33] = extEmp.nextEmploymentType || '';"""

replace = """      let finalDiff = null;
      if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade)) {
        finalDiff = 1;
      } else {
        let prevY = NaN;
        for (let i = pKeys.length - 1; i >= 0; i--) {
          const y = pKeys[i] === 'promoYearHire' ? (extEmp.hireDate ? parseInt(String(extEmp.hireDate).substring(0,4)) : NaN) : parseInt(extEmp[pKeys[i]] || 'NaN');
          if (!isNaN(y)) { prevY = y; break; }
        }
        finalDiff = (!isNaN(prevY)) ? targetYear - prevY + 1 : null;
      }
      let nYearStr = `> ${finalDiff !== null ? formatServiceYearsText(finalDiff) : ''}`;
      if (finalDiff !== null && extEmp.birthDate) {
        const ag = calculateAge(extEmp.birthDate, targetYear);
        if (ag) nYearStr += `(${ag}歳)`;
      }
      rowVals[33] = nYearStr;"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced simple plan next year")
else:
    print("Could not find simple plan next year")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Done")