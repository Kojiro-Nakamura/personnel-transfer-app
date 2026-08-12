const fs = require('fs');
const file = 'src/utils/exportExcel.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `        if (colNumber === 1) {
          if (isNewDept) topBorder = 'thick';
          else if (structDeptHighlight) topBorder = true;
          else topBorder = false;
          
          if (structDeptHighlight) bottomBorder = true;
        } else if (colNumber === 2) {
          if (isNewDept) topBorder = 'thick';
          else if (structGroupHighlight) topBorder = true;
          else topBorder = false;
          
          if (structGroupHighlight) bottomBorder = true;
        } else if (colNumber === 3) {
          if (isNewDept) topBorder = 'thick';
          else if (structPostHighlight) topBorder = true;
          else topBorder = false;
          
          if (structPostHighlight) bottomBorder = true;
        } else {
          if (isNewDept) topBorder = 'thick';
          else topBorder = true;
        }`;

const replacementStr = `        if (colNumber === 1) {
          if (isNewDept) topBorder = 'thick';
          else if (structDeptHighlight) topBorder = true;
          else topBorder = false;
          
          if (structDeptHighlight) bottomBorder = true;
        } else if (colNumber === 2) {
          if (isNewDept) topBorder = 'thick';
          else if (structGroupHighlight) topBorder = true;
          else topBorder = false;
          
          if (structGroupHighlight) bottomBorder = true;
        } else if (colNumber === 3) {
          if (isNewDept) topBorder = 'thick';
          else if (structPostHighlight) topBorder = true;
          else topBorder = false;
          
          if (structPostHighlight) bottomBorder = true;
        } else if (colNumber === 17) {
          topBorder = false;
          bottomBorder = false;
        } else if (colNumber >= 18) {
          if (isNewDept) topBorder = 'thick';
          else if (extEmp) topBorder = true;
          else topBorder = false;
          
          if (extEmp) bottomBorder = true;
        } else {
          if (isNewDept) topBorder = 'thick';
          else topBorder = true;
        }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log('Successfully replaced border logic.');
} else {
  console.log('Could not find the target string!');
}
