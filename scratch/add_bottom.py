import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

start = code.find("export const addCurrentBasePlanSheet")
if start != -1:
    func_code = code[start:]
    pre_code = code[:start]

    old_end = """    });
  }
};"""

    new_end = """    });
  }
  
  const lastRow = ws.getRow(currentRowIndex - 1);
  if (lastRow) {
    const c1 = lastRow.getCell(1);
    const c2 = lastRow.getCell(2);
    if (c1.border) c1.border = { ...c1.border, bottom: { style: 'thin' } };
    if (c2.border) c2.border = { ...c2.border, bottom: { style: 'thin' } };
  }
};"""
    
    func_code = func_code.replace(old_end, new_end)
    code = pre_code + func_code

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)