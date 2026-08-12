import fs from 'fs';

let content = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const startMarker = "const isDeptLevelHighlight = (isNewDept || isDeptPost) && filterLevel === 0;";
const endMarker = "cell.border = getCellBorders(topBorder, false, isLeftEdge ? 'thick' : true, isRightEdge ? 'thick' : true);";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1 + endMarker.length) {
    const replacement = `const structDeptHighlight = isNewDept || isDeptPost;
      const structGroupHighlight = structDeptHighlight || isNewGroup || isGroupPost;
      const structPostHighlight = structGroupHighlight || isPostCell;

      const isDeptLevelHighlight = structDeptHighlight && filterLevel === 0;
      const isGroupLevelHighlight = structGroupHighlight && filterLevel === 0;
      const isPostLevelHighlight = structPostHighlight && filterLevel === 0;
  
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = defaultFont;
        cell.alignment = { vertical: 'middle', wrapText: true };
        
        if (colNumber >= 3) {
          cell.alignment = { ...cell.alignment, horizontal: 'center' };
        }
        
        const isLeftEdge = colNumber === 1 || colNumber === 4 || colNumber === 10 || colNumber === 16;
        const isRightEdge = colNumber === 3 || colNumber === 9 || colNumber === 15 || colNumber === 16;
        
        let topBorder = true;
        let bottomBorder = false;

        if (colNumber === 1) {
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
        }
  
        cell.border = getCellBorders(topBorder, bottomBorder, isLeftEdge ? 'thick' : true, isRightEdge ? 'thick' : true);`;

    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync('src/utils/exportExcel.js', content, 'utf8');
    console.log('Replaced perfectly!');
} else {
    console.log('Markers not found!');
}
