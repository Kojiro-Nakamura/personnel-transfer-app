const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

const targetMemo = `  const historyYears = useMemo(() => {
    let min = new Date().getFullYear();
    let max = min + 1;
    let hasHistory = false;
    
    const allEmps = [...(employees || [])];
    if (importData) {
      if (importData.additions) allEmps.push(...importData.additions);
      if (importData.updates) allEmps.push(...importData.updates);
    }
    
    allEmps.forEach(emp => {
      if (emp.history && emp.history.length > 0) {
        hasHistory = true;
        emp.history.forEach(h => {
          if (h.year < min) min = h.year;
          if (h.year > max) max = h.year;
        });
      }
    });
    
    if (!hasHistory) {
      min = new Date().getFullYear() - 5;
    }
    
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [employees, importData]);`;

const repMemo = `  const historyYears = useMemo(() => {
    let min = new Date().getFullYear();
    let max = min + 1;
    let hasHistory = false;
    
    const allEmps = [...(localEmps || [])];
    if (importData) {
      if (importData.additions) allEmps.push(...importData.additions);
      if (importData.updates) allEmps.push(...importData.updates);
    }
    
    allEmps.forEach(emp => {
      if (emp.history && emp.history.length > 0) {
        hasHistory = true;
        emp.history.forEach(h => {
          if (h.year < min) min = h.year;
          if (h.year > max) max = h.year;
        });
      }
    });
    
    if (!hasHistory) {
      min = new Date().getFullYear() - 5;
    }
    
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [localEmps, importData]);`;

content = content.replace(targetMemo, repMemo);
fs.writeFileSync('src/components/modals/Modals.jsx', content, 'utf8');
console.log("Updated historyYears to use localEmps.");
