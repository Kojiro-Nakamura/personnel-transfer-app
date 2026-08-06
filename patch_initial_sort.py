import sys

with open('src/utils/exportHtml.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = "    employees.forEach((emp, index) => {"

repl = """    const sortedEmployees = [...employees].sort((a, b) => {
        const gradeA = getGradeLevel(a.currentGrade);
        const gradeB = getGradeLevel(b.currentGrade);
        if (gradeA !== gradeB) {
          return gradeB - gradeA;
        }
        
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        const getYear = (emp) => {
            for (let i = pKeys.length - 1; i >= 0; i--) {
                const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                if (!isNaN(y)) return y;
            }
            return NaN;
        };
        const yA = getYear(a);
        const yB = getYear(b);
        
        if (!isNaN(yA) && !isNaN(yB)) {
            return yA - yB;
        } else if (!isNaN(yA)) {
            return -1;
        } else if (!isNaN(yB)) {
            return 1;
        }
        return 0;
    });

    sortedEmployees.forEach((emp, index) => {"""

if target in text:
    text = text.replace(target, repl)
    with open('src/utils/exportHtml.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Patch applied to exportHtml.js")
else:
    print("Target not found")
