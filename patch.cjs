const fs = require('fs');
let content = fs.readFileSync('src/utils/exportExcel.js', 'utf8');

const target = `      const isPostCell = formattedPostName !== '' && formattedPostName !== '班員';
      const isDeptPost = isPostCell && groupName === ''; 
      const isGroupPost = isPostCell && groupName !== '';
      const isDeptLevelHighlight = (isNewDept || isDeptPost) && filterLevel === 0;
      const isGroupLevelHighlight = (isDeptLevelHighlight || isNewGroup || isGroupPost) && filterLevel === 0;
      const isPostLevelHighlight = (isGroupLevelHighlight || isPostCell) && filterLevel === 0;
  
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = defaultFont;
        cell.alignment = { vertical: 'middle', wrapText: true };
        
        if (colNumber >= 3) {
          cell.alignment = { ...cell.alignment, horizontal: 'center' };
        }
        
        const isLeftEdge = colNumber === 1 || colNumber === 4 || colNumber === 10 || colNumber === 16;
        const isRightEdge = colNumber === 3 || colNumber === 9 || colNumber === 15 || colNumber === 16;
        let topBorder = true;
        if (isNewDept) topBorder = 'thick';
        else if (isNewGroup) topBorder = true;
        else if (colNumber <= 3 && !isPostLevelHighlight) topBorder = false; 
  
        cell.border = getCellBorders(topBorder, false, isLeftEdge ? 'thick' : true, isRightEdge ? 'thick' : true);`;

const replacement = `      const isPostCell = formattedPostName !== '' && formattedPostName !== '班員';
      const isDeptPost = isPostCell && groupName === ''; 
      const isGroupPost = isPostCell && groupName !== '';
      
      const structDeptHighlight = isNewDept || isDeptPost;
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

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/utils/exportExcel.js', content);
    console.log('Success');
} else {
    console.log('Target not found - trying carriage return replace');
    const target2 = target.replace(/\n/g, '\r\n');
    if (content.includes(target2)) {
        content = content.replace(target2, replacement.replace(/\n/g, '\r\n'));
        fs.writeFileSync('src/utils/exportExcel.js', content);
        console.log('Success (CRLF)');
    } else {
        console.log('Target still not found');
    }
}
