with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = """      else if (colNumber <= 33) {
         argb = 'FFFDF4FF';
         if (colNumber === 33 && nextPromoColor) {
             argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
         }
      }
      else {
         argb = 'FFECFDF5';
      }

      // inCCg (Nx̘g)
      if (colNumber >= 27 && colNumber <= 34) {
         const pKeysOffset = colNumber - 26;
         const key = pKeys[pKeysOffset];
         if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === key) {
             const pc = getPromotedBgColorCode(emp.nextGrade);
             if (pc) argb = 'FF' + pc.replace('#', '').toUpperCase();
         }
      }

      // Z̒FƕύXm
      if (colNumber > 33) {
         const hcOffset = colNumber - 34;"""

r = """      else if (colNumber <= 35) {
         argb = 'FFFDF4FF';
         if (colNumber === 35 && nextPromoColor) {
             argb = 'FF' + nextPromoColor.replace('#', '').toUpperCase();
         }
      }
      else {
         argb = 'FFECFDF5';
      }

      // inCCg (Nx̘g)
      if (colNumber >= 27 && colNumber <= 34) {
         const pKeysOffset = colNumber - 26;
         const key = pKeys[pKeysOffset];
         if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === key) {
             const pc = getPromotedBgColorCode(emp.nextGrade);
             if (pc) argb = 'FF' + pc.replace('#', '').toUpperCase();
         }
      }

      // Z̒FƕύXm
      if (colNumber > 35) {
         const hcOffset = colNumber - 36;"""

if t in code:
    code = code.replace(t, r)
    with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
        f.write(code)
    print("Fixed!")
else:
    print("Not found! Trying with regex...")
    import re
    code = re.sub(r"else if \(colNumber <= 33\).*?const hcOffset = colNumber - 34;", 
                  r.replace("", ""), 
                  code, flags=re.DOTALL)
    # The regex approach above might mess up the japanese characters if not careful, I'll write a better regex if needed.