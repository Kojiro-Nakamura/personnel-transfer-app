import { useState, useMemo, useEffect, useCallback } from 'react';
import { STORAGE_KEY } from '../constants/config.js';
export function useAppHistory(initialState) {
  const [targetYear, setTargetYear] = useState(initialState.targetYear);
  const [plans, setPlans] = useState(initialState.plans);
  const [activePlanId, setActivePlanId] = useState(initialState.activePlanId);
  
  const currentPlan = useMemo(() => plans.find(p => p.id === activePlanId) || plans[0], [plans, activePlanId]);
  const [departments, setDepartments] = useState(currentPlan.departments);
  const [employees, setEmployees] = useState(currentPlan.employees);
  const [notes, setNotes] = useState(currentPlan.notes || []);

  const [past, setPast] = useState([]); 
  const [future, setFuture] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null); 
  const [currentFileName, setCurrentFileName] = useState(initialState.currentFileName || '');

  useEffect(() => { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      targetYear, 
      activePlanId, 
      plans: plans.map(p => p.id === activePlanId ? { ...p, employees, departments, notes } : p) 
    })); 
  }, [targetYear, activePlanId, plans, employees, departments, notes, currentFileName]);

  const commit = useCallback(() => { 
    setPast(prev => { 
      const nextPast = [...prev, { employees, departments, notes }]; 
      return nextPast.length > 30 ? nextPast.slice(1) : nextPast; 
    }); 
    setFuture([]); 
  }, [employees, departments, notes]);

  const undo = useCallback(() => { 
    if (!past.length) return; 
    const previous = past[past.length - 1]; 
    setFuture(f => [{ employees, departments, notes }, ...f]); 
    setEmployees(previous.employees); 
    setDepartments(previous.departments); 
    setNotes(previous.notes || []);
    setPast(v => v.slice(0, v.length - 1)); 
    setSelectedEmp(null); 
  }, [past, employees, departments, notes]);

  const redo = useCallback(() => { 
    if (!future.length) return; 
    const next = future[0]; 
    setPast(p => [...p, { employees, departments, notes }]); 
    setEmployees(next.employees); 
    setDepartments(next.departments); 
    setNotes(next.notes || []);
    setFuture(f => f.slice(1)); 
    setSelectedEmp(null); 
  }, [future, employees, departments, notes]);

  const switchPlan = useCallback((id) => { 
    if (id === activePlanId) return; 
    setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, employees, departments, notes } : p)); 
    const nextPlan = plans.find(p => p.id === id) || plans[0]; 
    
    setEmployees(nextPlan.employees); 
    setDepartments(nextPlan.departments); 
    setNotes(nextPlan.notes || []);
    setActivePlanId(id); 
    
    setPast([]); 
    setFuture([]); 
    setSelectedEmp(null); 
  }, [activePlanId, plans, employees, departments, notes]);

  const duplicatePlan = useCallback(() => { 
    const newId = `plan-${Date.now()}`; 
    const newPlan = { 
      id: newId, 
      name: `${currentPlan.name}のコピー`, 
      employees: JSON.parse(JSON.stringify(employees)), 
      departments: JSON.parse(JSON.stringify(departments)),
      notes: JSON.parse(JSON.stringify(notes))
    }; 
    setPlans(prev => [...prev.map(p => p.id === activePlanId ? { ...p, employees, departments, notes } : p), newPlan]); 
    setEmployees(newPlan.employees); 
    setDepartments(newPlan.departments); 
    setNotes(newPlan.notes);
    setActivePlanId(newId); 
    setPast([]); 
    setFuture([]); 
  }, [activePlanId, currentPlan.name, employees, departments, notes]);

  const deletePlan = useCallback((id) => { 
    setPlans(prev => { 
      const n = prev.filter(p => p.id !== id); 
      if (id === activePlanId && n.length > 0) { 
        const nx = n[n.length - 1]; 
        setEmployees(nx.employees); 
        setDepartments(nx.departments); 
        setNotes(nx.notes || []);
        setActivePlanId(nx.id); 
        setPast([]); 
        setFuture([]); 
      } 
      return n; 
    }); 
  }, [activePlanId]);

  return {
    targetYear, setTargetYear, plans, setPlans, activePlanId, setActivePlanId,
    departments, setDepartments, employees, setEmployees, notes, setNotes,
    currentFileName, setCurrentFileName, past, future, selectedEmp, setSelectedEmp,
    commit, undo, redo, switchPlan, duplicatePlan, deletePlan,
  };
}