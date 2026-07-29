const fs = require('fs');
const file = 'src/utils/helpers.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('getEraFormattedYear')) {
  content += `\nexport const getEraFormattedYear = (year) => {
  if (year >= 2019) return \`\${year}(R\${year - 2018})\`;
  if (year >= 1989) return \`\${year}(H\${year - 1988})\`;
  if (year >= 1926) return \`\${year}(S\${year - 1925})\`;
  if (year >= 1912) return \`\${year}(T\${year - 1911})\`;
  return \`\${year}\`;
};\n`;
  fs.writeFileSync(file, content, 'utf8');
}
