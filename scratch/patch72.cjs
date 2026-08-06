const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// Replace general table borders
content = content.replace(
  "table { border-collapse: collapse; table-layout: fixed; width: max-content; border-bottom: 1px solid #333; }",
  "table { border-collapse: collapse; table-layout: fixed; width: max-content; border-bottom: 1px solid #94a3b8; }"
);

content = content.replace(
  "th, td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }",
  "th, td { border: 1px solid #94a3b8; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }"
);

content = content.replace(
  "thead th { border: 1px solid #333 !important; outline: 1px solid #333; outline-offset: -1px; }",
  "thead th { border: 1px solid #94a3b8 !important; outline: 1px solid #94a3b8; outline-offset: -1px; }"
);

content = content.replace(
  "th { background-color: #f0f0f0; border-bottom: 2px solid #333; }",
  "th { background-color: #f0f0f0; border-bottom: 1.5px solid #475569; }"
);

// Replace column thick borders
content = content.replace(
  "td:nth-child(4), td:nth-child(10), td:nth-child(16) { border-left: 2px solid #475569; }",
  "td:nth-child(4), td:nth-child(10), td:nth-child(16) { border-left: 1.5px solid #475569; }"
);

content = content.replace(
  "thead tr:nth-child(2) th:nth-child(4), thead tr:nth-child(2) th:nth-child(5), thead tr:nth-child(2) th:nth-child(6) { border-left: 2px solid #475569 !important; }",
  "thead tr:nth-child(2) th:nth-child(4), thead tr:nth-child(2) th:nth-child(5), thead tr:nth-child(2) th:nth-child(6) { border-left: 1.5px solid #475569 !important; }"
);

content = content.replace(
  "thead tr:nth-child(3) th:nth-child(1), thead tr:nth-child(3) th:nth-child(7) { border-left: 2px solid #475569 !important; }",
  "thead tr:nth-child(3) th:nth-child(1), thead tr:nth-child(3) th:nth-child(7) { border-left: 1.5px solid #475569 !important; }"
);

// Replace row thick borders
content = content.replace(
  "tr.border-dept-top td { border-top: 2px solid #333 !important; }",
  "tr.border-dept-top td { border-top: 1.5px solid #475569 !important; }"
);

content = content.replace(
  "tr.border-group-top td { border-top: 1px solid #333 !important; }",
  "tr.border-group-top td { border-top: 1px solid #94a3b8 !important; }"
);

// We need to keep the logic for uncolored cells, so that's unchanged.

fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Patch 72 complete.');
