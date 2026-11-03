import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t1 = """          let ny = '';
          if (extEmp.nextGrade && extEmp.nextGrade !== '-' && extEmp.nextGrade !== '') {
            if (extEmp.nextGrade === '10' && extEmp.nextEmploymentType) {
              ny = extEmp.nextEmploymentType;
            } else {
              const gl = parseInt(extEmp.nextGrade, 10);
              if (!isNaN(gl) && gl >= 1 && gl <= 8) {
                ny = gradeList[gl];
              }
            }
          }
          vals[38] = ny;"""

r1 = """          let finalDiff = calculateServiceYears(extEmp.hireDate, targetYear, true);
          if (extEmp.currentGrade === '10' && extEmp.nextEmploymentType) {
             // do nothing
          } else {
            let prevDate = null;
            for (let i = pKeys.length - 1; i >= 0; i--) {
              const val = pKeys[i] === 'hireDate' ? extEmp.hireDate : (extEmp[pKeys[i]] || '');
              if (val) { prevDate = val; break; }
            }
            finalDiff = prevDate ? calculateServiceYears(prevDate, targetYear, true) : null;
          }
          let nYearStr = `> ${finalDiff !== null ? formatServiceYearsText(finalDiff) : ''}`;
          if (finalDiff !== null && extEmp.birthDate) {
            const ag = calculateAge(extEmp.birthDate, targetYear);
            if (ag) nYearStr += `(${ag}歳)`;
          }
          vals[38] = nYearStr;"""

if t1 in code:
    code = code.replace(t1, r1)
    print("Replaced t1")

t2 = """          let ny = '';
          if (extEmp.nextGrade && extEmp.nextGrade !== '-' && extEmp.nextGrade !== '') {
            if (extEmp.nextGrade === '10' && extEmp.nextEmploymentType) {
              ny = extEmp.nextEmploymentType;
            } else {
              const gl = parseInt(extEmp.nextGrade, 10);
              if (!isNaN(gl) && gl >= 1 && gl <= 8) {
                ny = gradeList[gl];
              }
            }
          }
          v[38] = ny;"""

r2 = """          let finalDiff = calculateServiceYears(extEmp.hireDate, targetYear, true);
          if (extEmp.currentGrade === '10' && extEmp.nextEmploymentType) {
             // do nothing
          } else {
            let prevDate = null;
            for (let i = pKeys.length - 1; i >= 0; i--) {
              const val = pKeys[i] === 'hireDate' ? extEmp.hireDate : (extEmp[pKeys[i]] || '');
              if (val) { prevDate = val; break; }
            }
            finalDiff = prevDate ? calculateServiceYears(prevDate, targetYear, true) : null;
          }
          let nYearStr = `> ${finalDiff !== null ? formatServiceYearsText(finalDiff) : ''}`;
          if (finalDiff !== null && extEmp.birthDate) {
            const ag = calculateAge(extEmp.birthDate, targetYear);
            if (ag) nYearStr += `(${ag}歳)`;
          }
          v[38] = nYearStr;"""

if t2 in code:
    code = code.replace(t2, r2)
    print("Replaced t2")


# Now add the grade highlight logic. We'll add it to the cell.fill logic inside the final loop.
with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)