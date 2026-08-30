const fs = require('fs');
let code = fs.readFileSync('src/contexts/AppContext.jsx', 'utf8');

code = code.replace(
  "saveFile: { isOpen: false, data: null },",
  "saveFile: { isOpen: false, data: null },\n    openFile: { isOpen: false, data: null },"
);

fs.writeFileSync('src/contexts/AppContext.jsx', code, 'utf8');
console.log("Patched AppContext.jsx for openFile modal state");