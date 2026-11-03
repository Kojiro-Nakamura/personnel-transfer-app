import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# We need to find the end of departments.forEach(...) in addCurrentBasePlanSheet
# and inject the unassigned block.

search = """    dept.groups.forEach(grp => {
      const gObj = currD.groups[grp.id] || { posts: {}, direct: { current: [] } };
      
      grp.posts.forEach(p => {
        const emps = getEmpIdsForPost(gObj, p.id);
        processEmps(emps, grp.name, p.name, true, grp.id);
      });
      
      const gDirect = getDirectEmpIds(gObj);
      processEmps(gDirect, grp.name, null, false, grp.id);
    });
  });
};"""

replace = """    dept.groups.forEach(grp => {
      const gObj = currD.groups[grp.id] || { posts: {}, direct: { current: [] } };
      
      grp.posts.forEach(p => {
        const emps = getEmpIdsForPost(gObj, p.id);
        processEmps(emps, grp.name, p.name, true, grp.id);
      });
      
      const gDirect = getDirectEmpIds(gObj);
      processEmps(gDirect, grp.name, null, false, grp.id);
    });
  });

  const uObj = deptMap.current['unassigned'];
  if (uObj && uObj.direct && uObj.direct.current && uObj.direct.current.length > 0) {
    const row = ws.getRow(currentRowIndex);
    row.height = 24;
    const vals = new Array(17).fill('');
    vals[0] = '未配置';
    row.values = vals;
    for (let c = 1; c <= 17; c++) {
      const cell = row.getCell(c);
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.font = { name: 'BIZ UDPゴシック', size: 9 };
    }
    currentRowIndex++;
    
    // We can't reuse processEmps because it captures `dept`, but we can just inline or recreate a similar loop.
    uObj.direct.current.forEach(eId => {
      const emp = employees.find(e => e.id === eId);
      if (!emp) return;
      if (filterLevel > 0) {
        const cLvl = getGradeLevel(emp.currentGrade);
        const nLvl = getGradeLevel(emp.nextGrade);
        if (cLvl < filterLevel && nLvl < filterLevel) return;
      }
      const r = ws.getRow(currentRowIndex);
      r.height = 24;
      const v = new Array(17).fill('');
      v[3] = emp.currentTitle || '';
      v[4] = emp.name || '';
      v[5] = emp.currentGrade || '';
      v[6] = calculateAge(emp.birthDate, targetYear - 1) !== '' ? calculateAge(emp.birthDate, targetYear - 1) + '歳' : '';
      const cy = emp.currentYears || 0;
      const cs = (emp.currentSkills || []).join('＋');
      v[7] = cs ? `${cy}年(${cs})` : `${cy}年`;
      v[8] = emp.currentEmploymentType || '';
      v[9] = '→';

      const getDeptNameStr = (dId) => {
         if (dId === 'unassigned') return '未配置';
         if (dId === 'retired') return '退職';
         const d = departments.find(x => x.id === dId);
         return d ? (d.nextName || d.name) : '';
      };
      const getGroupNameStr = (dId, gId) => {
         const d = departments.find(x => x.id === dId);
         if (!d) return '';
         const g = d.groups.find(x => x.id === gId);
         return g ? (g.nextName || g.name) : '';
      };

      const isUnassigned = emp.departmentId === 'unassigned';
      const isRetired = emp.departmentId === 'retired';

      if (isRetired) {
        v[10] = '退職';
        v[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
      } else if (isUnassigned) {
        v[10] = '未配置';
        v[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
        v[16] = emp.nextEmploymentType || '';
      } else {
        v[10] = getDeptNameStr(emp.departmentId);
        v[11] = getGroupNameStr(emp.departmentId, emp.groupId);
        v[12] = emp.nextTitle || '';
        v[13] = emp.nextGrade || '';
        v[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
        const ny = emp.nextYears || 0;
        const ns = (emp.nextSkills || []).join('＋');
        v[15] = ns ? `${ny}年(${ns})` : `${ny}年`;
        v[16] = emp.nextEmploymentType || '';
      }
      r.values = v;
      for (let c = 1; c <= 17; c++) {
        const cell = r.getCell(c);
        cell.border = borderStyle;
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.font = { name: 'BIZ UDPゴシック', size: 9 };
        if (c === 5) cell.font = { name: 'BIZ UDPゴシック', size: 10, bold: true };
        if (c === 7 || c === 8 || c === 10 || c === 15 || c === 16) cell.alignment = { vertical: 'middle', horizontal: 'center' };
        
        if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {
           if (emp.departmentId !== 'unassigned') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDBA74' } }; // orange-300
           }
        }
      }
      currentRowIndex++;
    });
  }
};"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced unassigned block successfully")
else:
    print("Failed to replace unassigned block")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)