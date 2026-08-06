import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target_memo_regex = r'allEmps\.forEach\(emp => \{[\s\S]*?if \(!hasHistory\) return \[\];'

repl_memo = '''allEmps.forEach(emp => {
      if (emp.history && emp.history.length > 0) {
        hasHistory = true;
        emp.history.forEach(h => {
          if (h.year < min) min = h.year;
          if (h.year > max) max = h.year;
        });
      }
    });

    if (targetYear) {
      hasHistory = true;
      if (targetYear < min) min = targetYear;
      if (targetYear > max) max = targetYear;
    }

    if (!hasHistory) return [];'''

content = re.sub(target_memo_regex, repl_memo, content)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS memo replace")
