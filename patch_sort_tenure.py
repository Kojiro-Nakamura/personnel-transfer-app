import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = r'''    \} else \{
      items\.sort\(\(a, b\) => \{
        const gradeA = getGradeLevel\(a\.currentGrade\);
        const gradeB = getGradeLevel\(b\.currentGrade\);
        if \(gradeA !== gradeB\) \{
          return gradeB - gradeA;
        \}
        const yA = Number\(a\.currentYears \|\| 0\);
        const yB = Number\(b\.currentYears \|\| 0\);
        return yB - yA;
      \}\);
    \}'''

replacement = '''    } else {
      items.sort((a, b) => {
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
            return yA - yB; // Ascending year = Descending tenure
        } else if (!isNaN(yA)) {
            return -1;
        } else if (!isNaN(yB)) {
            return 1;
        }
        return 0;
      });
    }'''

content = re.sub(target, replacement, content)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS patched sortedEmps logic")
