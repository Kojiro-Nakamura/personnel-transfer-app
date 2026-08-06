const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

content = content.replace(/getVal\('【今年度】人'\)/g, "getVal('【今年度】備考')");
content = content.replace(/getVal\('【今年度】カウント外'\)/g, "getVal('【今年度】カウント除外')");
content = content.replace(/getVal\('【来年度】人'\)/g, "getVal('【来年度】備考')");
content = content.replace(/getVal\('【来年度】カウント外'\)/g, "getVal('【来年度】カウント除外')");

fs.writeFileSync('src/components/modals/Modals.jsx', content, 'utf8');
console.log("Fixed CSV header mismatch for notes and excludes.");
