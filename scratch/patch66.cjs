const fs = require('fs');
let content = fs.readFileSync('src/utils/exportHtml.js', 'utf8');

content = content.replace(/emp\.nextSkillsStr/g, "(emp.nextSkills || []).join('、')");
content = content.replace(/emp\.currentSkillsStr/g, "(emp.currentSkills || []).join('、')");

fs.writeFileSync('src/utils/exportHtml.js', content);
console.log('Done');
