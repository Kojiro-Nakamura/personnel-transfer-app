import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t_search = """      if (nextEmp && isNextTransferred && c >= 8 && c <= 11) {
        if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {"""

t_replace = """      if (nextEmp && c >= 8 && c <= 11) {
        if (getGradeLevel(nextEmp.nextGrade) > getGradeLevel(nextEmp.currentGrade)) {"""

if t_search in code:
    code = code.replace(t_search, t_replace)
    with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
        f.write(code)
    print("Fixed!")
else:
    print("Could not find!")