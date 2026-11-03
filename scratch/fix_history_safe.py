import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Add historyYears, getAgeStr and formatWithEra inside addCurrentBasePlanSheet
func_def = "export const addCurrentBasePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {"

helpers_to_inject = """export const addCurrentBasePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const allHistoryYears = new Set();
  employees.forEach(emp => {
    (emp.history || []).forEach(h => {
      if (h.year >= targetYear - 10 && h.year <= targetYear) {
         allHistoryYears.add(h.year);
      }
    });
  });
  const historyYears = Array.from(allHistoryYears).sort((a, b) => a - b);
  const getAgeStr = (emp, isNext) => {
    if (!emp || !emp.birthDate) return '';
    const age = calculateAge(emp.birthDate, isNext ? targetYear : targetYear - 1);
    return age !== '' ? `${age}歳` : '';
  };
  const formatWithEra = (dateStr, birthDateStr = null) => {
    let res = formatPromoDateWithEra(String(dateStr));
    if (birthDateStr && dateStr) {
      const match = String(dateStr).match(/^(\d{4})[-/]/);
      if (match) {
         const year = parseInt(match[1], 10);
         const ag = calculateAge(birthDateStr, year);
         if (ag) res += `(${ag}歳)`;
      }
    }
    return res;
  };
"""

code = code.replace(func_def, helpers_to_inject)

# 2. Replace history logic inside processEmps
history_logic_to_replace = """        vals[38] = extEmp.hireYear || '';
        historyYears.forEach((hy, idx) => {
           vals[39 + idx] = getHistorySummaryForPlan(extEmp.history, hy);
        });
        row.values = vals;"""

history_logic_new = """        vals[38] = extEmp.hireYear || '';
        
        let nDeptName = '';
        if (extEmp.departmentId === 'retired') {
           nDeptName = '退職';
        } else if (!extEmp.departmentId || extEmp.departmentId === 'unassigned') {
           nDeptName = '未配置';
        } else {
           const nDept = departments.find(d => d.id === extEmp.departmentId);
           const nGroup = nDept && extEmp.groupId ? (nDept.groups || []).find(g => g.id === extEmp.groupId) : null;
           let d = nDept ? (nDept.nextName || nDept.name) : '';
           let g = nGroup ? (nGroup.nextName || nGroup.name) : '';
           let pStr = '';
           if (extEmp.postId && nDept) {
               const p = (nDept.posts || []).find(x => x.id === extEmp.postId);
               if (p) pStr = '（' + (p.nextName || p.name) + '）';
           } else if (extEmp.groupPostId && nGroup) {
               const gp = (nGroup.posts || []).find(x => x.id === extEmp.groupPostId);
               if (gp) pStr = '（' + (gp.nextName || gp.name) + '）';
           }
           if (d === 'システム用部署') nDeptName = '未配置';
           else if (d && !g) nDeptName = `${d}${pStr}`;
           else nDeptName = `${d} ${g}${pStr}`;
        }
        
        let lastValidHStr = '-';
        let changeIndexes = [];
        historyYears.forEach((hy, idx) => {
           let hStr = '';
           if (hy === targetYear) {
              hStr = nDeptName;
           } else {
              const hist = (extEmp.history || []).find(h => h.year === hy);
              hStr = hist ? hist.department : '';
           }
           
           let isChange = false;
           if (hStr !== '' && hStr !== '-') {
              if (hStr !== lastValidHStr) {
                 isChange = true;
              }
              lastValidHStr = hStr;
           }
           if (isChange) {
              changeIndexes.push(39 + idx);
           }
           
           let displayStr = hStr;
           if (hStr && hStr !== ' / 無所属' && hStr !== '未配置' && hStr !== '-') {
             const histAge = (extEmp.birthDate && !isNaN(hy)) ? calculateAge(extEmp.birthDate, hy) : null;
             if (histAge !== null && !isNaN(histAge)) {
               displayStr = `${hStr} (${histAge}歳)`;
             }
           }
           vals[39 + idx] = displayStr;
        });
        
        row.changeIndexes = changeIndexes;
        row.values = vals;"""
        
code = code.replace(history_logic_to_replace, history_logic_new)

# 3. Replace history logic inside unassigned
history_logic_unassigned_to_replace = """      v[38] = extEmp.hireYear || '';
      historyYears.forEach((hy, idx) => {
         v[39 + idx] = getHistorySummaryForPlan(extEmp.history, hy);
      });
      r.values = v;"""

history_logic_unassigned_new = history_logic_new.replace("vals[", "v[").replace("vals =", "v =").replace("row.", "r.")
code = code.replace(history_logic_unassigned_to_replace, history_logic_unassigned_new)

# 4. Replace styling logic
styling_logic_to_replace = """          if (c >= 40) {
             const histIdx = c - 40;
             const hy = historyYears[histIdx];
             const [hBg, hChange] = getHistoryColors(extEmp.history, hy);
             if (hBg) {
                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hBg.replace('#', '').toUpperCase() } };
             }
             if (hChange) cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true, italic: true };
          }"""

styling_logic_new = """          if (c >= 40) {
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } }; // Emerald (History)
             const targetRow = typeof row !== 'undefined' ? row : (typeof r !== 'undefined' ? r : null);
             if (targetRow && targetRow.changeIndexes && targetRow.changeIndexes.includes(c - 1)) {
                 cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true, italic: true };
             }
          }"""
code = code.replace(styling_logic_to_replace, styling_logic_new)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)