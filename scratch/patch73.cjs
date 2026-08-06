const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// Update padding and line height
content = content.replace(
  "th, td { border: 1px solid #94a3b8; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }",
  "th, td { border: 1px solid #94a3b8; padding: 2px 4px; vertical-align: top; overflow: hidden; word-break: break-word; line-height: 1.25; }"
);

// Make post cell text darker
content = content.replace(
  "color: #0369a1;",
  "color: #0c4a6e;"
);

fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Patch 73 complete.');
