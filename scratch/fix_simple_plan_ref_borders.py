import os
import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Fix header borders in addSimplePlanSheet
search1 = """      cell.border = {
        top: { style: topStyle, color: { argb: 'FF000000' } },
        bottom: { style: bottomStyle, color: { argb: 'FF000000' } },
        left: { style: leftStyle, color: { argb: 'FF000000' } },
        right: { style: rightStyle, color: { argb: 'FF000000' } }
      };"""

replace1 = """      if (c >= 14) {
        const topB = rn === 4 ? 'thick' : false;
        let bottomB = rn === 5 ? 'thick' : false;
        if (rn === 4) bottomB = true; 
        
        const leftB = [14, 15, 16, 17, 23, 33].includes(c) ? 'thick' : true;
        const rightB = [14, 15, 16, 22, 32, totalCols].includes(c) ? 'thick' : true;
        
        const newBorder = getCellBorders(topB, bottomB, leftB, rightB);
        cell.border = newBorder;
      } else {
        cell.border = {
          top: { style: topStyle, color: { argb: 'FF000000' } },
          bottom: { style: bottomStyle, color: { argb: 'FF000000' } },
          left: { style: leftStyle, color: { argb: 'FF000000' } },
          right: { style: rightStyle, color: { argb: 'FF000000' } }
        };
      }"""

code = code.replace(search1, replace1)

# Fix data row borders in addSimplePlanSheet
search2 = """      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 24) || c >= 35);
      const shouldShrink = (c !== 2 && c !== 3);
      cell.alignment = { vertical: 'middle', horizontal: isLeft ? 'left' : 'center', shrinkToFit: shouldShrink, wrapText: false };
      cell.font = { name: 'BIZ UDPゴシック', size: 9 };
      
      let topStyle = 'hair';
      if (rowIndex === 6) topStyle = 'medium';
      else if (isNewDept) topStyle = 'medium';
      else if (isNewGroup) topStyle = 'mediumDashed';
      
      const leftStyle = (c === 1 || c === 2 || c === 8) ? 'medium' : 'thin';
      const rightStyle = (c === 12 || c === 1 || c === 7) ? 'medium' : 'thin';
      
      if (c === 1) {
        let c1Top = undefined;
        if (rowIndex === 6) c1Top = 'medium';
        else if (isNewDept) c1Top = 'medium';
        else if (isNewGroup) c1Top = 'thin';
        else c1Top = 'thin'; // or hair if merged, but simplifed here

        let c1Bottom = undefined;
        if (isLastRow) c1Bottom = 'medium';
        else if (isNextDept || isNextGroup) c1Bottom = 'thin';

        cell.border = {
          top: { style: c1Top || topStyle, color: { argb: 'FF000000' } },
          bottom: { style: c1Bottom || 'hair', color: { argb: 'FF000000' } },
          left: { style: leftStyle, color: { argb: 'FF000000' } },
          right: { style: rightStyle, color: { argb: 'FF000000' } }
        };
      } else {
        let bottomS = 'hair';
        if (isLastRow) bottomS = 'medium';
        else if (isNextDept) bottomS = 'medium';
        else if (isNextGroup) bottomS = 'mediumDashed';

        cell.border = {
          top: { style: topStyle, color: { argb: 'FF000000' } },
          bottom: { style: bottomS, color: { argb: 'FF000000' } },
          left: { style: leftStyle, color: { argb: 'FF000000' } },
          right: { style: rightStyle, color: { argb: 'FF000000' } }
        };
      }"""

replace2 = """      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 24) || c >= 35);
      const shouldShrink = (c !== 2 && c !== 3);
      cell.alignment = { vertical: 'middle', horizontal: isLeft ? 'left' : 'center', shrinkToFit: shouldShrink, wrapText: false };
      cell.font = { name: 'BIZ UDPゴシック', size: 9 };
      
      let topStyle = 'hair';
      if (rowIndex === 6) topStyle = 'medium';
      else if (isNewDept) topStyle = 'medium';
      else if (isNewGroup) topStyle = 'mediumDashed';
      
      const leftStyle = (c === 1 || c === 2 || c === 8) ? 'medium' : 'thin';
      const rightStyle = (c === 12 || c === 1 || c === 7) ? 'medium' : 'thin';
      
      if (c >= 14) {
        let topBorder = false;
        let bottomBorder = false;
        if (isNewDept) topBorder = 'thick';
        else if (extEmp) topBorder = true;
        
        if (extEmp) bottomBorder = true;
        
        const isLeftEdge = [14, 15, 16, 17, 23, 33].includes(c);
        const isRightEdge = [14, 15, 16, 22, 32, totalCols].includes(c);
        
        cell.border = getCellBorders(topBorder, bottomBorder, isLeftEdge ? 'thick' : true, isRightEdge ? 'thick' : true);
      } else if (c === 1) {
        let c1Top = undefined;
        if (rowIndex === 6) c1Top = 'medium';
        else if (isNewDept) c1Top = 'medium';
        else if (isNewGroup) c1Top = 'thin';
        else c1Top = 'thin';

        let c1Bottom = undefined;
        if (isLastRow) c1Bottom = 'medium';
        else if (isNextDept || isNextGroup) c1Bottom = 'thin';

        cell.border = {
          top: { style: c1Top || topStyle, color: { argb: 'FF000000' } },
          bottom: { style: c1Bottom || 'hair', color: { argb: 'FF000000' } },
          left: { style: leftStyle, color: { argb: 'FF000000' } },
          right: { style: rightStyle, color: { argb: 'FF000000' } }
        };
      } else {
        let bottomS = 'hair';
        if (isLastRow) bottomS = 'medium';
        else if (isNextDept) bottomS = 'medium';
        else if (isNextGroup) bottomS = 'mediumDashed';

        cell.border = {
          top: { style: topStyle, color: { argb: 'FF000000' } },
          bottom: { style: bottomS, color: { argb: 'FF000000' } },
          left: { style: leftStyle, color: { argb: 'FF000000' } },
          right: { style: rightStyle, color: { argb: 'FF000000' } }
        };
      }"""

code = code.replace(search2, replace2)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Applied fix for borders in simple plan reference section")