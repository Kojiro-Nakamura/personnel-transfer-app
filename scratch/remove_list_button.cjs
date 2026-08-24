const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const regex = /\s*<button onClick=\{\(\) => openModal\('saveFile', \{ type: 'list', defaultName:[^>]+>.*?職員一覧<\/button>/;

if (regex.test(code)) {
  code = code.replace(regex, '');
  fs.writeFileSync('src/App.jsx', code);
  console.log('done');
} else {
  console.log('not found');
}
