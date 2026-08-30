const fs = require('fs');
let code = fs.readFileSync('src/contexts/AppContext.jsx', 'utf8');

const regex = /const loadJSON = useCallback\(async \(e\) => \{[\s\S]*?\}, \[history\]\);/;

const replacement = `const loadFromData = useCallback((data, fileName) => {
    try {
      if (data.plans) { 
        data.plans.forEach(p => { 
          if (!p.notes) p.notes = []; 
          if (p.employees) {
            p.employees = p.employees.map(emp => ({
              ...emp,
              currentExclude: emp.currentExclude !== undefined ? emp.currentExclude : (emp.currentExcluded || ''),
              nextExclude: emp.nextExclude !== undefined ? emp.nextExclude : (emp.nextExcluded || '')
            }));
          }
        });
        history.setTargetYear(data.targetYear || 2027); 
        history.setPlans(data.plans); 
        history.setActivePlanId(data.activePlanId || data.plans[0].id); 
        
        const planToLoad = data.plans.find(x => x.id === (data.activePlanId || data.plans[0].id)) || data.plans[0]; 
        history.setEmployees(planToLoad.employees); 
        history.setDepartments(planToLoad.departments); 
        history.setNotes(planToLoad.notes || []); 
        if (fileName) {
          history.setCurrentFileName(fileName);
        }
      } 
    } catch(err) { 
      console.error('Error loading data:', err);
    }
  }, [history]);

  const loadJSON = useCallback(async (e) => {
    let file = null;
    let targetInput = null;

    if (e instanceof File || (e && e.name)) {
      file = e;
    } else if (e && e.target) {
      targetInput = e.target; 
      file = targetInput.files ? targetInput.files[0] : null;
    }
    
    if(!file) return;
    
    try {
      const text = await file.text(); 
      const data = JSON.parse(text); 
      loadFromData(data, file.name);
    } catch(err) { 
      console.error('Error loading JSON:', err);
    } finally { 
      if (targetInput) targetInput.value = ''; 
    }
  }, [loadFromData]);`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  // Also expose loadFromData
  code = code.replace("exportToJSON: exports.exportToJSON,", "exportToJSON: exports.exportToJSON,\n    loadFromData,");
  fs.writeFileSync('src/contexts/AppContext.jsx', code, 'utf8');
  console.log("Patched loadJSON with regex");
} else {
  console.log("Regex not matched");
}