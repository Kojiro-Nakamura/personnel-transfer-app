const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

const target = `  const historyYears = useMemo(() => {
    let min = new Date().getFullYear();
    let max = min + 1;
    let hasHistory = false;
    
    (employees || []).forEach(emp => {
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
  }, [employees]);`;

const replacement = `  const historyYears = useMemo(() => {
    let min = new Date().getFullYear();
    let max = min + 1;
    let hasHistory = false;
    
    const allEmps = [...(employees || [])];
    if (importData) {
      if (importData.adds) allEmps.push(...importData.adds);
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

if (content.includes(target)) {
  fs.writeFileSync('src/components/modals/Modals.jsx', content.replace(target, replacement), 'utf8');
  console.log('Patched correctly');
} else {
  console.log('Target not found!');
}
