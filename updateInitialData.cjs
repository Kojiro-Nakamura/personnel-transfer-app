const fs = require('fs');
let content = fs.readFileSync('src/constants/initialData.js', 'utf8');

// Find the INITIAL_EMPLOYEES array and replace it
const additionalFields = `, promoYearDeptHead: "", promoYearDeputyHead: "", promoYearDivHead: "", promoYearSecHead: "", promoYearAssistant3: "", promoYearAssistant2: "", promoYearAssistant1: "", promoYearChief: ""`;

content = content.replace(/note: "", orderCurrent: \d+, orderNext: \d+ \}/g, match => {
  return match.substring(0, match.length - 2) + additionalFields + ' }';
});

fs.writeFileSync('src/constants/initialData.js', content, 'utf8');
