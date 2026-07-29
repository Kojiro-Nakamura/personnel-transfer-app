const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /calculateAge, parseJapaneseDate, parseCSVRow,/,
  'calculateAge, parseJapaneseDate, parseCSVRow, getEraFormattedYear,'
);
fs.writeFileSync(file, content, 'utf8');
