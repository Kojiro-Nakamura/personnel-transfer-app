const fs = require('fs');
const file = 'src/contexts/AppContext.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { useExportActions } from '../hooks/useExportActions.js';",
  "import { useExportActions } from '../hooks/useExportActions.js';\nimport { STORAGE_KEY } from '../constants/config.js';"
);

fs.writeFileSync(file, content, 'utf8');
