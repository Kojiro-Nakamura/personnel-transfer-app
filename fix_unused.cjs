const fs = require('fs');
let code = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');
code = code.replace(/import \{ generateAndDownloadHTML \} from '\.\.\/\.\.\/utils\/exportHtml\.js';\r?\n/, '');
code = code.replace(/\s*const handleExportHTML = \(\) => \{\r?\n\s*generateAndDownloadHTML\(employees, departments, targetYear\);\r?\n\s*\};\s*;\r?\n/, '\n');
fs.writeFileSync('src/components/modals/Modals.jsx', code);
console.log('done');