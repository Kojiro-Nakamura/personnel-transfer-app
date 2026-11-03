import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Fix addPlanSheet mergeCells
search_plan_merge = """  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(38 + historyYears.length).letter;
    const startColCode = ws.getColumn(39).letter;
    if (startColCode !== endColCode) ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }"""
replace_plan_merge = """  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(38 + historyYears.length).letter;
    const startColCode = ws.getColumn(39).letter;
    ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }"""
if search_plan_merge in code:
    code = code.replace(search_plan_merge, replace_plan_merge)
    print("Fixed addPlanSheet merge")

# 2. Fix addSimplePlanSheet mergeCells
search_simple_merge = """  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(34 + historyYears.length).letter;
    const startColCode = ws.getColumn(35).letter;
    if (startColCode !== endColCode) ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }"""
replace_simple_merge = """  if (historyYears.length > 0) {
    const endColCode = ws.getColumn(34 + historyYears.length).letter;
    const startColCode = ws.getColumn(35).letter;
    ws.mergeCells(`${startColCode}4:${endColCode}4`);
  }"""
if search_simple_merge in code:
    code = code.replace(search_simple_merge, replace_simple_merge)
    print("Fixed addSimplePlanSheet merge")

# 3. Fix addSimplePlanSheet R9 department
search_simple_dept = """      historyYears.forEach((y, i) => {
        let historyStr = '';
        if (extEmp.history) {
          const h = extEmp.history.find(x => x.year === y);
          if (h) historyStr = h.department ? h.department + (h.title ? ' / ' + h.title : '') : (h.title || '');
        }
        rowVals[34 + i] = historyStr;"""
replace_simple_dept = """      historyYears.forEach((y, i) => {
        let historyStr = '';
        if (y === targetYear) {
           let dName = '';
           if (extEmp.departmentId && extEmp.departmentId !== 'unassigned' && extEmp.departmentId !== 'retired') {
              if (deptMap && deptMap[extEmp.departmentId]) dName = deptMap[extEmp.departmentId].name;
              else if (departments) {
                 const d = departments.find(d => d.id === extEmp.departmentId);
                 if (d) dName = d.name;
              }
           }
           const tName = extEmp.nextTitle || '';
           historyStr = dName ? dName + (tName ? ' / ' + tName : '') : (tName || '-');
        } else {
           if (extEmp.history) {
             const h = extEmp.history.find(x => x.year === y);
             if (h) historyStr = h.department ? h.department + (h.title ? ' / ' + h.title : '') : (h.title || '');
           }
        }
        rowVals[34 + i] = historyStr;"""
if search_simple_dept in code:
    code = code.replace(search_simple_dept, replace_simple_dept)
    print("Fixed addSimplePlanSheet R9 department")
else:
    print("Could not find addSimplePlanSheet R9 department search block")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)