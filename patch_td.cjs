const fs = require('fs');
let text = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

const regex = /html \+= `\s*<tr>\s*<td class="sticky-col text-left" data-val="\$\{emp\.name\|\|''\}">\$\{emp\.name\|\|''\}<\/td>/;

const newTd = `      let ageStr = '';
      if (emp.birthDate) {
        const age = calculateAge(emp.birthDate, targetYear - 1);
        if (age !== null && !isNaN(age)) {
          ageStr = '(' + age + ')';
        }
      }
      const nameVal = emp.name || '';
      const nameWithAge = nameVal + ageStr;

      html += \`
    <tr>
      <td class="sticky-col text-left" data-val="\${nameVal}">\${nameWithAge}</td>`;

if (regex.test(text)) {
  text = text.replace(regex, newTd);
  console.log('TD replaced successfully');
  fs.writeFileSync('src/components/modals/Modals.jsx', text, 'utf8');
} else {
  console.log('Regex did not match');
}
