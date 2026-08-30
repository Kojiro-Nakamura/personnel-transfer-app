const fs = require('fs');
let code = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

if (!code.includes("import { saveSnapshot }")) {
  code = "import { saveSnapshot } from '../utils/indexedDB.js';\n" + code;
}

code = code.replace(
  /setCurrentFileName\(fileName\);/g,
  `setCurrentFileName(fileName);\n    saveSnapshot(fileName, dataToSave).catch(err => console.error("Failed to save snapshot", err));`
);

fs.writeFileSync('src/hooks/useExportActions.js', code, 'utf8');
console.log("Patched exportToJSON");