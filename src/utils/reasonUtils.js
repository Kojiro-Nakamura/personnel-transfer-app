// Helper to categorize employee
const isIncludedInCounts = (emp) => {
  const note = emp.note || '';
  if (note.includes('時短') || note.includes('再短')) return false; // 再任用(短) excluded
  if (note.includes('臨任')) return false; // 臨時的任用 excluded
  if (note.includes('育休代替')) return false; // 育休代替 excluded
  return true; // Include regular, 再フル, etc.
};

const aggregateReasons = (reasonsArray) => {
  const counts = {};
  reasonsArray.forEach(r => {
    counts[r] = (counts[r] || 0) + 1;
  });
  return Object.entries(counts).map(([r, count]) => r + ' ' + count + '名').join('、');
};

export const generateReasonStats = (departments, employees, notes) => {
  notes = notes || [];
  const deptStats = {};
  
  // Initialize departments
  departments.forEach(d => {
    deptStats[d.id] = { id: d.id, name: d.name, currCount: 0, nextCount: 0, incReasons: [], decReasons: [] };
  });
  
  employees.forEach(emp => {
    const cDept = emp.currentDeptId;
    const nDept = emp.departmentId;
    
    // Determine counts
    if (cDept && cDept !== 'unassigned' && cDept !== 'retired' && deptStats[cDept]) {
      if (isIncludedInCounts(emp)) deptStats[cDept].currCount++;
    }
    if (nDept && nDept !== 'unassigned' && nDept !== 'retired' && deptStats[nDept]) {
      if (isIncludedInCounts(emp)) deptStats[nDept].nextCount++;
    }

    // Determine movements
    if (cDept !== nDept) {
      const isRetiring = !nDept || nDept === 'retired';
      const isNewHire = !cDept || cDept === 'unassigned';
      
      // Leaving old department
      if (cDept && cDept !== 'unassigned' && cDept !== 'retired' && deptStats[cDept]) {
        let reason = '';
        if (isRetiring) {
          reason = '退職';
        } else if (nDept && deptStats[nDept]) {
          reason = deptStats[nDept].name + 'への異動';
        } else {
          reason = '他への異動';
        }
        deptStats[cDept].decReasons.push(reason);
      }
      
      // Entering new department
      if (nDept && nDept !== 'unassigned' && nDept !== 'retired' && deptStats[nDept]) {
        let reason = '';
        if (isNewHire) {
          reason = '新規採用';
        } else if (cDept && deptStats[cDept]) {
          reason = deptStats[cDept].name + 'からの異動';
        } else {
          reason = '他からの異動';
        }
        deptStats[nDept].incReasons.push(reason);
      }
    }
  });

  const results = [];
  departments.forEach(d => {
    const stats = deptStats[d.id];
    if (stats.currCount > 0 || stats.nextCount > 0) {
      const diff = stats.nextCount - stats.currCount;
      const incStr = aggregateReasons(stats.incReasons);
      const decStr = aggregateReasons(stats.decReasons);
      
      let reasonText = [];
      if (incStr) reasonText.push('【増要素】' + incStr);
      if (decStr) reasonText.push('【減要素】' + decStr);
      
      const dNote = notes.find(n => n.targetId === 'dept-' + d.id);
      if (dNote && dNote.text) {
         reasonText.push('(参考) ' + dNote.text);
      }

      results.push({
        id: d.id,
        deptName: d.name,
        currCount: stats.currCount,
        nextCount: stats.nextCount,
        diff: diff,
        reasonText: ''
      });
    }
  });
  
  return results;
};
