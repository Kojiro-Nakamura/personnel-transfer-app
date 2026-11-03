import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = """        const dispGrade = selEmp.currentGrade;
        const dispAge = calculateAge(selEmp.birthDate, targetYear - 1);"""

replace = """        const dispGrade = selEmp.currentGrade;
        const dispAge = calculateAge(selEmp.birthDate, targetYear - 1);

        const getAssignStr = (dId, gId, isNext) => {
          if (dId === 'retired') return '退職';
          if (!dId || dId === 'unassigned') return '未定';
          const nDept = departments.find(d => d.id === dId);
          const nGroup = nDept && gId ? (nDept.groups || []).find(g => g.id === gId) : null;
          const d = nDept ? (isNext ? (nDept.nextName || nDept.name) : nDept.name) : '';
          const g = nGroup ? (isNext ? (nGroup.nextName || nGroup.name) : nGroup.name) : '';
          
          if (d === 'システム用ダミー') return '未定';
          let finalName = '';
          if (d) finalName += d;
          if (g) finalName += (finalName ? ' ' : '') + g;
          return finalName || '未定';
        };

        const currHist = selEmp.history?.find(h => h.year === (targetYear - 1));
        const cDeptId = currHist ? currHist.departmentId : (selEmp.departmentId === 'unassigned' ? 'unassigned' : selEmp.currentDeptId);
        const cGroupId = currHist ? currHist.groupId : (selEmp.departmentId === 'unassigned' ? null : selEmp.currentGroupId);

        let currDeptStr = getAssignStr(cDeptId, cGroupId, false);
        let nextDeptStr = getAssignStr(selEmp.departmentId, selEmp.groupId, true);
        
        // If history is just plain text string format (older data model)
        if (currHist && (!cDeptId && currHist.department)) {
          currDeptStr = currHist.department;
        }"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced variables successfully")
else:
    print("Could not find variables string")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)