import sys
import re

with open('src/contexts/AppContext.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''    const nEmps = retained.map(e => ({ 
      ...e, 
      currentDeptId: e.departmentId, 
      currentPostId: e.postId, 
      currentGroupId: e.groupId, 
      currentGroupPostId: e.groupPostId, 
      currentGrade: e.nextGrade, 
      currentTitle: e.nextTitle, 
      currentYears: e.nextYears, 
      currentSkills: [...(e.nextSkills || [])], 
      currentEmploymentType: e.nextEmploymentType, 
      currentExclude: e.nextExclude || '',
      departmentId: 'unassigned', 
      postId: null, 
      groupId: null, 
      groupPostId: null, 
      nextYears: 1, 
      nextSkills: [], 
      nextEmploymentType: '', 
      nextExclude: '',
      orderCurrent: e.orderNext || Date.now(), 
      orderNext: Date.now() 
    }));'''

repl = '''    const nEmps = retained.map(e => {
      let histStr = '';
      const nDept = nDepts.find(d => d.id === e.departmentId);
      if (nDept && nDept.id !== 'unassigned' && nDept.id !== 'retired') {
        histStr = nDept.name;
        if (e.postId) {
          const p = (nDept.posts || []).find(p => p.id === e.postId);
          if (p) histStr += '（' + p.name + '）';
        } else if (e.groupId) {
          const g = (nDept.groups || []).find(g => g.id === e.groupId);
          if (g) {
            histStr += ' ' + g.name;
            if (e.groupPostId) {
              const gp = (g.posts || []).find(p => p.id === e.groupPostId);
              if (gp) histStr += '（' + gp.name + '）';
            }
          }
        }
      }
      const newHistory = [...(e.history || [])];
      if (histStr) {
        // Prevent duplicate entries for the same year just in case
        const existingIdx = newHistory.findIndex(h => h.year === history.targetYear);
        if (existingIdx >= 0) {
          newHistory[existingIdx] = { year: history.targetYear, department: histStr };
        } else {
          newHistory.push({ year: history.targetYear, department: histStr });
        }
      }
      return { 
        ...e, 
        currentDeptId: e.departmentId, 
        currentPostId: e.postId, 
        currentGroupId: e.groupId, 
        currentGroupPostId: e.groupPostId, 
        currentGrade: e.nextGrade, 
        currentTitle: e.nextTitle, 
        currentYears: e.nextYears, 
        currentSkills: [...(e.nextSkills || [])], 
        currentEmploymentType: e.nextEmploymentType, 
        currentExclude: e.nextExclude || '',
        departmentId: 'unassigned', 
        postId: null, 
        groupId: null, 
        groupPostId: null, 
        nextYears: 1, 
        nextSkills: [], 
        nextEmploymentType: '', 
        nextExclude: '',
        orderCurrent: e.orderNext || Date.now(), 
        orderNext: Date.now(),
        history: newHistory
      };
    });'''

if target in content:
    content = content.replace(target, repl)
    with open('src/contexts/AppContext.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS AppContext patch")
else:
    print("FAILED AppContext patch")
