const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// Replace table CSS
content = content.replace(
  "table { border-collapse: collapse; table-layout: fixed; width: max-content; }",
  "table { border-collapse: collapse; table-layout: fixed; width: max-content; border-bottom: 1px solid #333; }"
);

content = content.replace(
  "th, td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }",
  "th, td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }"
);

// Replace border CSS rules
content = content.replace(
  /tr\.border-dept-top td \{ border-top: 3px solid #475569 !important; \}/,
  "tr.border-dept-top td { border-top: 2px solid #333 !important; }"
);

content = content.replace(
  /tr\.border-group-top td \{ border-top: 2px solid #94a3b8 !important; \}/,
  "tr.border-group-top td { border-top: 1px solid #333 !important; }\n    td:not(.post-cell):nth-child(1), td:not(.post-cell):nth-child(2), td:not(.post-cell):nth-child(3) { border-top: none !important; border-bottom: none !important; }"
);

fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Patch 70 complete.');
