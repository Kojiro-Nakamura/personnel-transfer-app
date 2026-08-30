import React, { createContext, useContext, useMemo, useEffect, useState, useCallback } from 'react';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from '../constants/initialData.js';
import { useAppHistory } from '../hooks/useAppHistory.js';
import { useAppMutations } from '../hooks/useAppMutations.js';
import { useExportActions } from '../hooks/useExportActions.js';
import { STORAGE_KEY } from '../constants/config.js';
import { getGradeLevel } from '../utils/helpers.js';
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
export function AppProvider({ children }) {
  const initialState = useMemo(() => { 
    try { 
      const saved = localStorage.getItem(STORAGE_KEY); 
      if (saved) {
        const d = JSON.parse(saved);
        if (d.plans) {
          d.plans.forEach(p => { 
            if (!p.notes) p.notes = []; 
            if (p.employees) {
              p.employees = p.employees.map(emp => ({
                ...emp,
                currentExclude: emp.currentExclude !== undefined ? emp.currentExclude : (emp.currentExcluded || ''),
                nextExclude: emp.nextExclude !== undefined ? emp.nextExclude : (emp.nextExcluded || '')
              }));
            }
          });
        }
        return d;
      }
    } catch(e) {} 
    
    return { 
      targetYear: 2027, 
      activePlanId: 'plan-1', 
      plans: [{ 
        id: 'plan-1', 
        name: '基本案', 
        employees: INITIAL_EMPLOYEES, 
        departments: INITIAL_DEPARTMENTS, 
        notes: [] 
      }] 
    }; 
  }, []);

  const history = useAppHistory(initialState);
  
  const [zoom, setZoom] = useState(1);
  const [hoveredEmpId, setHoveredEmpId] = useState(null); 
  const [collapsedDepts, setCollapsedDepts] = useState({});
  const [filterLevel, setFilterLevel] = useState(0);

  const [modals, setModals] = useState({ 
    emp: { isOpen: false, data: null }, 
    dept: { isOpen: false, data: null }, 
    post: { isOpen: false, data: null }, 
    group: { isOpen: false, data: null }, 
    groupPost: { isOpen: false, data: null }, 
    delConfirm: { isOpen: false, data: null }, 
    rollOver: { isOpen: false, data: null }, 
    planName: { isOpen: false, data: null }, 
    validation: { isOpen: false, data: null },
    bulkEdit: { isOpen: false, data: null }, 
    saveFile: { isOpen: false, data: null },
    openFile: { isOpen: false, data: null },
    empSelect: { isOpen: false, data: null },
    titleChangeConfirm: { isOpen: false, data: null },
    note: { isOpen: false, data: null },
    chainTransfer: { isOpen: false, data: null }
  });

  const openModal = useCallback((type, data = null) => {
    setModals(prev => ({ ...prev, [type]: { isOpen: true, data } }));
  }, []);
  
  const closeModal = useCallback((type) => {
    setModals(prev => ({ ...prev, [type]: { isOpen: false, data: null } }));
  }, []);
  
  const toggleDept = useCallback((id) => {
    setCollapsedDepts(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);
  
  const updatePlanName = useCallback((id, name) => {
    history.setPlans(prev => prev.map(plan => plan.id === id ? { ...plan, name } : plan));
  }, [history]);

  const expandAll = useCallback(() => setCollapsedDepts({}), []);
  
  const collapseAll = useCallback(() => {
    setCollapsedDepts(history.departments.filter(dept => dept.type === 'regular').reduce((acc, dept) => ({ ...acc, [dept.id]: true }), {}));
  }, [history.departments]);

  const mutations = useAppMutations(history.setEmployees, history.setDepartments, history.setNotes, history.commit);

  const { deptMap, nextMap, currMap } = useMemo(() => {
    const unNext = { unassigned: [], retired: [] }; 
    const unCurr = { unassigned: [], retired: [] }; 
    const map = {};
    
    history.departments.forEach(d => { 
      if (d.type !== 'regular') return; 
      map[d.id] = { direct: { current: [], next: [] }, posts: {}, groups: {} }; 
      
      (d.posts || []).forEach(p => { 
        map[d.id].posts[p.id] = { current: [], next: [] }; 
      }); 
      
      (d.groups || []).forEach(g => { 
        map[d.id].groups[g.id] = { direct: { current: [], next: [] }, posts: {} }; 
        (g.posts || []).forEach(gp => { 
          map[d.id].groups[g.id].posts[gp.id] = { current: [], next: [] }; 
        }); 
      }); 
    });
    
    history.employees.forEach(e => {
      const assignToMap = (emp, dId, pId, gId, gpId, isSrc, tMap) => { 
        if (dId === 'unassigned') {
          tMap.unassigned.push(emp); 
        } else if (dId === 'retired') {
          tMap.retired.push(emp); 
        } else if (map[dId]) { 
          const t = isSrc ? 'current' : 'next'; 
          if (pId && map[dId].posts[pId]) {
            map[dId].posts[pId][t].push(emp); 
          } else if (gId && map[dId].groups[gId]) { 
            const g = map[dId].groups[gId]; 
            if (gpId && g.posts[gpId]) {
              g.posts[gpId][t].push(emp); 
            } else {
              g.direct[t].push(emp); 
            }
          } else {
            map[dId].direct[t].push(emp); 
          }
        } 
      };
      
      assignToMap(e, e.currentDeptId, e.currentPostId, e.currentGroupId, e.currentGroupPostId, true, unCurr); 
      assignToMap(e, e.departmentId, e.postId, e.groupId, e.groupPostId, false, unNext);
    });
    
    const srt = (arr, k) => arr.sort((a, b) => (a[k] || 0) - (b[k] || 0));
    
    Object.values(map).forEach(d => { 
      srt(d.direct.current, 'orderCurrent'); 
      srt(d.direct.next, 'orderNext'); 
      Object.values(d.posts).forEach(p => { 
        srt(p.current, 'orderCurrent'); 
        srt(p.next, 'orderNext'); 
      }); 
      Object.values(d.groups).forEach(g => { 
        srt(g.direct.current, 'orderCurrent'); 
        srt(g.direct.next, 'orderNext'); 
        Object.values(g.posts).forEach(gp => { 
          srt(gp.current, 'orderCurrent'); 
          srt(gp.next, 'orderNext'); 
        }); 
      }); 
    });
    
    srt(unNext.unassigned, 'orderNext'); 
    srt(unNext.retired, 'orderNext'); 
    srt(unCurr.unassigned, 'orderCurrent'); 
    srt(unCurr.retired, 'orderCurrent');
    
    return { deptMap: map, nextMap: unNext, currMap: unCurr };
  }, [history.employees, history.departments]);

  const handleAssign = useCallback((empId, placement) => {
    const emp = history.employees.find(e => e.id === empId);
    if (!emp) return;

    const { dId, pId, gId, gpId } = placement;
    let targetPostName = null;

    if (pId) {
      const dept = history.departments.find(d => d.id === dId);
      if (dept) {
        const post = dept.posts?.find(p => p.id === pId);
        if (post) targetPostName = post.nextName || post.name;
      }
    } else if (gpId) {
      const dept = history.departments.find(d => d.id === dId);
      if (dept) {
        const group = dept.groups?.find(g => g.id === gId);
        if (group) {
          const gpost = group.posts?.find(p => p.id === gpId);
          if (gpost) targetPostName = gpost.nextName || gpost.name;
        }
      }
    }

    mutations.assignSlot(empId, placement);

    if (targetPostName) {
      const currentTitle = emp.currentTitle || '';
      if (targetPostName !== currentTitle) {
        const isCurrentHancho = currentTitle === '班長' || currentTitle === '課長補佐兼班長';
        const isTargetHancho = targetPostName === '班長';
        const isTargetGL = targetPostName === 'GL';

        if (!(isCurrentHancho && isTargetHancho) && !isTargetGL) {
          setTimeout(() => {
             openModal('titleChangeConfirm', {
               empId: empId,
               empName: emp.name,
               oldTitle: currentTitle,
               newTitle: targetPostName
             });
          }, 50);
        }
      }
    }
  }, [history.employees, history.departments, mutations, openModal]);

  const handleCellClick = useCallback((tId, src, dId, pId = null, gId = null, gpId = null) => {
    if (!history.selectedEmp) { 
      if (tId) {
        history.setSelectedEmp({ id: tId, isSource: src }); 
      } else if (!src && dId !== 'unassigned' && dId !== 'retired') {
        openModal('empSelect', { dId, pId, gId, gpId });
      }
    } else {
      if (history.selectedEmp.id === tId && history.selectedEmp.isSource === src) {
        history.setSelectedEmp(null);
      } else {
        if (src) return;
        handleAssign(history.selectedEmp.id, { dId, pId, gId, gpId });
        history.setSelectedEmp(null);
      }
    }
  }, [history, handleAssign, openModal]);

  const handleRollOver = useCallback(() => {
    history.commit();
    const retained = history.employees.filter(e => e.departmentId !== 'retired');
    
    const nDepts = history.departments.map(d => { 
      if (d.type !== 'regular') return d; 
      return { 
        ...d, 
        name: d.nextName || d.name, 
        nextName: '', 
        posts: (d.posts || []).map(p => ({ ...p, name: p.nextName || p.name, nextName: '' })), 
        groups: (d.groups || []).map(g => ({ 
          ...g, 
          name: g.nextName || g.name, 
          nextName: '', 
          posts: (g.posts || []).map(gp => ({ ...gp, name: gp.nextName || gp.name, nextName: '' })) 
        })) 
      }; 
    });
    
    const nEmps = retained.map(e => {
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
      const gradeToPromoKey = {
        '主任級': 'promoYearChief',
        '主査級（１）': 'promoYearAssistant1',
        '主査級（２）': 'promoYearAssistant2',
        '主査級（３）': 'promoYearAssistant3',
        '課長級': 'promoYearSecHead',
        '所属長級': 'promoYearDivHead',
        '次長級': 'promoYearDeputyHead',
        '部長級': 'promoYearDeptHead'
      };

      let promoUpdates = {};
      if (getGradeLevel(e.nextGrade) > getGradeLevel(e.currentGrade)) {
        const promoKey = gradeToPromoKey[e.nextGrade];
        if (promoKey) {
          promoUpdates[promoKey] = history.targetYear.toString();
        }
      }

      return { 
        ...e, 
        ...promoUpdates,
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
    });
    
    history.setDepartments(nDepts); 
    history.setEmployees(nEmps); 
    history.setTargetYear(y => y + 1); 
    history.setSelectedEmp(null); 
    history.setNotes([]);
  }, [history]);

  const loadFromData = useCallback((data, fileName) => {
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
  }, [loadFromData]);

  const exports = useExportActions({
    targetYear: history.targetYear, 
    activePlanId: history.activePlanId, 
    plans: history.plans, 
    employees: history.employees, 
    departments: history.departments, 
    notes: history.notes, 
    filterLevel, 
    deptMap, 
    currMap, 
    nextMap, 
    setCurrentFileName: history.setCurrentFileName
  });

  const value = { 
    ...history,
    deptMap, nextMap, currMap,
    zoom, setZoom, hoveredEmpId, setHoveredEmpId, collapsedDepts, toggleDept,
    filterLevel, setFilterLevel, modals, openModal, closeModal,
    isPickingMode: !!history.selectedEmp, 
    canUndo: history.past.length > 0, 
    canRedo: history.future.length > 0, 
    expandAll, collapseAll, loadJSON, handleRollOver, handleCellClick, handleAssign,
    updatePlanName,
    cancelSelection: () => history.setSelectedEmp(null), 
    mutations,
    exportToJSON: exports.exportToJSON,
    loadFromData,
    exportToHTML: exports.exportToHTML,
    exportToExcel: exports.exportToExcel,
    exportUnifiedExcelBtn: exports.exportUnifiedExcelBtn,
    exportModalExcelBtn: exports.exportModalExcelBtn
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ==========================================
// 5. UIコンポーネント (Form & Cell & Note)
