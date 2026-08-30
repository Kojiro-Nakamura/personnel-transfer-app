const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
  "loadJSON, handleCellClick,",
  "loadJSON, loadFromData, handleCellClick,"
);

const modalCb = `onLoadData={(data, fileName) => {
          // AppContext has loadFromData if we exported it, let's use it
          // Wait, AppContext has loadFromData? Let's check how we can access it.
          // loadFromData is not exposed in useApp() yet.
        }}`;

code = code.replace(modalCb, `onLoadData={(data, fileName) => loadFromData(data, fileName)}`);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log("Patched App.jsx again");