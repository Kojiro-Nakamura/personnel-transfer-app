const fs = require('fs');
let code = fs.readFileSync('src/contexts/AppContext.jsx', 'utf8');

const target = `  const loadJSON = useCallback(async (e) => {
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
        history.setCurrentFileName(file.name);
      } 
    } catch(err) { 
      console.error('ファイルの読み込みに失敗しました。', err);
    } finally { 
      if (targetInput) targetInput.value = ''; 
    }
  }, [history]);`;

// But we have garbled characters in the original file:
// '繝輔ぃ繧､繝ｫ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・

const exactOriginalCode = `  const loadJSON = useCallback(async (e) => {
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
        history.setCurrentFileName(file.name);
      } 
    } catch(err) { 
      console.error('繝輔ぃ繧､繝ｫ縺ｮ隱ｭ縺ｿ霎ｼ縺ｿ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・, err);
    } finally { 
      if (targetInput) targetInput.value = ''; 
    }
  }, [history]);`;

const replacement = `  const loadFromData = useCallback((data, fileName) => {
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

if (code.includes(exactOriginalCode)) {
  code = code.replace(exactOriginalCode, replacement);
  fs.writeFileSync('src/contexts/AppContext.jsx', code, 'utf8');
  console.log("Patched loadJSON in AppContext.jsx");
} else {
  console.log("Target string not found in AppContext.jsx");
}