import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''  const sortedEmps = useMemo(() => {
    let items = [...localEmps];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] || ''; 
        let bv = b[sortConfig.key] || '';
        
        if (sortConfig.key === 'currentGrade' || sortConfig.key === 'nextGrade') {
          av = getGradeLevel(av);
          bv = getGradeLevel(bv);
        } else if (sortConfig.key.includes('Years') || ['promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'].includes(sortConfig.key)) { 
          av = Number(av) || 0; 
          bv = Number(bv) || 0; 
        }

        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;'''

repl = '''  const sortedEmps = useMemo(() => {
    const getHistStr = (emp, year) => {
      if (year === targetYear) {
        const nDept = departments.find(d => d.id === emp.departmentId);
        if (!nDept || nDept.id === 'unassigned' || nDept.id === 'retired') return '';
        let s = nDept.name;
        if (emp.postId) {
          const p = (nDept.posts || []).find(p => p.id === emp.postId);
          if (p) s += '（' + p.name + '）';
        } else if (emp.groupId) {
          const g = (nDept.groups || []).find(g => g.id === emp.groupId);
          if (g) {
            s += ' ' + g.name;
            if (emp.groupPostId) {
              const gp = (g.posts || []).find(p => p.id === emp.groupPostId);
              if (gp) s += '（' + gp.name + '）';
            }
          }
        }
        return s;
      } else {
        const h = (emp.history || []).find(h => h.year === year);
        return h ? h.department : '';
      }
    };

    let items = [...localEmps];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] || ''; 
        let bv = b[sortConfig.key] || '';
        
        if (sortConfig.key.startsWith('hist_')) {
          const year = parseInt(sortConfig.key.replace('hist_', ''));
          av = getHistStr(a, year);
          bv = getHistStr(b, year);
        } else if (sortConfig.key === 'currentGrade' || sortConfig.key === 'nextGrade') {
          av = getGradeLevel(av);
          bv = getGradeLevel(bv);
        } else if (sortConfig.key.includes('Years') || ['promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'].includes(sortConfig.key)) { 
          av = Number(av) || 0; 
          bv = Number(bv) || 0; 
        }

        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;'''

if target in text:
    text = text.replace(target, repl)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Patch applied to Modals.jsx for history sorting!")
else:
    print("Target not found.")
