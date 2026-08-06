import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update BulkEditModal props
target_props = "export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {"
repl_props = "export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments, targetYear }) => {"

# 2. Update historyYears useMemo
target_memo = '''    allEmps.forEach(emp => {
      if (emp.history && emp.history.length > 0) {
        hasHistory = true;
        emp.history.forEach(h => {
          if (h.year < min) min = h.year;
          if (h.year > max) max = h.year;
        });
      }
    });

    if (!hasHistory) return [];'''

repl_memo = '''    allEmps.forEach(emp => {
      if (emp.history && emp.history.length > 0) {
        hasHistory = true;
        emp.history.forEach(h => {
          if (h.year < min) min = h.year;
          if (h.year > max) max = h.year;
        });
      }
    });
    
    if (targetYear) {
      hasHistory = true;
      if (targetYear < min) min = targetYear;
      if (targetYear > max) max = targetYear;
    }

    if (!hasHistory) return [];'''

# 3. Update handleExportCSV mapped history
target_export = '''        ...historyYears.map(year => {
          const hist = (emp.history || []).find(h => h.year === year);
          return hist ? hist.department : '';
        })'''

repl_export = '''        ...historyYears.map(year => {
          if (year === targetYear) {
              let histStr = '';
              const nDept = dMap.get(emp.departmentId);
              if (nDept && nDept.id !== 'unassigned' && nDept.id !== 'retired') {
                  histStr = nDept.name;
                  if (emp.postId) {
                    const p = (nDept.posts || []).find(p => p.id === emp.postId);
                    if (p) histStr += '（' + p.name + '）';
                  } else if (emp.groupId) {
                    const g = (nDept.groups || []).find(g => g.id === emp.groupId);
                    if (g) {
                      histStr += ' ' + g.name;
                      if (emp.groupPostId) {
                        const gp = (g.posts || []).find(p => p.id === emp.groupPostId);
                        if (gp) histStr += '（' + gp.name + '）';
                      }
                    }
                  }
              }
              return histStr;
          }
          const hist = (emp.history || []).find(h => h.year === year);
          return hist ? hist.department : '';
        })'''

# 4. Update JSX rendering inside BulkEditModal
target_jsx = '''                    {historyYears.length > 0 && historyYears.map(year => {
                      const hist = (emp.history || []).find(h => h.year === year);
                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px]">
                          <input type="text" value={hist ? hist.department : ''} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center"} title={hist ? hist.department : ''} />
                        </td>
                      );
                    })}'''

repl_jsx = '''                    {historyYears.length > 0 && historyYears.map(year => {
                      let histStr = '';
                      if (year === targetYear) {
                          const nDept = localDepts.find(d => d.id === emp.departmentId);
                          if (nDept && nDept.id !== 'unassigned' && nDept.id !== 'retired') {
                              histStr = nDept.name;
                              if (emp.postId) {
                                const p = (nDept.posts || []).find(p => p.id === emp.postId);
                                if (p) histStr += '（' + p.name + '）';
                              } else if (emp.groupId) {
                                const g = (nDept.groups || []).find(g => g.id === emp.groupId);
                                if (g) {
                                  histStr += ' ' + g.name;
                                  if (emp.groupPostId) {
                                    const gp = (g.posts || []).find(p => p.id === emp.groupPostId);
                                    if (gp) histStr += '（' + gp.name + '）';
                                  }
                                }
                              }
                          }
                      } else {
                          const hist = (emp.history || []).find(h => h.year === year);
                          histStr = hist ? hist.department : '';
                      }
                      
                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px]">
                          <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center"} title={histStr} />
                        </td>
                      );
                    })}'''


if target_props in content and target_memo in content and target_export in content and target_jsx in content:
    content = content.replace(target_props, repl_props)
    content = content.replace(target_memo, repl_memo)
    content = content.replace(target_export, repl_export)
    content = content.replace(target_jsx, repl_jsx)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAILED")
    print("props", target_props in content)
    print("memo", target_memo in content)
    print("export", target_export in content)
    print("jsx", target_jsx in content)
