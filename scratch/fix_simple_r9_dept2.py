import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search_simple = """        if (y === targetYear) {
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
        }"""

replace_simple = """        if (y === targetYear) {
           let nDeptName = '';
           if (extEmp.departmentId === 'retired') {
              nDeptName = '退職';
           } else if (!extEmp.departmentId || extEmp.departmentId === 'unassigned') {
              nDeptName = '未配置';
           } else {
              const nDept = departments.find(d => d.id === extEmp.departmentId);
              const nGroup = nDept && extEmp.groupId ? (nDept.groups || []).find(g => g.id === extEmp.groupId) : null;
              const d = nDept ? (nDept.nextName || nDept.name) : '';
              const g = nGroup ? (nGroup.nextName || nGroup.name) : '';
              let pStr = '';
              if (extEmp.postId && nDept) {
                  const p = (nDept.posts || []).find(x => x.id === extEmp.postId);
                  if (p) pStr = '（' + (p.nextName || p.name) + '）';
              } else if (extEmp.groupPostId && nGroup) {
                  const gp = (nGroup.posts || []).find(x => x.id === extEmp.groupPostId);
                  if (gp) pStr = '（' + (gp.nextName || gp.name) + '）';
              }
              if (d === 'システム用外枠') nDeptName = '未配置';
              else if (d && !g) nDeptName = `${d}${pStr}`;
              else nDeptName = `${d} ${g}${pStr}`;
           }
           historyStr = nDeptName;
        }"""

if search_simple in code:
    code = code.replace(search_simple, replace_simple)
    print("Fixed addSimplePlanSheet targetYear department formatting")
else:
    print("Could not find search string for addSimplePlanSheet targetYear department formatting")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)