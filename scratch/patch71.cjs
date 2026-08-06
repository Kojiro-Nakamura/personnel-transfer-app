const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// Change text-align: center to text-align: left for Name columns
content = content.replace(
  "td:nth-child(5), td:nth-child(11) { white-space: nowrap; text-overflow: ellipsis; text-align: center; }",
  "td:nth-child(5), td:nth-child(11) { white-space: nowrap; text-overflow: ellipsis; text-align: left; }"
);

fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Patch 71 complete.');
