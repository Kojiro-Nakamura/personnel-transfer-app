const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const additionalFields = `, promoYearDeptHead: '', promoYearDeputyHead: '', promoYearDivHead: '', promoYearSecHead: '', promoYearAssistant3: '', promoYearAssistant2: '', promoYearAssistant1: '', promoYearChief: ''`;

content = content.replace(
  /nextExclude: '' \};/,
  `nextExclude: ''${additionalFields} };`
);

fs.writeFileSync(file, content, 'utf8');
