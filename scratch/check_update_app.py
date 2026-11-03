import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = """        const currHist = selEmp.history?.find(h => h.year === (targetYear - 1));
        const cDeptId = currHist ? currHist.departmentId : (selEmp.departmentId === 'unassigned' ? 'unassigned' : selEmp.currentDeptId);
        const cGroupId = currHist ? currHist.groupId : (selEmp.departmentId === 'unassigned' ? null : selEmp.currentGroupId);

        let currDeptStr = getAssignStr(cDeptId, cGroupId, false);
        let nextDeptStr = getAssignStr(selEmp.departmentId, selEmp.groupId, true);
        
        // If history is just plain text string format (older data model)
        if (currHist && (!cDeptId && currHist.department)) {
          currDeptStr = currHist.department;
        }"""

replace = """        let currDeptStr = getAssignStr(selEmp.currentDeptId, selEmp.currentGroupId, false);
        let nextDeptStr = getAssignStr(selEmp.departmentId, selEmp.groupId, true);
        
        // Fallback for older formats or missing data
        if (!selEmp.currentDeptId && selEmp.history) {
           const currHist = selEmp.history.find(h => h.year === (targetYear - 1));
           if (currHist && currHist.department) {
             currDeptStr = currHist.department;
           }
        }"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced variables successfully")
else:
    print("Could not find variables string")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)