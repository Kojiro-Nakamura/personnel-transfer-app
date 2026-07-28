const fs = require('fs');
const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/lang="en"/g, 'lang="ja"');

fs.writeFileSync(file, content, 'utf8');
