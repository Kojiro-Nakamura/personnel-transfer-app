import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Fix row heights
code = code.replace("row.height = 24;", "row.height = 13.20;")

# Find the highlight block in addCurrentBasePlanSheet processEmps
search1 = """          if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {
             if (emp.departmentId !== dept.id) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDBA74' } }; // orange-300
             } else if (emp.groupId !== currentGroupId) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE047' } }; // yellow-300
             }
          }"""

replace1 = """          if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {
             const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
             const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;
             if (nextPromoColor) {
                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
             }
          }"""

if search1 in code:
    code = code.replace(search1, replace1)
    print("Replaced main highlight block.")
else:
    print("Failed to replace main highlight block.")

search2 = """        if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {
           if (emp.departmentId !== 'unassigned') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDBA74' } }; // orange-300
           }
        }"""

replace2 = """        if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {
           const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
           const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : null;
           if (nextPromoColor) {
               cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + nextPromoColor.replace('#', '').toUpperCase() } };
           }
        }"""

if search2 in code:
    code = code.replace(search2, replace2)
    print("Replaced unassigned highlight block.")
else:
    print("Failed to replace unassigned highlight block.")


with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)