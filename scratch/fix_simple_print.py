import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = "    if (maxLength > 0) {\n      if (colIndex === 12 && maxLength > 40) maxLength = 40;\n      col.width = maxLength + 1.5;\n    }\n  });\n};"

replace = """    if (maxLength > 0) {
      if (colIndex === 12 && maxLength > 40) maxLength = 40;
      col.width = maxLength + 1.5;
    }
  });

  const lastRowToPrint = rowIndex > 6 ? rowIndex - 1 : 6;
  ws.pageSetup.printArea = `A1:L${lastRowToPrint}`;
  ws.pageSetup.paperSize = 9; // A4
  ws.pageSetup.orientation = 'portrait';
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 0;
};"""

if search in code:
    code = code.replace(search, replace)
    print("Added page setup to addSimplePlanSheet")
else:
    print("Could not find search string in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)