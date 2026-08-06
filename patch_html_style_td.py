import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    modals = f.read()

# 3. Update the data rows to calculate and display age
target_td = r'html \+= `\s*<tr>\s*<td class="sticky-col text-left" data-val="\$\{emp\.name\|\|''\}">\$\{emp\.name\|\|''\}</td>'
repl_td = '''      let ageStr = '';
      if (emp.birthDate) {
        const age = calculateAge(emp.birthDate, targetYear - 1);
        if (age !== null && !isNaN(age)) {
          ageStr = '(' + age + ')';
        }
      }
      const nameVal = emp.name || '';
      const nameWithAge = nameVal + ageStr;

      html += `
    <tr>
      <td class="sticky-col text-left" data-val="${nameVal}">${nameWithAge}</td>'''

modals = re.sub(target_td, repl_td, modals)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(modals)

print("SUCCESS")
