const fs = require('fs');
let text = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

// 1. nameWithAge -> add '歳'
const nameWithAgeRegex = /const nameWithAge = nameVal \+ \(ageStr \? ' ' \+ ageStr : ''\);/;
const replNameWithAge = `const ageStrFormatted = ageStr ? ageStr.replace(')', '歳)') : '';
      const nameWithAge = nameVal + (ageStrFormatted ? ' ' + ageStrFormatted : '');`;
if (nameWithAgeRegex.test(text)) {
  text = text.replace(nameWithAgeRegex, replNameWithAge);
  console.log('nameWithAge replaced');
} else {
  console.log('nameWithAge not found');
}

// 2. renderPromo -> add age
const renderPromoRegex = /if \(suffix\) cellHtml \+= `<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">\(\$\{suffix\}\)<\/span>`;\n\s*}/g;
const replRenderPromo = `if (suffix) cellHtml += \`<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">(\${suffix})</span>\`;
          if (emp.birthDate && !isNaN(currentY)) {
             const promoAge = calculateAge(emp.birthDate, currentY);
             if (promoAge !== null && !isNaN(promoAge)) {
                cellHtml += \`<span style="font-size: 10px; color: #334155; margin-left: 2px;">\${promoAge}歳</span>\`;
             }
          }
        }`;
if (renderPromoRegex.test(text)) {
  text = text.replace(renderPromoRegex, replRenderPromo);
  console.log('renderPromo replaced');
} else {
  console.log('renderPromo not found');
}

// 3. renderHireDate
const hireDateRegex = /<td class="bg-fuchsia" data-val="\$\{emp\.hireDate \? emp\.hireDate\.substring\(0,4\) : ''\}">\$\{emp\.hireDate \? emp\.hireDate\.substring\(0,4\) : ''\}<\/td>/;
const replHireDate = `\${(() => {
        const hireYear = emp.hireDate ? emp.hireDate.substring(0,4) : '';
        let cellHtml = hireYear;
        if (hireYear) {
          const suffix = getEraSuffixLocal(hireYear);
          if (suffix) cellHtml += \`<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">(\${suffix})</span>\`;
          if (emp.birthDate) {
             const hAge = calculateAge(emp.birthDate, parseInt(hireYear));
             if (hAge !== null && !isNaN(hAge)) {
                cellHtml += \`<span style="font-size: 10px; color: #334155; margin-left: 2px;">\${hAge}歳</span>\`;
             }
          }
        }
        return \`<td class="bg-fuchsia" data-val="\${hireYear}"><div style="display:flex;align-items:center;justify-content:center;">\${cellHtml}</div></td>\`;
      })()}`;
if (hireDateRegex.test(text)) {
  text = text.replace(hireDateRegex, replHireDate);
  console.log('hireDate replaced');
} else {
  console.log('hireDate not found');
}

fs.writeFileSync('src/components/modals/Modals.jsx', text, 'utf8');
