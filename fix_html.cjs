const fs = require('fs');
let code = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

code = code.replace('<th colspan="9" class="bg-slate">Šî–{î•ñ</th>', '<th colspan="8" class="bg-slate">Šî–{î•ñ</th>');

fs.writeFileSync('src/utils/exportHtml.js', code);
