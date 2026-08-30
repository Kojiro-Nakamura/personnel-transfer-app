import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 24) || c >= 35);
      const shouldShrink = (c !== 2 && c !== 3);
      cell.alignment = { vertical: 'middle', horizontal: isLeft ? 'left' : 'center', shrinkToFit: shouldShrink, wrapText: false };
      cell.font = { name: 'BIZ UDPゴシック', size: 9 };
      
      let topStyle = 'hair';
      if (rowIndex === 6) topStyle = 'medium';
      else if (isNewDept) topStyle = 'medium';
      else if (isNewGroup) topStyle = 'mediumDashed';
      
      const leftStyle = (c === 1 || c === 2 || c === 8) ? 'medium' : 'thin';
      const rightStyle = (c === 12 || c === 1 || c === 7) ? 'medium' : 'thin';
      
      if (c === 1) {"""

replace = """      const isLeft = (c === 1 || c === 12 || c === 2 || c === 3 || (c >= 14 && c <= 24) || c >= 35);
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
      } else if (c === 1) {"""

code = code.replace(search, replace)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Applied fix for borders in simple plan data rows")