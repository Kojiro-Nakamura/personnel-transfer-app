import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search_plan = """        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === key) {
           isNextPromo = true;
           cellVal = `${targetYear}-04-01`;
        }
        rowVals[28 + idx] = cellVal ? formatDateForDisplay(cellVal) : '';"""

replace_plan = """        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === key) {
           isNextPromo = true;
           cellVal = `${targetYear}-04-01`;
        }
        
        let prevDate = '';
        if (cellVal) {
           for (let i = idx - 1; i >= 0; i--) {
             let pVal = pKeys[i] === 'hireDate' ? extEmp.hireDate : (extEmp[pKeys[i]] || '');
             if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === pKeys[i]) {
                 pVal = `${targetYear}-04-01`;
             }
             if (pVal) { prevDate = pVal; break; }
           }
        }
        
        const diff = (prevDate && cellVal) ? calculateServiceYears(prevDate, cellVal, true) : null;
        let cellStr = '';
        if (cellVal) {
           if (diff !== null) cellStr += `${formatServiceYearsText(diff)}> `;
           else cellStr += `> `;
           
           cellStr += formatDateForDisplay(cellVal);
           const y = parseInt(String(cellVal).split('-')[0], 10);
           if (extEmp.birthDate && !isNaN(y)) {
              const ag = calculateAge(extEmp.birthDate, y);
              if (ag) cellStr += `(${ag}歳)`;
           }
        }
        rowVals[28 + idx] = cellStr;"""

search_simple = """        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === key) {
           isNextPromo = true;
           isPromotedThisYear = true;
           cellVal = targetYear + '-04-01';
        }
        rowVals[24 + idx] = cellVal ? formatDateForDisplay(cellVal) : '';"""

replace_simple = """        if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === key) {
           isNextPromo = true;
           isPromotedThisYear = true;
           cellVal = targetYear + '-04-01';
        }
        
        let prevDate = '';
        if (cellVal) {
           for (let i = idx - 1; i >= 0; i--) {
             let pVal = pKeys[i] === 'promoYearHire' ? extEmp.hireDate : (extEmp[pKeys[i]] || '');
             if (getGradeLevel(extEmp.nextGrade) > getGradeLevel(extEmp.currentGrade) && gradeToPromoKey[extEmp.nextGrade] === pKeys[i]) {
                 pVal = `${targetYear}-04-01`;
             }
             if (pVal) { prevDate = pVal; break; }
           }
        }
        
        const diff = (prevDate && cellVal) ? calculateServiceYears(prevDate, cellVal, true) : null;
        let cellStr = '';
        if (cellVal) {
           if (diff !== null) cellStr += `${formatServiceYearsText(diff)}> `;
           else cellStr += `> `;
           
           cellStr += formatDateForDisplay(cellVal);
           const y = parseInt(String(cellVal).split('-')[0], 10);
           if (extEmp.birthDate && !isNaN(y)) {
              const ag = calculateAge(extEmp.birthDate, y);
              if (ag) cellStr += `(${ag}歳)`;
           }
        }
        rowVals[24 + idx] = cellStr;"""

if search_plan in code:
    code = code.replace(search_plan, replace_plan)
    print("Replaced plan")
if search_simple in code:
    code = code.replace(search_simple, replace_simple)
    print("Replaced simple plan")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)
print("Done")