import React, { useState, useMemo, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  Users, Building2, UserPlus, CornerDownRight, Layers, Award, AlertCircle, 
  UserMinus, Edit2, Trash2, X, Plus, FolderPlus, Undo, Redo, 
  FolderOpen, Download, ChevronsRight, Copy, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ChevronDown, ChevronRight, ChevronUp,
  ChevronsUp, ChevronsDown, Filter, Table, List, FileText, DownloadCloud, MessageSquare, MessageSquareText
} from 'lucide-react';

// ==========================================
// 1. 定数・初期データ
// ==========================================
const INITIAL_DEPARTMENTS = [
  { id: 'unassigned', name: '配置待ち', type: 'pool', posts: [], groups: [] },
  { id: 'retired', name: '退職・転出', type: 'pool', posts: [], groups: [] },
  {
    id: "dept-1", name: "森林整備課", type: "regular",
    posts: [{ id: "p-1", name: "課長" }, { id: "p-2", name: "副課長" }, { id: "p-3", name: "主幹" }],
    groups: [
      { id: "g-1", name: "緑化推進班", posts: [{ id: "gp-1", name: "班長" }] },
      { id: "g-2", name: "治山班", posts: [{ id: "gp-2", name: "班長" }] }
    ]
  }
];

const INITIAL_EMPLOYEES = [
  { id: "emp-1", employeeNumber: "083259", education: "三重大", hireDate: "1990-04-01", name: "和歌山 豊", birthDate: "1967-12-30", currentGrade: "所属長級", currentTitle: "課長", currentYears: 1, currentSkills: ["1"], currentEmploymentType: "", currentExclude: "", nextGrade: "次長級", nextTitle: "課長", nextYears: 1, nextSkills: [], nextEmploymentType: "", nextExclude: "", currentDeptId: "dept-1", currentPostId: "p-1", currentGroupId: null, currentGroupPostId: null, departmentId: "retired", postId: null, groupId: null, groupPostId: null, note: "", orderCurrent: 1000, orderNext: 1000 },
  { id: "emp-2", employeeNumber: "090565", education: "東京農大", hireDate: "1993-04-01", name: "海南 伸也", birthDate: "1970-05-02", currentGrade: "課長級", currentTitle: "副課長", currentYears: 1, currentSkills: ["1"], currentEmploymentType: "", currentExclude: "", nextGrade: "所属長級", nextTitle: "副課長", nextYears: 2, nextSkills: ["1+1"], nextEmploymentType: "", nextExclude: "", currentDeptId: "dept-1", currentPostId: "p-2", currentGroupId: null, currentGroupPostId: null, departmentId: "dept-1", postId: "p-2", groupId: null, groupPostId: null, note: "", orderCurrent: 2000, orderNext: 2000 },
  { id: "emp-3", employeeNumber: "096512", education: "東京農大", hireDate: "1995-04-01", name: "橋本 孝史", birthDate: "1972-09-25", currentGrade: "課長級", currentTitle: "主幹", currentYears: 2, currentSkills: ["1+1"], currentEmploymentType: "", currentExclude: "", nextGrade: "課長級", nextTitle: "主幹", nextYears: 3, nextSkills: ["1+1+1"], nextEmploymentType: "", nextExclude: "", currentDeptId: "dept-1", currentPostId: "p-3", currentGroupId: null, currentGroupPostId: null, departmentId: "dept-1", postId: "p-3", groupId: null, groupPostId: null, note: "", orderCurrent: 3000, orderNext: 3000 },
  { id: "emp-4", employeeNumber: "098123", education: "京都大", hireDate: "1996-04-01", name: "御坊 伸也", birthDate: "1973-11-12", currentGrade: "補佐級III(補佐兼班長)", currentTitle: "課長補佐兼班長", currentYears: 2, currentSkills: ["2"], currentEmploymentType: "", currentExclude: "", nextGrade: "補佐級III(補佐兼班長)", nextTitle: "課長補佐兼班長", nextYears: 1, nextSkills: [], nextEmploymentType: "", nextExclude: "", currentDeptId: "dept-1", currentPostId: null, currentGroupId: "g-1", currentGroupPostId: "gp-1", departmentId: "unassigned", postId: null, groupId: null, groupPostId: null, note: "", orderCurrent: 4000, orderNext: 4000 },
  { id: "emp-5", employeeNumber: "101788", education: "熊野高", hireDate: "1997-04-01", name: "有田 智雄", birthDate: "1978-11-05", currentGrade: "補佐級II(班長)", currentTitle: "班長", currentYears: 3, currentSkills: ["3"], currentEmploymentType: "", currentExclude: "", nextGrade: "補佐級II(班長)", nextTitle: "班長", nextYears: 4, nextSkills: ["4"], nextEmploymentType: "", nextExclude: "", currentDeptId: "dept-1", currentPostId: null, currentGroupId: "g-2", currentGroupPostId: "gp-2", departmentId: "dept-1", postId: null, groupId: "g-2", groupPostId: "gp-2", note: "", orderCurrent: 5000, orderNext: 5000 },
  { id: "emp-6", employeeNumber: "115678", education: "和歌山大", hireDate: "2005-04-01", name: "新宮 資紀", birthDate: "1982-04-20", currentGrade: "補佐級I(主任)", currentTitle: "主任", currentYears: 4, currentSkills: ["4"], currentEmploymentType: "", currentExclude: "", nextGrade: "補佐級I(主任)", nextTitle: "主任", nextYears: 5, nextSkills: ["5"], nextEmploymentType: "", nextExclude: "", currentDeptId: "dept-1", currentPostId: null, currentGroupId: "g-1", currentGroupPostId: null, departmentId: "dept-1", postId: null, groupId: "g-1", groupPostId: null, note: "", orderCurrent: 6000, orderNext: 6000 },
  { id: "emp-7", employeeNumber: "123456", education: "近畿大", hireDate: "2010-04-01", name: "かつらぎ 有香子", birthDate: "1987-08-15", currentGrade: "", currentTitle: "技師", currentYears: 2, currentSkills: ["2"], currentEmploymentType: "", currentExclude: "育休", nextGrade: "", nextTitle: "技師", nextYears: 1, nextSkills: [], nextEmploymentType: "", nextExclude: "育休", currentDeptId: "dept-1", currentPostId: null, currentGroupId: "g-2", currentGroupPostId: null, departmentId: "unassigned", postId: null, groupId: null, groupPostId: null, note: "", orderCurrent: 7000, orderNext: 7000 },
];

const GRADE_OPTIONS = ["", "部長級", "次長級", "所属長級", "課長級", "補佐級III(補佐兼班長)", "補佐級II(班長)", "補佐級I(主任)", "係長級(主査)"];
const STORAGE_KEY = 'jinjian_app_data_v28';

// ==========================================
// 2. 汎用ユーティリティ関数
// ==========================================
const cx = (...classes) => classes.filter(Boolean).join(' ');

const GRADE_LEVELS = {
  "部長級": 10,
  "次長級": 9,
  "所属長級": 8,
  "課長級": 7,
  "補佐級III(補佐兼班長)": 6,
  "補佐級II(班長)": 5,
  "補佐級I(主任)": 4,
  "係長級(主査)": 3,
  "一般": 1,
  "": 0
};

const getGradeLevel = (grade) => GRADE_LEVELS[grade] || 1;

const isPromotedGrade = (currGrade, nextGrade) => {
  const nextLvl = getGradeLevel(nextGrade);
  const currLvl = getGradeLevel(currGrade);
  return nextLvl > currLvl && nextLvl > 0;
};

const getPromotedBgClass = (grade) => {
  switch (grade) {
    case "部長級": return "bg-purple-300";
    case "次長級": return "bg-red-400";
    case "所属長級": return "bg-orange-300";
    case "課長級": return "bg-yellow-300";
    case "補佐級III(補佐兼班長)": return "bg-sky-300";
    case "補佐級II(班長)": return "bg-emerald-300";
    case "補佐級I(主任)": return "bg-pink-300";
    case "係長級(主査)": return "bg-slate-300";
    case "一般": return "bg-indigo-200";
    default: return "";
  }
};

const getPromotedBgColorCode = (grade) => {
  switch (grade) {
    case "部長級": return "#d8b4fe";
    case "次長級": return "#f87171";
    case "所属長級": return "#fdba74";
    case "課長級": return "#fde047";
    case "補佐級III(補佐兼班長)": return "#7dd3fc";
    case "補佐級II(班長)": return "#6ee7b7";
    case "補佐級I(主任)": return "#f9a8d4";
    case "係長級(主査)": return "#cbd5e1";
    case "一般": return "#c7d2fe";
    default: return "";
  }
};

const calculateAge = (birthDate, targetYear) => { 
  if (!birthDate || isNaN(targetYear)) return ''; 
  const date = new Date(birthDate); 
  let age = targetYear - date.getFullYear(); 
  if (date.getMonth() + 1 > 4 || (date.getMonth() + 1 === 4 && date.getDate() > 1)) {
    age--; 
  }
  return age; 
};

const parseJapaneseDate = (str) => {
  if (!str) return '';
  const match = str.match(/^([MTSHR])(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return str;
  const [, era, yearStr, monthStr, dayStr] = match;
  let year = parseInt(yearStr, 10);
  if (era === 'M') year += 1867;
  else if (era === 'T') year += 1911;
  else if (era === 'S') year += 1925;
  else if (era === 'H') year += 1988;
  else if (era === 'R') year += 2018;
  return `${year}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
};

const parseCSVRow = (str) => {
  const result = []; 
  let current = ''; 
  let inQuotes = false;
  const cleanStr = str.replace(/[\r\n]+$/, '');
  
  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr[i];
    if (char === '"') {
      if (inQuotes && cleanStr[i + 1] === '"') { 
        current += '"'; 
        i++; 
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) { 
      result.push(current.trim()); 
      current = ''; 
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const getPairs = (curr = [], next = []) => {
  const length = Math.max(curr.length, next.length, 1);
  return Array.from({ length }).map((_, i) => [curr[i], next[i], i]);
};

const getCounts = (emps, isNext) => {
  return emps.reduce((acc, emp) => {
    if (!emp) return acc;
    const excludeVal = isNext ? emp.nextExclude : emp.currentExclude;
    if (excludeVal && excludeVal.trim() !== '') {
      acc.other++;
    } else {
      acc.main++;
    }
    return acc;
  }, { main: 0, other: 0 });
};

const formatCountText = ({ main, other }) => {
  return other > 0 ? `${main}人（その他${other}人）` : `${main}人`;
};

const generateGradeSummary = (emps, isNext) => {
  const counts = {};
  let total = 0;
  let excludeCount = 0;
  
  emps.forEach(emp => {
    const deptId = isNext ? emp.departmentId : emp.currentDeptId;
    if (deptId === 'unassigned' || deptId === 'retired') return;
    
    const excludeVal = isNext ? emp.nextExclude : emp.currentExclude;
    if (excludeVal && excludeVal.trim() !== '') {
      excludeCount++;
      return;
    }

    const grade = (isNext ? emp.nextGrade : emp.currentGrade) || '一般';
    counts[grade] = (counts[grade] || 0) + 1;
    total++;
  });

  const summaryParts = [];
  const order = ["部長級", "次長級", "所属長級", "課長級", "補佐級III(補佐兼班長)", "補佐級II(班長)", "補佐級I(主任)", "係長級(主査)", "一般"];
  order.forEach(grade => {
    if (counts[grade]) summaryParts.push(`${grade}${counts[grade]}人`);
  });
  Object.keys(counts).forEach(k => {
    if (!order.includes(k)) summaryParts.push(`${k}${counts[k]}人`);
  });

  let res = summaryParts.length > 0 ? `${summaryParts.join('　')}　合計${total}人` : `合計0人`;
  if (excludeCount > 0) {
    res += `（その他${excludeCount}人）`;
  }
  return res;
};

const filterDirects = (list, filterLevel, isNext) => {
  if (filterLevel === 0) return list;
  return list.filter(emp => {
    const grade = isNext ? emp.nextGrade : emp.currentGrade;
    return getGradeLevel(grade) >= filterLevel;
  });
};

const calcNextSkills = (skills, years, isSameSlot, isSameDepartment) => { 
  if (!isSameDepartment) {
    return ['1'];
  }
  if (!isSameSlot) { 
    const joined = (skills || []).join('、'); 
    return joined ? [`${joined}+1`] : (years > 0 ? [`${years}+1`] : ['1']); 
  } 
  
  const detailStr = (skills || []).join('、'); 
  if (!detailStr) return []; 
  
  if (detailStr.includes('+')) { 
    const parts = detailStr.split('+'); 
    const lastNum = parseInt(parts[parts.length - 1], 10); 
    if (!isNaN(lastNum)) { 
      parts[parts.length - 1] = (lastNum + 1).toString(); 
      return [parts.join('+')]; 
    } 
  } else { 
    const numMatch = detailStr.match(/(\d+)(?!.*\d)/); 
    if (numMatch) { 
      const numStr = numMatch[1]; 
      const replaceIndex = detailStr.lastIndexOf(numStr); 
      const incremented = (parseInt(numStr, 10) + 1).toString();
      return [detailStr.substring(0, replaceIndex) + incremented + detailStr.substring(replaceIndex + numStr.length)]; 
    } 
  } 
  return [detailStr]; 
};

const calcOrder = (array, index, position, key) => { 
  if (array.length === 0) return 1000; 
  if (index === -1) return (array[array.length - 1][key] || 0) + 1000; 
  
  let prevOrder = position === 'before' 
    ? (index > 0 ? (array[index - 1][key] || 0) : ((array[0][key] || 0) - 1000)) 
    : (array[index][key] || 0); 
    
  let nextOrder = position === 'before' 
    ? (array[index][key] || 0) 
    : (index < array.length - 1 ? (array[index + 1][key] || 0) : ((array[array.length - 1][key] || 0) + 1000)); 
    
  return (prevOrder + nextOrder) / 2; 
};

const clearPlacement = (emp, targetId, type) => { 
  let updated = { ...emp }; 
  if (type === 'dept') { 
    if (emp.currentDeptId === targetId) { 
      updated.currentDeptId = 'unassigned'; updated.currentPostId = null; 
      updated.currentGroupId = null; updated.currentGroupPostId = null; 
    } 
    if (emp.departmentId === targetId) { 
      updated.departmentId = 'unassigned'; updated.postId = null; 
      updated.groupId = null; updated.groupPostId = null; 
    } 
  } else if (type === 'post') { 
    if (emp.currentPostId === targetId) updated.currentPostId = null; 
    if (emp.postId === targetId) updated.postId = null; 
  } else if (type === 'group') { 
    if (emp.currentGroupId === targetId) { 
      updated.currentGroupId = null; updated.currentGroupPostId = null; 
    } 
    if (emp.groupId === targetId) { 
      updated.groupId = null; updated.groupPostId = null; 
    } 
  } else if (type === 'groupPost') { 
    if (emp.currentGroupPostId === targetId) updated.currentGroupPostId = null; 
    if (emp.groupPostId === targetId) updated.groupPostId = null; 
  } 
  return updated; 
};

const createMoveProps = (emp, index, length, isSource, mutations) => ({
  onMoveUp: emp && index > 0 ? () => mutations.moveEmployee(emp.id, isSource, 'up') : undefined,
  onMoveDown: emp && index < length - 1 ? () => mutations.moveEmployee(emp.id, isSource, 'down') : undefined
});

const downloadFile = (content, mimeType, filename) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a'); 
  link.href = URL.createObjectURL(blob); 
  link.download = filename; 
  link.click();
};

const traverseOrgTree = (departments, deptMap, currMap, nextMap, filterLevel, callback) => {
  departments.filter(dept => dept.type === 'regular').forEach(dept => {
    const dm = deptMap[dept.id];
    
    dept.posts.forEach(post => { 
      const pd = dm.posts[post.id]; 
      const maxRows = Math.max(pd.current.length, pd.next.length, 1);
      for (let i = 0; i < maxRows; i++) {
        callback(dept, null, post.name, pd.current[i], pd.next[i], 'post', i, post); 
      }
    });

    dept.groups.forEach(group => { 
      const gm = dm.groups[group.id]; 
      group.posts.forEach(post => { 
        const gpd = gm.posts[post.id]; 
        const maxRows = Math.max(gpd.current.length, gpd.next.length, 1);
        for (let i = 0; i < maxRows; i++) {
          callback(dept, group, post.name, gpd.current[i], gpd.next[i], 'groupPost', i, post); 
        }
      }); 
      
      const currDirects = filterDirects(gm.direct.current, filterLevel, false);
      const nextDirects = filterDirects(gm.direct.next, filterLevel, true);
      const maxDirectRows = Math.max(currDirects.length, nextDirects.length, 1);
      for (let i = 0; i < maxDirectRows; i++) { 
        if (currDirects[i] || nextDirects[i]) {
          callback(dept, group, '班員', currDirects[i], nextDirects[i], 'direct', i, null); 
        }
      }
    });

    const currDeptDirects = filterDirects(dm.direct.current, filterLevel, false);
    const nextDeptDirects = filterDirects(dm.direct.next, filterLevel, true);
    const maxDeptDirectRows = Math.max(currDeptDirects.length, nextDeptDirects.length, 1);
    for (let i = 0; i < maxDeptDirectRows; i++) { 
      if (currDeptDirects[i] || nextDeptDirects[i]) {
        callback(dept, null, '', currDeptDirects[i], nextDeptDirects[i], 'deptDirect', i, null); 
      }
    }
  });

  const currUnassigned = filterDirects(currMap.unassigned, filterLevel, false);
  const nextUnassigned = filterDirects(nextMap.unassigned, filterLevel, true);
  for (let i = 0; i < Math.max(currUnassigned.length, nextUnassigned.length, 1); i++) { 
    if (currUnassigned[i] || nextUnassigned[i]) {
      callback({name: '【未配置】'}, null, '', currUnassigned[i], nextUnassigned[i], 'system', i, null); 
    }
  }

  const currRetired = filterDirects(currMap.retired, filterLevel, false);
  const nextRetired = filterDirects(nextMap.retired, filterLevel, true);
  for (let i = 0; i < Math.max(currRetired.length, nextRetired.length, 1); i++) { 
    if (currRetired[i] || nextRetired[i]) {
      callback({name: '【退職】'}, null, '', currRetired[i], nextRetired[i], 'system', i, null); 
    }
  }
};

const getPlacementName = (deptId, postId, groupId, groupPostId, depts) => {
  const dept = depts.find(d => d.id === deptId);
  if (!dept) return '';
  let str = dept.name;
  if (postId) {
    const p = dept.posts?.find(x => x.id === postId);
    if (p) str += ` / ${p.name}`;
  } else if (groupId) {
    const g = dept.groups?.find(x => x.id === groupId);
    if (g) {
      str += ` / ${g.name}`;
      if (groupPostId) {
        const gp = g.posts?.find(x => x.id === groupPostId);
        if (gp) str += ` / ${gp.name}`;
      } else {
        str += ' / 班員';
      }
    }
  } else {
    str += ' / 課直属';
  }
  return str;
};

// ==========================================
// 3. カスタムフック群
// ==========================================
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

function useAppHistory(initialState) {
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
  const [currentFileName, setCurrentFileName] = useState('');

  useEffect(() => { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      targetYear, 
      activePlanId, 
      plans: plans.map(p => p.id === activePlanId ? { ...p, employees, departments, notes } : p) 
    })); 
  }, [targetYear, activePlanId, plans, employees, departments, notes]);

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

function useAppMutations(setEmployees, setDepartments, setNotes, commit) {
  const updateEmps = useCallback((updater) => { commit(); setEmployees(updater); }, [commit, setEmployees]);
  const updateDepts = useCallback((updater) => { commit(); setDepartments(updater); }, [commit, setDepartments]);
  const updateNotesState = useCallback((updater) => { commit(); setNotes(updater); }, [commit, setNotes]);

  return useMemo(() => ({
    addEmployee: (data) => updateEmps(prev => [...prev, { id: `emp-${Date.now()}`, orderCurrent: Date.now(), orderNext: Date.now(), ...data }]),
    updateEmployee: (id, data) => updateEmps(prev => prev.map(emp => emp.id === id ? { ...emp, ...data } : emp)),
    bulkProcessEmployees: (updates, deletes, additions) => updateEmps(prev => {
      let next = [...prev];
      if (deletes?.length) { 
        const delSet = new Set(deletes); 
        next = next.filter(e => !delSet.has(e.id)); 
      }
      if (updates?.length) { 
        const updMap = new Map(updates.map(e => [e.id, e])); 
        next = next.map(e => updMap.has(e.id) ? { ...e, ...updMap.get(e.id) } : e); 
      }
      if (additions?.length) {
        next = [...next, ...additions];
      }
      return next;
    }),
    unassignEmployee: (id, isSource) => updateEmps(prev => prev.map(emp => { 
      if (emp.id !== id) return emp; 
      if (isSource) {
        return { ...emp, currentDeptId: 'unassigned', currentPostId: null, currentGroupId: null, currentGroupPostId: null }; 
      }
      return { ...emp, departmentId: 'unassigned', postId: null, groupId: null, groupPostId: null }; 
    })),
    assignSlot: (empId, placement) => updateEmps(prev => {
      const idx = prev.findIndex(e => e.id === empId);
      if (idx === -1) return prev;
      
      const nE = { ...prev[idx] };
      const { dId, pId, gId, gpId } = placement;
      
      nE.departmentId = dId; 
      nE.postId = pId; 
      nE.groupId = gId; 
      nE.groupPostId = gpId;
      
      const isSameDepartment = dId !== 'unassigned' && dId !== 'retired' && dId === nE.currentDeptId;
      const isSamePost = pId && nE.currentPostId === pId;
      const isSameGroupGeneral = gId && !gpId && nE.currentGroupId === gId && !nE.currentGroupPostId;
      const isSameGroupPost = gId && gpId && nE.currentGroupId === gId && nE.currentGroupPostId === gpId;
      const isSameDeptGeneral = !pId && !gId && !nE.currentPostId && !nE.currentGroupId;

      const isSameSlot = isSameDepartment && (isSamePost || isSameGroupGeneral || isSameGroupPost || isSameDeptGeneral);
      
      nE.nextYears = isSameSlot ? (nE.currentYears || 0) + 1 : 1; 
      nE.nextSkills = (dId === 'unassigned' || dId === 'retired') ? [] : calcNextSkills(nE.currentSkills, nE.currentYears, isSameSlot, isSameDepartment);
      
      const sg = prev.filter(e => 
        e.id !== empId && 
        (e.departmentId === dId && e.postId === pId && e.groupId === gId && e.groupPostId === gpId)
      ).sort((a, b) => (a.orderNext || 0) - (b.orderNext || 0));
      
      nE.orderNext = calcOrder(sg, -1, 'after', 'orderNext');
      
      const res = [...prev]; 
      res[idx] = nE; 
      return res;
    }),
    
    addDepartment: (data) => updateDepts(prev => [...prev, { id: `dept-${Date.now()}`, type: 'regular', posts: [], groups: [], ...data }]),
    updateDepartment: (id, data) => updateDepts(prev => prev.map(dept => dept.id === id ? { ...dept, ...data } : dept)),
    updateAllDepartments: (depts) => updateDepts(depts),
    deleteDepartment: (id) => { 
      updateDepts(prev => prev.filter(d => d.id !== id)); 
      updateEmps(prev => prev.map(e => clearPlacement(e, id, 'dept'))); 
      updateNotesState(prev => prev.filter(n => !n.targetId.includes(`dept-${id}`))); 
    },
    addPost: (dId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, posts: [...(d.posts || []), { id: `post-${Date.now()}`, ...data }] } : d)),
    updatePost: (dId, pId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, posts: d.posts.map(p => p.id === pId ? { ...p, ...data } : p) } : d)),
    deletePost: (dId, pId) => { 
      updateDepts(prev => prev.map(d => d.id === dId ? { ...d, posts: d.posts.filter(p => p.id !== pId) } : d)); 
      updateEmps(prev => prev.map(e => clearPlacement(e, pId, 'post'))); 
      updateNotesState(prev => prev.filter(n => !n.targetId.includes(`post-${pId}`))); 
    },
    addGroup: (dId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: [...(d.groups || []), { id: `grp-${Date.now()}`, posts: [], ...data }] } : d)),
    updateGroup: (dId, gId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.map(g => g.id === gId ? { ...g, ...data } : g) } : d)),
    deleteGroup: (dId, gId) => { 
      updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.filter(g => g.id !== gId) } : d)); 
      updateEmps(prev => prev.map(e => clearPlacement(e, gId, 'group'))); 
      updateNotesState(prev => prev.filter(n => !n.targetId.includes(`group-${gId}`))); 
    },
    addGroupPost: (dId, gId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.map(g => g.id === gId ? { ...g, posts: [...(g.posts || []), { id: `gpost-${Date.now()}`, ...data }] } : g) } : d)),
    updateGroupPost: (dId, gId, pId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.map(g => g.id === gId ? { ...g, posts: g.posts.map(p => p.id === pId ? { ...p, ...data } : p) } : g) } : d)),
    deleteGroupPost: (dId, gId, pId) => { 
      updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.map(g => g.id === gId ? { ...g, posts: g.posts.filter(p => p.id !== pId) } : g) } : d)); 
      updateEmps(prev => prev.map(e => clearPlacement(e, pId, 'groupPost'))); 
      updateNotesState(prev => prev.filter(n => !n.targetId.includes(`groupPost-${pId}`))); 
    },
    
    moveDepartment: (dId, dir) => updateDepts(prev => { 
      const idx = prev.findIndex(d => d.id === dId); 
      const min = prev.findIndex(d => d.type === 'regular'); 
      if (idx < 0 || (dir === 'up' && idx <= min) || (dir === 'down' && idx === prev.length - 1)) return prev; 
      const n = [...prev]; 
      const s = dir === 'up' ? idx - 1 : idx + 1; 
      [n[idx], n[s]] = [n[s], n[idx]]; 
      return n; 
    }),
    movePost: (dId, pId, dir) => updateDepts(prev => prev.map(d => { 
      if (d.id !== dId) return d; 
      const idx = d.posts.findIndex(pt => pt.id === pId); 
      if (idx < 0 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === d.posts.length - 1)) return d; 
      const n = [...d.posts]; 
      const s = dir === 'up' ? idx - 1 : idx + 1; 
      [n[idx], n[s]] = [n[s], n[idx]]; 
      return { ...d, posts: n }; 
    })),
    moveGroupPost: (dId, gId, pId, dir) => updateDepts(prev => prev.map(d => { 
      if (d.id !== dId) return d; 
      const ng = d.groups.map(g => { 
        if (g.id !== gId) return g; 
        const idx = g.posts.findIndex(pt => pt.id === pId); 
        if (idx < 0 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === g.posts.length - 1)) return g; 
        const n = [...g.posts]; 
        const s = dir === 'up' ? idx - 1 : idx + 1; 
        [n[idx], n[s]] = [n[s], n[idx]]; 
        return { ...g, posts: n }; 
      }); 
      return { ...d, groups: ng }; 
    })),
    moveGroup: (dId, gId, dir) => updateDepts(prev => prev.map(d => { 
      if (d.id !== dId) return d; 
      const idx = d.groups.findIndex(g => g.id === gId); 
      if (idx < 0 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === d.groups.length - 1)) return d; 
      const n = [...d.groups]; 
      const s = dir === 'up' ? idx - 1 : idx + 1; 
      [n[idx], n[s]] = [n[s], n[idx]]; 
      return { ...d, groups: n }; 
    })),
    moveEmployee: (eId, src, dir) => updateEmps(prev => {
      const emp = prev.find(e => e.id === eId); 
      if (!emp) return prev;
      
      const k = src ? 'orderCurrent' : 'orderNext';
      const sg = prev.filter(e => src 
        ? (e.currentDeptId === emp.currentDeptId && e.currentPostId === emp.currentPostId && e.currentGroupId === emp.currentGroupId && e.currentGroupPostId === emp.currentGroupPostId) 
        : (e.departmentId === emp.departmentId && e.postId === emp.postId && e.groupId === emp.groupId && e.groupPostId === emp.groupPostId)
      ).sort((a, b) => (a[k] || 0) - (b[k] || 0));
      
      const idx = sg.findIndex(e => e.id === eId); 
      if (idx < 0 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === sg.length - 1)) return prev;
      
      const newSg = [...sg];
      const s = dir === 'up' ? idx - 1 : idx + 1;
      [newSg[idx], newSg[s]] = [newSg[s], newSg[idx]];
      
      return prev.map(e => {
        const foundIdx = newSg.findIndex(x => x.id === e.id);
        if (foundIdx !== -1) {
          return { ...e, [k]: (foundIdx + 1) * 1000 };
        }
        return e;
      });
    }),
    setNote: (targetId, text) => updateNotesState(prev => {
      const exists = prev.find(n => n.targetId === targetId);
      if (!text.trim()) return prev.filter(n => n.targetId !== targetId);
      if (exists) return prev.map(n => n.targetId === targetId ? { ...n, text } : n);
      return [...prev, { id: `note-${Date.now()}`, targetId, text }];
    }),
  }), [updateEmps, updateDepts, updateNotesState]);
}

function useExportActions({ targetYear, activePlanId, plans, employees, departments, notes, filterLevel, deptMap, currMap, nextMap, setCurrentFileName }) {
  const exportToJSON = useCallback((fileName) => {
    const dataToSave = { 
      targetYear, 
      activePlanId, 
      plans: plans.map(p => p.id === activePlanId ? { ...p, employees, departments, notes } : p) 
    };
    downloadFile(JSON.stringify(dataToSave, null, 2), 'application/json', fileName);
    setCurrentFileName(fileName);
  }, [targetYear, activePlanId, plans, employees, departments, notes, setCurrentFileName]);

  const exportToHTML = useCallback((fileName) => {
    const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    
    const dateObj = new Date();
    const printDate = `${dateObj.getFullYear()}年${dateObj.getMonth()+1}月${dateObj.getDate()}日 ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

    const getYearsStr = (emp, isNext) => { 
      if (!emp) return ''; 
      const years = isNext ? emp.nextYears : emp.currentYears;
      const skills = isNext ? emp.nextSkills : emp.currentSkills; 
      return skills?.length ? `${years}年(${skills.join('、')})` : `${years}年`; 
    };
    
    const getNoteStr = (emp, isNext) => {
      if (!emp) return '';
      return isNext ? emp.nextEmploymentType : emp.currentEmploymentType;
    };
    
    const getAgeStr = (emp, isNext) => {
      if (!emp || !emp.birthDate) return '';
      const age = calculateAge(emp.birthDate, isNext ? targetYear : targetYear - 1);
      return age !== '' ? `${age}歳` : '';
    };

    const generateTds = (emp, id, isNext, isHighlight) => { 
      const attributes = (id ? ` data-emp-id="${id}"` : '') + (isHighlight ? ' class="post-cell"' : ''); 
      let nameStyle = ''; let gradeStyle = '';
      if (emp && isNext && isPromotedGrade(emp.currentGrade, emp.nextGrade)) {
        const colorCode = getPromotedBgColorCode(emp.nextGrade);
        if (colorCode) { 
          nameStyle = ` style="background-color: ${colorCode};"`; 
          gradeStyle = ` style="background-color: ${colorCode};"`; 
        }
      }
      const values = [
        { val: emp ? (isNext ? emp.nextTitle : emp.currentTitle) : '', attr: attributes }, 
        { val: emp ? emp.name : '', attr: attributes + nameStyle }, 
        { val: emp ? (isNext ? emp.nextGrade : emp.currentGrade) : '', attr: attributes + gradeStyle }, 
        { val: getAgeStr(emp, isNext), attr: attributes }, 
        { val: getYearsStr(emp, isNext), attr: attributes }, 
        { val: getNoteStr(emp, isNext), attr: attributes }
      ];
      return values.map(v => `<td${v.attr}>${escapeHtml(v.val)}</td>`).join(''); 
    };
    
    const generateTbody = () => {
      let rowsHtml = ''; let lastDept = null; let lastGroup = null; let lastPost = null;
      
      traverseOrgTree(departments, deptMap, currMap, nextMap, 0, (dept, group, postName, currEmp, nextEmp, rowType, i, post) => {
        const deptName = dept.name;
        const groupName = group ? group.name : '';
        const isNewDept = deptName !== lastDept;
        const isNewGroup = isNewDept || groupName !== lastGroup;
        const displayPost = (isNewGroup || postName !== lastPost) ? postName : '';
        
        lastDept = deptName; lastGroup = groupName; lastPost = postName;

        let deptNoteText = '';
        if (isNewDept && dept.id) {
           const dNote = notes.find(n => n.targetId === `dept-${dept.id}`);
           if (dNote && dNote.text) {
             deptNoteText = `<br><span style="color:#0ea5e9;font-size:10px;">[メモ] ${escapeHtml(dNote.text)}</span>`;
           }
        }

        let displayDeptHtml = '';
        if (isNewDept) {
          if (dept.id && deptMap[dept.id]) {
            const dm = deptMap[dept.id];
            const deptCurrEmps = [...dm.direct.current];
            const deptNextEmps = [...dm.direct.next];
            
            Object.values(dm.posts).forEach(p => { 
              deptCurrEmps.push(...p.current); 
              deptNextEmps.push(...p.next); 
            });
            Object.values(dm.groups).forEach(g => {
              deptCurrEmps.push(...g.direct.current); 
              deptNextEmps.push(...g.direct.next);
              Object.values(g.posts).forEach(gp => { 
                deptCurrEmps.push(...gp.current); 
                deptNextEmps.push(...gp.next); 
              });
            });
            
            const cCounts = getCounts(deptCurrEmps, false);
            const nCounts = getCounts(deptNextEmps, true);
            displayDeptHtml = `${escapeHtml(deptName)} <span style="font-size:10px;font-weight:normal;color:#64748b;margin-left:4px;">（今:${formatCountText(cCounts)} / 来:${formatCountText(nCounts)}）</span>${deptNoteText}`;
          } else {
            displayDeptHtml = escapeHtml(deptName) + deptNoteText;
          }
        }

        let groupNoteText = '';
        if (isNewGroup && group && group.id) {
           const gNote = notes.find(n => n.targetId === `groupHeader-${dept.id}-${group.id}`);
           if (gNote && gNote.text) {
             groupNoteText = `<br><span style="color:#0ea5e9;font-size:10px;">[メモ] ${escapeHtml(gNote.text)}</span>`;
           }
        }

        let displayGroupHtml = '';
        if (isNewGroup && groupName !== '') {
          if (dept.id && group && group.id && deptMap[dept.id].groups[group.id]) {
            const gm = deptMap[dept.id].groups[group.id];
            const grpCurrEmps = [...gm.direct.current];
            const grpNextEmps = [...gm.direct.next];
            
            Object.values(gm.posts).forEach(gp => { 
              grpCurrEmps.push(...gp.current); 
              grpNextEmps.push(...gp.next); 
            });
            
            const gCCounts = getCounts(grpCurrEmps, false);
            const gNCounts = getCounts(grpNextEmps, true);
            displayGroupHtml = `${escapeHtml(groupName)} <span style="font-size:10px;font-weight:normal;color:#64748b;margin-left:4px;">（今:${formatCountText(gCCounts)} / 来:${formatCountText(gNCounts)}）</span>${groupNoteText}`;
          } else {
            displayGroupHtml = escapeHtml(groupName) + groupNoteText;
          }
        }

        let targetId = '';
        if (rowType === 'post') targetId = `postRow-${dept.id}-${post.id}-${i}`;
        else if (rowType === 'groupPost') targetId = `groupPostRow-${dept.id}-${group.id}-${post.id}-${i}`;
        else if (rowType === 'direct') targetId = `directRow-${dept.id}-${group.id}-${i}`;
        else if (rowType === 'deptDirect') targetId = `deptDirectRow-${dept.id}-${i}`;
        else if (rowType === 'system') targetId = `side-${nextEmp ? nextEmp.id : currEmp?.id}`;

        const note = notes.find(n => n.targetId === targetId);
        const rowNoteHtml = note && note.text 
          ? `<td style="color:#0369a1; white-space:pre-wrap; max-width:200px; font-size:11px;">${escapeHtml(note.text)}</td>` 
          : '<td></td>';

        const isPostCell = postName !== '' && postName !== '班員';
        const isDeptPost = isPostCell && groupName === ''; 
        const isGroupPost = isPostCell && groupName !== '';
        const isDeptLevelHighlight = (isNewDept || isDeptPost);
        const isGroupLevelHighlight = (isDeptLevelHighlight || isNewGroup || isGroupPost);
        const isPostLevelHighlight = (isGroupLevelHighlight || isPostCell);
        
        const deptClass = isDeptLevelHighlight ? ' class="post-cell"' : ''; 
        const groupClass = isGroupLevelHighlight ? ' class="post-cell"' : ''; 
        const postClass = isPostLevelHighlight ? ' class="post-cell"' : '';
        const currTds = generateTds(currEmp, currEmp?.id, false, isPostLevelHighlight);
        const nextTds = generateTds(nextEmp, nextEmp?.id, true, isPostLevelHighlight);
        
        const trAttr = ` data-dept="${escapeHtml(deptName)}" data-group="${escapeHtml(groupName)}"`;
        rowsHtml += `<tr${trAttr}><td${deptClass}>${displayDeptHtml}</td><td${groupClass}>${displayGroupHtml}</td><td${postClass}>${escapeHtml(displayPost)}</td>${currTds}${nextTds}${rowNoteHtml}</tr>\n`;
      });
      return rowsHtml;
    };

    const tbodyAll = generateTbody(); 
    const headers = ['部署名', '班・グループ', 'ポスト', '【今年度】職名', '【今年度】氏名', '【今年度】級', '【今年度】年齢', '【今年度】在籍', '【今年度】備考', '【来年度】職名', '【来年度】氏名', '【来年度】級', '【来年度】年齢', '【来年度】在籍', '【来年度】備考', 'メモ'];
    
    const currSummaryStr = generateGradeSummary(employees, false);
    const nextSummaryStr = generateGradeSummary(employees, true);
    const summaryHtml = `
      <div style="margin-bottom:16px;font-family:sans-serif;font-size:14px;background:#f8fafc;padding:12px;border:1px solid #e2e8f0;border-radius:6px;">
        <div style="margin-bottom:8px;"><strong>【全体集計（今年度）】</strong> ${escapeHtml(currSummaryStr)}</div>
        <div><strong>【全体集計（来年度）】</strong> <span style="color:#0369a1;font-weight:bold;">${escapeHtml(nextSummaryStr)}</span></div>
      </div>`;

    const gradeLevelsHtml = JSON.stringify(GRADE_LEVELS);
    const gradeOptionsHtml = JSON.stringify(GRADE_OPTIONS);

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(fileName.replace(/\.html$/, ''))} - 人事異動案</title>
  <style>
    table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; } 
    th, td { border: 1px solid #ccc; padding: 4px 8px; vertical-align: top; } 
    th { background-color: #f0f0f0; position: sticky; top: 0; border-bottom: 2px solid #94a3b8; z-index: 10; } 
    .highlight { background-color: #a7f3d0 !important; cursor: pointer; } 
    .selected { background-color: #fef08a !important; } 
    .post-cell { font-weight: bold; color: #0369a1; background-color: #e0f2fe; } 
    th:nth-child(4), td:nth-child(4), th:nth-child(10), td:nth-child(10), th:nth-child(16), td:nth-child(16) { border-left: 2px solid #475569; } 
    .filter-container { margin-bottom:16px; font-family:sans-serif; font-size:14px; background:#fff; padding:12px; border:1px solid #e2e8f0; border-radius:6px; display:inline-block; } 
    .filter-container label { margin-right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size: 13px; }
    tr.border-dept-top td { border-top: 3px solid #475569 !important; }
    tr.border-group-top td { border-top: 2px solid #94a3b8 !important; }

    /* ========== 印刷用最適化設定 ========== */
    .print-only { display: none; }
    @media print {
      @page {
        size: A4 landscape; /* 自動でA4横向きに設定 */
        margin: 10mm; /* 用紙の余白 */
      }
      body {
        -webkit-print-color-adjust: exact !important; /* 背景色・グラデーションを強制印刷 */
        print-color-adjust: exact !important;
        margin: 0;
        background-color: white;
        zoom: 0.7; /* 印刷設定画面で100%のままでも、自動的に70%サイズで出力されるようにする */
      }
      
      .print-only { display: table-footer-group; } /* 印刷時のみフッター情報を表示 */
      
      thead { display: table-header-group; } /* 複数ページにまたがる際、各ページ上部にヘッダーを表示 */
      tr { page-break-inside: avoid; } /* 行の途中で分断させない */
    }
  </style>
  <script>
    const GRADE_LEVELS = ${gradeLevelsHtml};
    const GRADE_OPTIONS = ${gradeOptionsHtml};
    const getGradeLevel = (grade) => GRADE_LEVELS[grade] || 1;

    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("td[data-emp-id]").forEach(td => {
        td.addEventListener("mouseenter", (e) => {
          const id = e.target.getAttribute("data-emp-id");
          if(id) document.querySelectorAll(\`td[data-emp-id="\${id}"]\`).forEach(el => el.classList.add("highlight"));
        });
        td.addEventListener("mouseleave", (e) => {
          const id = e.target.getAttribute("data-emp-id");
          if(id) document.querySelectorAll(\`td[data-emp-id="\${id}"]\`).forEach(el => el.classList.remove("highlight"));
        });
        td.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-emp-id");
          if(id) {
            const els = document.querySelectorAll(\`td[data-emp-id="\${id}"]\`);
            const isSel = els[0].classList.contains("selected");
            document.querySelectorAll("td.selected").forEach(el => el.classList.remove("selected"));
            if(!isSel) els.forEach(el => el.classList.add("selected"));
          }
        });
      });

      const tbody = document.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));
      
      const updateBorders = () => {
        let lastDept = null;
        let lastGroup = null;
        
        rows.forEach(row => {
          row.classList.remove('border-dept-top', 'border-group-top');
          
          if (row.style.display !== 'none') {
            const currentDept = row.getAttribute('data-dept');
            const currentGroup = row.getAttribute('data-group');
            
            if (currentDept !== lastDept) {
              row.classList.add('border-dept-top');
              lastDept = currentDept;
              lastGroup = currentGroup;
            } else if (currentGroup !== lastGroup) {
              row.classList.add('border-group-top');
              lastGroup = currentGroup;
            }
          }
        });
      };
      
      updateBorders();
      
      const filterContainer = document.querySelector(".filter-container");
      let radioHtml = '<strong>表示切り替え：</strong> <label title="すべての職員を表示する"><input type="radio" name="filter" value="0" checked> 全件表示</label>';
      
      const filteredOptions = GRADE_OPTIONS.filter(g => g !== "");
      filteredOptions.forEach(g => {
         radioHtml += \`<label title="\${g}以上の職員のみを表示する"><input type="radio" name="filter" value="\${GRADE_LEVELS[g]}"> \${g}以上</label>\`;
      });
      
      filterContainer.innerHTML = radioHtml;
      
      document.querySelectorAll("input[name='filter']").forEach(r => {
        r.addEventListener("change", (e) => {
          const filterLevel = parseInt(e.target.value, 10);
          
          rows.forEach(row => {
            if (filterLevel === 0) {
               row.style.display = "";
               return;
            }
            
            const postName = row.cells[2] ? row.cells[2].textContent.trim() : "";
            const currName = row.cells[4] ? row.cells[4].textContent.trim() : "";
            const currGrade = row.cells[5] ? row.cells[5].textContent.trim() : "";
            const nextName = row.cells[10] ? row.cells[10].textContent.trim() : "";
            const nextGrade = row.cells[11] ? row.cells[11].textContent.trim() : "";
            
            const currLvl = currGrade ? getGradeLevel(currGrade) : 0;
            const nextLvl = nextGrade ? getGradeLevel(nextGrade) : 0;
            const hasEmp = currName !== "" || nextName !== "";
            
            if (postName !== '班員' && postName !== '') {
               if (hasEmp && currLvl < filterLevel && nextLvl < filterLevel) {
                 row.style.display = "none";
               } else {
                 row.style.display = "";
               }
            } else {
               if (currLvl < filterLevel && nextLvl < filterLevel) {
                 row.style.display = "none";
               } else {
                 row.style.display = "";
               }
            }
          });
          
          updateBorders();
        });
      });
    });
  </script>
</head>
<body>
  <h2>${targetYear}年度(R${targetYear - 2018})人事異動案</h2>
  ${summaryHtml}
  <div class="filter-container">
  </div>
  <table>
    <thead><tr>${headers.map(s => `<th>${s}</th>`).join('')}</tr></thead>
    <tbody>${tbodyAll}</tbody>
    <tfoot class="print-only">
      <tr>
        <td colspan="${headers.length}" style="border: none; text-align: right; padding-top: 10px; color: #555; font-size: 9px;">
          出力ファイル名: ${escapeHtml(fileName)} 　/　 出力日時: ${printDate}
        </td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
    downloadFile(htmlContent, 'text/html;charset=utf-8;', fileName);
  }, [targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel]);

  return { exportToJSON, exportToHTML };
}

// ==========================================
// 4. アプリケーションコンテキストプロバイダー
// ==========================================
function AppProvider({ children }) {
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
    bulkEdit: { isOpen: false, data: null }, 
    saveFile: { isOpen: false, data: null },
    empSelect: { isOpen: false, data: null },
    titleChangeConfirm: { isOpen: false, data: null },
    note: { isOpen: false, data: null } 
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

        if (!(isCurrentHancho && isTargetHancho)) {
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
    
    const nEmps = retained.map(e => ({ 
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
    }));
    
    history.setDepartments(nDepts); 
    history.setEmployees(nEmps); 
    history.setTargetYear(y => y + 1); 
    history.setSelectedEmp(null); 
    history.setNotes([]);
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
  }, [history]);

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
    exportToHTML: exports.exportToHTML
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ==========================================
// 5. UIコンポーネント (Form & Cell & Note)
// ==========================================
const CommentButton = ({ targetId, theme = 'light', tooltipPos = 'right', hoverClass = 'group-hover/row:opacity-100' }) => {
  const { notes, openModal } = useApp();
  const note = notes.find(n => n.targetId === targetId);
  const hasNote = !!(note && note.text);

  const btnClass = theme === 'dark' 
    ? (hasNote ? "text-amber-300 hover:text-amber-100" : "text-slate-400 hover:text-slate-200")
    : (hasNote ? "text-sky-500 hover:text-sky-600" : "text-slate-300 hover:text-slate-500");

  return (
    <div className={cx("flex items-center group/tooltip relative", !hasNote && `opacity-0 transition-opacity ${hoverClass}`)}>
      <button 
        onClick={(e) => { e.stopPropagation(); openModal('note', { targetId, text: note?.text || '' }); }}
        className={cx("p-1 transition-colors rounded", btnClass)}
        title="コメントを追加/編集"
      >
        {hasNote ? <MessageSquareText className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
      </button>
      
      {hasNote && (
        <div className={cx("absolute top-1/2 -translate-y-1/2 w-48 bg-slate-800/60 text-white text-xs p-2.5 rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-pre-wrap break-words text-left", tooltipPos === 'right' ? "left-full ml-2" : "right-full mr-2")}>
          {note.text}
          <div className={cx("absolute top-1/2 -translate-y-1/2 border-4 border-transparent", tooltipPos === 'right' ? "-left-1 border-r-slate-800/60" : "-right-1 border-l-slate-800/60")}></div>
        </div>
      )}
    </div>
  );
};

const FormInput = ({ label, value, onChange, type = "text", disabled = false, placeholder = "", className = "" }) => (
  <div className={className}>
    <label className={cx("block text-xs mb-1", disabled ? "text-slate-400" : "text-slate-600")}>{label}</label>
    <input 
      type={type} 
      value={value !== undefined ? value : ''} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      placeholder={placeholder} 
      className={cx("w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : "bg-white", placeholder ? "placeholder:text-slate-400" : "")} 
    />
  </div>
);

const FormInputWithList = ({ label, value, onChange, disabled = false, placeholder = "", listId, options, className = "" }) => (
  <div className={className}>
    <label className={cx("block text-xs mb-1", disabled ? "text-slate-400" : "text-slate-600")}>{label}</label>
    <input 
      type="text" 
      list={listId} 
      value={value !== undefined ? value : ''} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      placeholder={placeholder} 
      className={cx("w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : "bg-white", placeholder ? "placeholder:text-slate-400" : "")} 
    />
    <datalist id={listId}>
      {options.map(o => <option key={o} value={o} />)}
    </datalist>
  </div>
);

const FormSelect = ({ label, value, onChange, options, disabled = false, className = "" }) => (
  <div className={className}>
    <label className={cx("block text-xs mb-1", disabled ? "text-slate-400" : "text-slate-600")}>{label}</label>
    <select 
      value={value !== undefined ? value : ''} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      className={cx("w-full border rounded p-1.5 text-sm outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : "bg-white")}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const PlacementSelector = ({ deptId, postId, groupId, groupPostId, departments, isNext, onChange, disabled, className = "flex h-[32px] gap-1" }) => {
  const parse = (v) => { 
    if (v.startsWith('post:')) return { deptId, postId: v.split(':')[1], groupId: null, groupPostId: null }; 
    if (v.startsWith('groupPost:')) { const p = v.split(':'); return { deptId, postId: null, groupId: p[1], groupPostId: p[2] }; } 
    if (v.startsWith('group:')) return { deptId, postId: null, groupId: v.split(':')[1], groupPostId: null }; 
    return { deptId, postId: null, groupId: null, groupPostId: null }; 
  };
  
  const val = postId ? `post:${postId}` : groupPostId ? `groupPost:${groupId}:${groupPostId}` : groupId ? `group:${groupId}` : 'direct';
  
  return (
    <div className={className}>
      <select 
        value={deptId || 'unassigned'} 
        onChange={e => onChange({ deptId: e.target.value, postId: null, groupId: null, groupPostId: null })} 
        disabled={disabled} 
        className={cx("w-1/2 px-1 border border-slate-300 rounded text-xs outline-none", disabled ? "bg-slate-100 text-slate-500" : "bg-white")}
      >
        <option value="unassigned">配置待ち</option>
        {departments.filter(d => d.id !== 'retired' && d.id !== 'unassigned').map(d => (
          <option key={d.id} value={d.id}>{isNext ? (d.nextName || d.name) : d.name}</option>
        ))}
        <option value="retired">退職・転出</option>
      </select>
      
      <select 
        value={val} 
        onChange={e => onChange(parse(e.target.value))} 
        disabled={disabled || (deptId === 'unassigned' || deptId === 'retired')} 
        className={cx("w-1/2 px-1 border border-slate-300 rounded text-xs outline-none", (disabled || !deptId || deptId === 'unassigned' || deptId === 'retired') ? "bg-slate-100 text-slate-500" : "bg-white")}
      >
        <option value="direct">（未配置/直属）</option>
        {departments.find(d => d.id === deptId)?.posts?.length > 0 && (
          <optgroup label="課直属ポスト">
            {departments.find(d => d.id === deptId).posts.map(p => (
              <option key={p.id} value={`post:${p.id}`}>{isNext ? (p.nextName || p.name) : p.name}</option>
            ))}
          </optgroup>
        )}
        {departments.find(d => d.id === deptId)?.groups?.length > 0 && (
          <optgroup label="班・グループ">
            {departments.find(d => d.id === deptId).groups.map(g => (
              <React.Fragment key={g.id}>
                {(g.posts || []).map(gp => (
                  <option key={gp.id} value={`groupPost:${g.id}:${gp.id}`}>■ {isNext ? (g.nextName || g.name) : g.name} - {isNext ? (gp.nextName || gp.name) : gp.name}</option>
                ))}
                <option value={`group:${g.id}`}>└ {isNext ? (g.nextName || g.name) : g.name}（班員）</option>
              </React.Fragment>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
};

const EmployeeCell = ({ emp, isNext, isEmpty, onClick, isPost, moveProps, isConflict, hasPeer }) => {
  const { isPickingMode, targetYear, openModal, mutations, hoveredEmpId, setHoveredEmpId, selectedEmp } = useApp();
  const isSelected = !!(selectedEmp && emp && selectedEmp.id === emp.id);
  
  if (isEmpty || !emp) {
    const emptyTextColor = isNext 
      ? (isPickingMode ? "text-slate-800" : (hasPeer ? "text-blue-500" : "text-slate-400")) 
      : "text-slate-400";

    return (
      <div 
        onClick={isNext ? onClick : undefined} 
        className={cx(
          "flex-1 flex items-center justify-center px-2 py-1 font-bold text-[11px] border-r transition-all border-dashed",
          emptyTextColor,
          isPost ? "border-sky-400" : "border-slate-300",
          isNext 
            ? cx("cursor-pointer", isPickingMode ? "hover:ring-2 hover:ring-inset hover:ring-amber-400 bg-amber-50" : "bg-slate-50/30 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-300")
            : "bg-slate-50/30 cursor-default"
        )}
        title={isNext ? (isPickingMode ? "選択中の職員をここに配置します" : "ここへ配置する職員を選択します") : ""}
      >
        {!isNext ? '' : (isPickingMode ? '+ ここに配置' : '+ 職員を選択')}
      </div>
    );
  }
  
  const ys = isNext ? emp.nextYears : emp.currentYears; 
  const sk = (isNext ? emp.nextSkills : emp.currentSkills || []).join('、'); 
  const yd = sk ? `${ys}年(${sk})` : `${ys}年`;
  const age = calculateAge(emp.birthDate, isNext ? targetYear : targetYear - 1);
  const showUnassign = emp && emp.departmentId !== 'unassigned';
  const noteText = isNext ? emp.nextEmploymentType : emp.currentEmploymentType;

  const isFutureUnassigned = !isNext && emp.departmentId === 'unassigned';
  const isFutureRetired = !isNext && emp.departmentId === 'retired';

  const defaultBorder = isPost ? "border-sky-400" : "border-slate-300";
  const defaultBg = isPost ? (isNext ? "bg-sky-200/50" : "bg-sky-100/50") : (isNext ? "bg-blue-50/10" : "bg-white");

  const borderClass = isConflict 
    ? "border-2 border-rose-500 z-10 shadow-[0_0_5px_rgba(225,29,72,0.4)]" 
    : isFutureUnassigned 
      ? "border-[3px] border-dashed border-orange-400" 
      : isFutureRetired 
        ? "border-[3px] border-dotted border-slate-800" 
        : `border-r ${defaultBorder}`;
        
  const bgClass = isConflict 
    ? "bg-rose-50/90" 
    : isFutureUnassigned 
      ? "bg-orange-50/80" 
      : isFutureRetired 
        ? "bg-slate-100/80" 
        : defaultBg;

  const isPromoted = isNext && emp && isPromotedGrade(emp.currentGrade, emp.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(emp.nextGrade) : "";

  const cellClasses = cx(
    "flex-1 flex items-center px-2 py-1 gap-2 transition-all relative group/emp duration-200 cursor-pointer",
    borderClass,
    isSelected ? "ring-2 ring-inset ring-[#0F828C] bg-[#0F828C]/10 z-10" : 
    isPickingMode && isNext ? "hover:ring-2 hover:ring-inset hover:ring-amber-500 bg-amber-50 z-10" : 
    emp.id === hoveredEmpId ? "bg-yellow-200 z-20 shadow-md transform -translate-y-0.5" : 
    bgClass
  );

  return (
    <div 
      onClick={(!isNext && isPickingMode && !isSelected) ? undefined : onClick} 
      onMouseEnter={() => setHoveredEmpId(emp.id)} 
      onMouseLeave={() => setHoveredEmpId(null)} 
      className={cellClasses} 
      title={isPickingMode && isNext ? "選択中の職員をここに配置します" : ""}
    >
      <div className={cx("w-14 truncate text-[10px]", isNext ? "text-blue-900" : "text-slate-800")} title={isNext ? emp.nextTitle : emp.currentTitle}>
        {isNext ? emp.nextTitle : emp.currentTitle}
      </div>
      
      <div className={cx("flex-1 flex items-center gap-1 min-w-0 text-[12px] font-bold", isConflict ? "text-rose-700" : isNext ? "text-[#065084]" : "text-slate-900", promoBg ? `${promoBg} px-1 rounded-sm` : "")} title={emp.name}>
        {isConflict && <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="この枠に定員を超えて配置されています" />}
        <span className="truncate">{emp.name}</span>
      </div>
      
      <div className={cx("w-12 truncate text-[10px] text-center", isNext ? "text-blue-900" : "text-slate-800", promoBg ? `${promoBg} px-1 rounded-sm` : "")} title={isNext ? emp.nextGrade : emp.currentGrade}>
        {isNext ? emp.nextGrade : emp.currentGrade}
      </div>
      
      <div className="w-8 text-[11px] text-slate-800 text-right" title={`${age}歳`}>{age !== '' ? `${age}歳` : ''}</div>
      
      <div className={cx("w-14 text-[11px] text-right font-medium truncate shrink-0", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "text-slate-800")} title={yd}>
        {yd}
      </div>
      
      <div className="w-16 truncate text-[10px] text-slate-700 text-left shrink-0 ml-1" title={noteText}>
        {noteText}
      </div>
      
      {!isPickingMode && (
        <div className="absolute top-1/2 -translate-y-1/2 right-1 flex gap-0.5 opacity-0 group-hover/emp:opacity-100 z-30 bg-slate-400/60 p-1 rounded-lg">
          {moveProps && (moveProps.onMoveUp || moveProps.onMoveDown) && (
            <>
              <button 
                onClick={(e) => { if(moveProps.onMoveUp) { e.stopPropagation(); moveProps.onMoveUp(); } }} 
                className={cx("p-1 rounded text-white transition-colors", moveProps.onMoveUp ? "hover:bg-slate-500/70" : "invisible")} 
                title={moveProps.onMoveUp ? "上に移動" : ""}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { if(moveProps.onMoveDown) { e.stopPropagation(); moveProps.onMoveDown(); } }} 
                className={cx("p-1 rounded text-white transition-colors", moveProps.onMoveDown ? "hover:bg-slate-500/70" : "invisible")} 
                title={moveProps.onMoveDown ? "下に移動" : ""}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); openModal('emp', emp); }} 
            className="p-1 rounded text-white hover:bg-slate-500/70 transition-colors" 
            title="職員情報を編集"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {showUnassign && (
            <button 
              onClick={(e) => { e.stopPropagation(); mutations.unassignEmployee(emp.id, false); }} 
              className="p-1 rounded text-white hover:bg-rose-500/80 transition-colors" 
              title={emp.departmentId === 'retired' ? "退職・転出を取り消して未配置に戻す" : "来年度の配置を未配置に戻す"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const EmployeeRow = ({ isFirst, titleIcon, titleText, onTitleEdit, onTitleDelete, onMoveUp, onMoveDown, currentEmp, nextEmp, onCurrentClick, onNextClick, isIndent = false, isPost = false, currentMove, nextMove, currConflict, nextConflict, rowAnchorId }) => (
  <div className={cx("flex border-b relative group/row", isPost ? "border-sky-400 bg-sky-50/20" : "border-slate-300 hover:bg-slate-50")}>
    <div className={cx("w-[140px] px-2 py-1.5 border-r flex items-center shrink-0 relative", isPost ? "border-sky-400 bg-sky-200/40 border-l-4 border-l-sky-600" : "border-slate-400 bg-slate-50 border-l-4 border-l-transparent")}>
      <div className="flex items-center gap-1.5 truncate w-full" title={titleText}>
        {isIndent && isFirst && <CornerDownRight className="w-3 h-3 text-slate-400 ml-4 shrink-0" />}
        {isFirst && titleIcon}
        {isFirst && <span className={cx("text-[11px] font-bold truncate", isPost ? "text-sky-900" : "text-slate-600")}>{titleText}</span>}
      </div>
      
      {isFirst && (onTitleEdit || onTitleDelete || (isPost && (onMoveUp || onMoveDown))) && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover/row:opacity-100 z-30 bg-slate-400/60 p-1 rounded-lg">
          {isPost && (onMoveUp || onMoveDown) && (
            <>
              <button 
                onClick={onMoveUp} 
                className={cx("p-1 rounded text-white transition-colors", onMoveUp ? "hover:bg-slate-500/70" : "invisible")} 
                title={onMoveUp ? "上に移動" : ""}
              >
                <ArrowUp className="w-3.5 h-3.5"/>
              </button>
              <button 
                onClick={onMoveDown} 
                className={cx("p-1 rounded text-white transition-colors", onMoveDown ? "hover:bg-slate-500/70" : "invisible")} 
                title={onMoveDown ? "下に移動" : ""}
              >
                <ArrowDown className="w-3.5 h-3.5"/>
              </button>
            </>
          )}
          {onTitleEdit && (
            <button 
              onClick={onTitleEdit} 
              className="p-1 rounded text-white hover:bg-slate-500/70 transition-colors" 
              title="名前を編集"
            >
              <Edit2 className="w-3.5 h-3.5"/>
            </button>
          )}
          {onTitleDelete && (
            <button 
              onClick={onTitleDelete} 
              className="p-1 rounded text-white hover:bg-rose-500/80 transition-colors" 
              title="削除"
            >
              <Trash2 className="w-3.5 h-3.5"/>
            </button>
          )}
        </div>
      )}
    </div>
    
    <EmployeeCell 
      emp={currentEmp} 
      isNext={false} 
      isEmpty={!currentEmp} 
      onClick={onCurrentClick} 
      isPost={isPost} 
      moveProps={currentMove} 
      isConflict={currConflict} 
      hasPeer={!!nextEmp} 
    />
    
    <EmployeeCell 
      emp={nextEmp} 
      isNext={true} 
      isEmpty={!nextEmp} 
      onClick={onNextClick} 
      isPost={isPost} 
      moveProps={nextMove} 
      isConflict={nextConflict} 
      hasPeer={!!currentEmp} 
    />
    
    <div className="w-[40px] border-l border-slate-300 flex items-center justify-center shrink-0 bg-white/50 z-20">
      {isFirst && <CommentButton targetId={rowAnchorId} tooltipPos="left" />}
    </div>
  </div>
);

const AddSlotRow = ({ label, indentClass, onClickNext, anchorId }) => {
  const { filterLevel, isPickingMode, selectedEmp } = useApp();
  if (filterLevel > 0) return null;
  return (
    <div className="flex border-b border-slate-400 relative group/row">
      <div className="w-[140px] px-2 py-1 border-r border-slate-400 flex items-center bg-white shrink-0">
        <span className={cx("text-[10px] text-slate-400 truncate border border-dashed border-slate-400 px-1 rounded", indentClass)}>
          {label}
        </span>
      </div>
      <div className="flex-1 border-r border-slate-400 bg-transparent"></div>
      <div 
        onClick={onClickNext} 
        className={cx(
          "flex-1 flex items-center justify-center text-[11px] font-bold transition-all border-dashed border border-transparent cursor-pointer", 
          isPickingMode ? "hover:bg-amber-50 text-slate-800" : "text-slate-400 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-300"
        )} 
        title={isPickingMode && selectedEmp?.isSource ? "選択中の職員をここに配置します" : "ここへ配置する職員を選択します"}
      >
        {isPickingMode && selectedEmp?.isSource ? "+ ここに配置" : "+ 職員を選択"}
      </div>
      <div className="w-[40px] border-l border-slate-300 flex items-center justify-center shrink-0 bg-slate-50/50 z-20">
        <CommentButton targetId={anchorId} tooltipPos="left" />
      </div>
    </div>
  );
};

const DepartmentBlock = ({ dept, onMoveUp, onMoveDown }) => {
  const { deptMap, filterLevel, collapsedDepts, toggleDept, openModal, mutations, handleCellClick } = useApp();
  const isCollapsed = !!collapsedDepts[dept.id]; 
  const dm = deptMap[dept.id];
  
  const deptCurrEmps = [...dm.direct.current];
  const deptNextEmps = [...dm.direct.next];
  
  Object.values(dm.posts).forEach(p => { 
    deptCurrEmps.push(...p.current); 
    deptNextEmps.push(...p.next); 
  });
  
  Object.values(dm.groups).forEach(g => {
    deptCurrEmps.push(...g.direct.current); 
    deptNextEmps.push(...g.direct.next);
    Object.values(g.posts).forEach(gp => { 
      deptCurrEmps.push(...gp.current); 
      deptNextEmps.push(...gp.next); 
    });
  });
  
  const cCounts = getCounts(deptCurrEmps, false);
  const nCounts = getCounts(deptNextEmps, true);

  return (
    <div className="border-b-4 border-slate-400 relative">
      {!isCollapsed && <div className="absolute inset-y-0 left-[140px] w-[calc(100%-140px-40px)] bg-slate-100/30 pointer-events-none z-[5]" />}
      
      <div className="bg-slate-700 text-white px-2 py-1.5 flex justify-between items-center sticky top-0 z-10 group/dept">
        <div className="flex items-center gap-2">
          <div 
            className="cursor-pointer hover:bg-slate-600 rounded p-0.5" 
            onClick={() => toggleDept(dept.id)} 
            title={isCollapsed ? "展開する" : "折りたたむ"}
          >
            <ChevronDown className="w-4 h-4 text-slate-300" />
          </div>
          <Building2 className="w-4 h-4 text-sky-300" />
          <span 
            className="font-bold text-sm cursor-pointer select-none" 
            onClick={() => toggleDept(dept.id)} 
            title={isCollapsed ? "展開する" : "折りたたむ"}
          >
            {dept.name} 
            {dept.nextName && <span className="text-[10px] text-slate-300 font-normal">（来年: {dept.nextName}）</span>}
          </span>
          <span className="text-[10px] bg-slate-600 px-2 py-0.5 rounded text-slate-200 ml-2 shadow-inner pointer-events-none">
            今年度: {formatCountText(cCounts)} / 来年度: {formatCountText(nCounts)}
          </span>
          
          {(onMoveUp || onMoveDown) && (
            <div className="opacity-0 group-hover/dept:opacity-100 flex gap-0.5 ml-2">
              <button 
                onClick={onMoveUp} 
                className={cx("p-0.5 rounded text-slate-300", onMoveUp ? "hover:bg-slate-600 hover:text-white" : "invisible")} 
                title={onMoveUp ? "部署を上に移動" : ""}
              >
                <ArrowUp className="w-4 h-4"/>
              </button>
              <button 
                onClick={onMoveDown} 
                className={cx("p-0.5 rounded text-slate-300", onMoveDown ? "hover:bg-slate-600 hover:text-white" : "invisible")} 
                title={onMoveDown ? "部署を下に移動" : ""}
              >
                <ArrowDown className="w-4 h-4"/>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-1 items-center">
          <div className="opacity-0 group-hover/dept:opacity-100 flex gap-1 items-center">
            <button 
              onClick={() => openModal('post', { deptId: dept.id })} 
              className="px-1.5 py-0.5 bg-slate-600 rounded text-[10px]" 
              title="この部署にポストを追加"
            >
              <UserPlus className="w-3 h-3 inline mr-1"/>ポスト
            </button>
            <button 
              onClick={() => openModal('group', { deptId: dept.id })} 
              className="px-1.5 py-0.5 bg-slate-600 rounded text-[10px]" 
              title="この部署に班を追加"
            >
              <Plus className="w-3 h-3 inline mr-1"/>班
            </button>
            <button 
              onClick={() => openModal('dept', dept)} 
              className="p-1 hover:bg-slate-600 rounded" 
              title="部署名を編集"
            >
              <Edit2 className="w-3 h-3"/>
            </button>
            <button 
              onClick={() => openModal('delConfirm', { type: 'dept', id: dept.id, title: dept.name })} 
              className="p-1 hover:bg-rose-500/50 text-rose-300 rounded" 
              title="部署を削除"
            >
              <Trash2 className="w-3 h-3"/>
            </button>
          </div>
          <div className="w-[32px] flex justify-center border-l border-slate-600 pl-1 ml-1">
            <CommentButton targetId={`dept-${dept.id}`} theme="dark" tooltipPos="left" hoverClass="group-hover/dept:opacity-100" />
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <React.Fragment>
          {/* ポスト一覧 */}
          {dept.posts.map((post, pIdx) => {
            const currentArr = dm.posts[post.id].current;
            const nextArr = dm.posts[post.id].next;
            const isCurrConflict = currentArr.length > 1;
            const isNextConflict = nextArr.length > 1;
            
            return getPairs(currentArr, nextArr).map(([curr, nxt, i]) => {
              if (filterLevel > 0) {
                const hasEmp = curr || nxt;
                const currLvl = curr ? getGradeLevel(curr.currentGrade) : 0;
                const nextLvl = nxt ? getGradeLevel(nxt.nextGrade) : 0;
                if (hasEmp && currLvl < filterLevel && nextLvl < filterLevel) return null;
              }
              
              return (
                <EmployeeRow 
                  key={`${post.id}-${i}`} 
                  rowAnchorId={`postRow-${dept.id}-${post.id}-${i}`} 
                  isFirst={i === 0} 
                  isPost={true} 
                  titleIcon={<Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />} 
                  titleText={post.nextName || post.name} 
                  onTitleEdit={() => openModal('post', { deptId: dept.id, post })} 
                  onTitleDelete={() => openModal('delConfirm', { type: 'post', deptId: dept.id, id: post.id, title: post.name })} 
                  onMoveUp={pIdx > 0 ? () => mutations.movePost(dept.id, post.id, 'up') : undefined} 
                  onMoveDown={pIdx < dept.posts.length - 1 ? () => mutations.movePost(dept.id, post.id, 'down') : undefined} 
                  currentEmp={curr} 
                  nextEmp={nxt} 
                  onCurrentClick={() => handleCellClick(curr?.id, true, dept.id, post.id, null, null)} 
                  onNextClick={() => handleCellClick(nxt?.id, false, dept.id, post.id, null, null)} 
                  currentMove={createMoveProps(curr, i, currentArr.length, true, mutations)} 
                  nextMove={createMoveProps(nxt, i, nextArr.length, false, mutations)} 
                  currConflict={isCurrConflict} 
                  nextConflict={isNextConflict} 
                />
              );
            });
          })}
          
          {/* グループ一覧 */}
          {dept.groups.map((grp, gIdx) => {
            const groupData = dm.groups[grp.id];
            const grpCurrEmps = [...groupData.direct.current];
            const grpNextEmps = [...groupData.direct.next];
            
            Object.values(groupData.posts).forEach(gp => { 
              grpCurrEmps.push(...gp.current); 
              grpNextEmps.push(...gp.next); 
            });
            
            const gCCounts = getCounts(grpCurrEmps, false);
            const gNCounts = getCounts(grpNextEmps, true);
            
            return (
              <React.Fragment key={grp.id}>
                <div className="flex border-b border-slate-400 bg-slate-200 group/grp relative z-10">
                  <div className="w-full px-2 py-1 text-[11px] font-bold text-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-1.5" title={grp.nextName || grp.name}>
                      <Layers className="w-3.5 h-3.5 text-slate-600 ml-2" />
                      {grp.nextName || grp.name}
                      <span className="text-[9px] bg-slate-300/80 px-1.5 py-0.5 rounded text-slate-700 ml-1 font-normal select-none pointer-events-none border border-slate-300">
                        今年度: {formatCountText(gCCounts)} / 来年度: {formatCountText(gNCounts)}
                      </span>
                      
                      {(gIdx > 0 || gIdx < dept.groups.length - 1) && (
                        <div className="opacity-0 group-hover/grp:opacity-100 flex gap-0.5 ml-2">
                          <button 
                            onClick={gIdx > 0 ? () => mutations.moveGroup(dept.id, grp.id, 'up') : undefined} 
                            className={cx("p-0.5 rounded text-slate-500", gIdx > 0 ? "hover:bg-slate-300" : "invisible")} 
                            title={gIdx > 0 ? "班を上に移動" : ""}
                          >
                            <ArrowUp className="w-3.5 h-3.5"/>
                          </button>
                          <button 
                            onClick={gIdx < dept.groups.length - 1 ? () => mutations.moveGroup(dept.id, grp.id, 'down') : undefined} 
                            className={cx("p-0.5 rounded text-slate-500", gIdx < dept.groups.length - 1 ? "hover:bg-slate-300" : "invisible")} 
                            title={gIdx < dept.groups.length - 1 ? "班を下に移動" : ""}
                          >
                            <ArrowDown className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 items-center">
                      <div className="opacity-0 group-hover/grp:opacity-100 flex gap-1 items-center">
                        <button 
                          onClick={() => openModal('groupPost', { deptId: dept.id, groupId: grp.id })} 
                          className="px-1 bg-white rounded text-[10px] border border-slate-300" 
                          title="この班にポストを追加"
                        >
                          班内ポスト
                        </button>
                        <button 
                          onClick={() => openModal('group', { deptId: dept.id, group: grp })} 
                          className="p-0.5 hover:bg-slate-300" 
                          title="班名を編集"
                        >
                          <Edit2 className="w-3 h-3"/>
                        </button>
                        <button 
                          onClick={() => openModal('delConfirm', { type: 'group', deptId: dept.id, id: grp.id, title: grp.name })} 
                          className="p-0.5 hover:bg-rose-200" 
                          title="班を削除"
                        >
                          <Trash2 className="w-3 h-3"/>
                        </button>
                      </div>
                      <div className="w-[32px] flex justify-center border-l border-slate-300 pl-1 ml-1">
                        <CommentButton targetId={`groupHeader-${dept.id}-${grp.id}`} tooltipPos="left" hoverClass="group-hover/grp:opacity-100" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 班内ポスト一覧 */}
                {grp.posts.map((gp, gpIdx) => {
                  const currentArr = dm.groups[grp.id].posts[gp.id].current;
                  const nextArr = dm.groups[grp.id].posts[gp.id].next;
                  const isCurrConflict = currentArr.length > 1;
                  const isNextConflict = nextArr.length > 1;
                  
                  return getPairs(currentArr, nextArr).map(([curr, nxt, i]) => {
                    if (filterLevel > 0) {
                      const hasEmp = curr || nxt;
                      const currLvl = curr ? getGradeLevel(curr.currentGrade) : 0;
                      const nextLvl = nxt ? getGradeLevel(nxt.nextGrade) : 0;
                      if (hasEmp && currLvl < filterLevel && nextLvl < filterLevel) return null;
                    }
                    
                    return (
                      <EmployeeRow 
                        key={`${gp.id}-${i}`} 
                        rowAnchorId={`groupPostRow-${dept.id}-${grp.id}-${gp.id}-${i}`} 
                        isFirst={i === 0} 
                        isIndent={true} 
                        isPost={true} 
                        titleIcon={<Award className="w-3 h-3 text-sky-600 shrink-0" />} 
                        titleText={gp.nextName || gp.name} 
                        onTitleEdit={() => openModal('groupPost', { deptId: dept.id, groupId: grp.id, post: gp })} 
                        onTitleDelete={() => openModal('delConfirm', { type: 'groupPost', deptId: dept.id, groupId: grp.id, id: gp.id, title: gp.name })} 
                        onMoveUp={gpIdx > 0 ? () => mutations.moveGroupPost(dept.id, grp.id, gp.id, 'up') : undefined} 
                        onMoveDown={gpIdx < grp.posts.length - 1 ? () => mutations.moveGroupPost(dept.id, grp.id, gp.id, 'down') : undefined} 
                        currentEmp={curr} 
                        nextEmp={nxt} 
                        onCurrentClick={() => handleCellClick(curr?.id, true, dept.id, null, grp.id, gp.id)} 
                        onNextClick={() => handleCellClick(nxt?.id, false, dept.id, null, grp.id, gp.id)} 
                        currentMove={createMoveProps(curr, i, currentArr.length, true, mutations)} 
                        nextMove={createMoveProps(nxt, i, nextArr.length, false, mutations)} 
                        currConflict={isCurrConflict} 
                        nextConflict={isNextConflict} 
                      />
                    );
                  });
                })}
                
                {/* 班員（一般） */}
                {getPairs(
                  filterDirects(dm.groups[grp.id].direct.current, filterLevel, false), 
                  filterDirects(dm.groups[grp.id].direct.next, filterLevel, true)
                ).map(([curr, nxt, i]) => { 
                  if (!curr && !nxt) return null; 
                  return (
                    <EmployeeRow 
                      key={`direct-${grp.id}-${i}`} 
                      rowAnchorId={`directRow-${dept.id}-${grp.id}-${i}`} 
                      isFirst={i === 0} 
                      isIndent={true} 
                      titleText="班員" 
                      currentEmp={curr} 
                      nextEmp={nxt} 
                      onCurrentClick={() => handleCellClick(curr?.id, true, dept.id, null, grp.id, null)} 
                      onNextClick={() => handleCellClick(nxt?.id, false, dept.id, null, grp.id, null)} 
                      currentMove={createMoveProps(curr, i, dm.groups[grp.id].direct.current.length, true, mutations)} 
                      nextMove={createMoveProps(nxt, i, dm.groups[grp.id].direct.next.length, false, mutations)} 
                    />
                  ); 
                })}
                <AddSlotRow 
                  label="追加枠" 
                  indentClass="ml-9" 
                  anchorId={`addSlot-${dept.id}-${grp.id}`} 
                  onClickNext={() => handleCellClick(null, false, dept.id, null, grp.id, null)} 
                />
              </React.Fragment>
            );
          })}
          
          {/* 課直属（一般） */}
          {getPairs(
            filterDirects(dm.direct.current, filterLevel, false), 
            filterDirects(dm.direct.next, filterLevel, true)
          ).map(([curr, nxt, i]) => { 
            if (!curr && !nxt) return null; 
            return (
              <EmployeeRow 
                key={`dept-direct-${dept.id}-${i}`} 
                rowAnchorId={`deptDirectRow-${dept.id}-${i}`} 
                isFirst={i === 0} 
                titleText="課直属(一般)" 
                currentEmp={curr} 
                nextEmp={nxt} 
                onCurrentClick={() => handleCellClick(curr?.id, true, dept.id, null, null, null)} 
                onNextClick={() => handleCellClick(nxt?.id, false, dept.id, null, null, null)} 
                currentMove={createMoveProps(curr, i, dm.direct.current.length, true, mutations)} 
                nextMove={createMoveProps(nxt, i, dm.direct.next.length, false, mutations)} 
              />
            ); 
          })}
          <AddSlotRow 
            label="直属追加枠" 
            indentClass="ml-4" 
            anchorId={`addSlot-${dept.id}-direct`} 
            onClickNext={() => handleCellClick(null, false, dept.id, null, null, null)} 
          />
        </React.Fragment>
      )}
    </div>
  );
};

const SidebarCard = ({ emp, isRetired, onClick }) => {
  const { selectedEmp, isPickingMode, hoveredEmpId, setHoveredEmpId, targetYear, openModal, mutations } = useApp();
  const isSelected = !!(selectedEmp && emp && selectedEmp.id === emp.id);
  
  const defaultBorder = isRetired ? "border-[3px] border-dotted border-slate-800" : "border-[3px] border-dashed border-orange-400";
  const defaultBg = isRetired ? "bg-slate-50" : "bg-orange-50/50";

  const currentAge = calculateAge(emp.birthDate, targetYear - 1);

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setHoveredEmpId(emp.id)} 
      onMouseLeave={() => setHoveredEmpId(null)} 
      className={cx(
        "rounded px-1.5 py-1 flex items-center justify-between relative group/side transition-all duration-200 cursor-pointer",
        isSelected ? cx(defaultBorder, "ring-2 ring-inset ring-[#0F828C] bg-[#0F828C]/10") : 
        isPickingMode && !isSelected ? "hover:ring-2 hover:ring-inset hover:ring-amber-500 bg-white border-[3px] border-solid border-slate-300" : 
        cx(defaultBorder, emp.id === hoveredEmpId ? "bg-yellow-200 z-20 shadow-md transform -translate-y-0.5" : defaultBg)
      )} 
      title={emp.name}
    >
      <div className="flex items-baseline gap-1.5 flex-1 min-w-0 pr-1">
        <span className={cx("font-bold text-[11.5px] truncate shrink-0 max-w-[75%]", isRetired ? "text-slate-900" : "text-[#320A6B]")} title={emp.name}>
          {emp.name}
        </span>
        <span className="text-[9px] text-slate-800 truncate flex-1 min-w-0" title={emp.currentTitle || '新採'}>
          {emp.currentTitle || '新採'}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0 z-20">
        {!isPickingMode && (
          <div className="opacity-0 group-hover/side:opacity-100 flex gap-0.5 bg-slate-400/80 p-0.5 rounded-lg shadow mr-1 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); openModal('emp', emp); }} 
              className="p-0.5 rounded text-white hover:bg-slate-500/70 transition-colors" 
              title="職員情報を編集"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            {isRetired && (
              <button 
                onClick={(e) => { e.stopPropagation(); mutations.unassignEmployee(emp.id, false); }} 
                className="p-0.5 rounded text-white hover:bg-rose-500/80 transition-colors" 
                title="未配置に戻す"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        <span className="text-[9.5px] text-slate-800 shrink-0 mr-1" title={currentAge !== '' ? `${currentAge}歳` : ''}>
          {currentAge !== '' ? `${currentAge}歳` : ''}
        </span>
        <div onClick={e => e.stopPropagation()}>
          <CommentButton targetId={`side-${emp.id}`} tooltipPos="left" hoverClass="group-hover/side:opacity-100" />
        </div>
      </div>
    </div>
  );
};

const AppSidebar = () => {
  const { nextMap, isPickingMode, handleCellClick } = useApp();
  return (
    <div className="w-full md:w-[220px] flex flex-col gap-2 shrink-0 h-full">
      <div 
        className={cx("bg-white rounded shadow-sm border border-slate-400 flex flex-col flex-1 border-t-4 border-amber-500 overflow-hidden transition-all", isPickingMode && "ring-2 ring-amber-400 ring-offset-1 cursor-pointer")}
        onClick={() => { if (isPickingMode) handleCellClick(null, false, 'unassigned', null, null, null); }}
        title={isPickingMode ? "選択中の職員を「未配置」にします" : ""}
      >
        <div className="bg-slate-100 p-2 border-b border-slate-400 font-bold text-xs flex justify-between items-center shrink-0 group/sideheader">
          <div className="flex items-center gap-1.5 text-slate-700">
            <AlertCircle className="w-4 h-4 text-amber-600" />未配置・保留
          </div>
          <CommentButton targetId="side-unassigned-header" tooltipPos="left" hoverClass="group-hover/sideheader:opacity-100" />
        </div>
        <div className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 border-b border-slate-300 shrink-0">来年度の未配置 ({nextMap.unassigned.length})</div>
        <div className={cx("flex-1 overflow-y-auto p-1 flex flex-col gap-0.5", isPickingMode ? "bg-amber-50/50" : "bg-slate-50")}>
           {nextMap.unassigned.map(emp => (
             <SidebarCard 
               key={emp.id} 
               emp={emp} 
               isRetired={false} 
               onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, false, 'unassigned', null, null, null); }} 
             />
           ))}
        </div>
      </div>
      
      <div 
        className={cx("bg-white rounded shadow-sm border border-slate-400 flex flex-col flex-1 border-t-4 border-rose-500 overflow-hidden transition-all", isPickingMode && "ring-2 ring-rose-400 ring-offset-1 cursor-pointer")}
        onClick={() => { if (isPickingMode) handleCellClick(null, false, 'retired', null, null, null); }}
        title={isPickingMode ? "選択中の職員を「退職・転出」にします" : ""}
      >
         <div className="bg-slate-100 p-2 border-b border-slate-400 font-bold text-xs flex justify-between items-center shrink-0 group/sideheader">
           <div className="flex items-center gap-1.5 text-slate-700">
             <UserMinus className="w-4 h-4 text-rose-600" />退職・転出
           </div>
           <CommentButton targetId="side-retired-header" tooltipPos="left" hoverClass="group-hover/sideheader:opacity-100" />
         </div>
        <div className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 border-b border-slate-300 shrink-0">来年度の退職 ({nextMap.retired.length})</div>
        <div className={cx("flex-1 overflow-y-auto p-1 flex flex-col gap-0.5", isPickingMode ? "bg-rose-50/50" : "bg-slate-50")}>
          {nextMap.retired.map(emp => (
            <SidebarCard 
              key={emp.id} 
              emp={emp} 
              isRetired={true} 
              onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, false, 'retired', null, null, null); }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const NoteEditModal = ({ isOpen, onClose, onSave, data }) => {
  const [text, setText] = useState('');
  useEffect(() => { if (isOpen) setText(data?.text || ''); }, [isOpen, data]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[300] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200 border-t-4 border-sky-500">
        <div className="flex items-center gap-2 mb-3 text-sky-600">
          <MessageSquareText className="w-5 h-5" />
          <h3 className="text-base font-bold">コメントを編集</h3>
        </div>
        <textarea 
          value={text} 
          onChange={e => setText(e.target.value)} 
          className="w-full border border-slate-300 rounded p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 min-h-[120px] resize-y" 
          placeholder="コメントを入力..."
          autoFocus
        />
        <div className="mt-4 flex justify-between items-center">
          {data?.text ? (
            <button 
              onClick={() => { onSave(''); onClose(); }} 
              className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1" 
              title="コメントを削除する"
            >
              <Trash2 className="w-3.5 h-3.5"/>削除
            </button>
          ) : <div></div>}
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-1.5 border rounded text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors" 
              title="変更を破棄して閉じる"
            >
              キャンセル
            </button>
            <button 
              onClick={() => { onSave(text); onClose(); }} 
              className="px-5 py-1.5 bg-sky-500 text-white rounded text-sm font-bold hover:bg-sky-600 transition-colors shadow" 
              title="コメントを保存する"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeSelectModal = ({ isOpen, onClose, onSelect, targetPlacement, employees, departments }) => {
  const { targetYear } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('unassigned');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setFilterType('unassigned');
    }
  }, [isOpen]);

  if (!isOpen || !targetPlacement) return null;

  const placementName = getPlacementName(
    targetPlacement.dId, 
    targetPlacement.pId, 
    targetPlacement.gId, 
    targetPlacement.gpId, 
    departments
  );

  const filteredEmployees = employees.filter(emp => {
    if (filterType === 'unassigned') {
      if (emp.departmentId !== 'unassigned') return false;
    }
    if (searchQuery) {
      if (!emp.name.includes(searchQuery)) return false;
    }
    return true;
  });

  const getCurrInfo = (emp) => {
    const d = departments.find(x => x.id === emp.currentDeptId);
    if (!d) return '未配置・退職など';
    return `${d.name} ${emp.currentTitle || ''}`.trim();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-200 shrink-0">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-[#320A6B]">
              <UserPlus className="w-6 h-6" />
              <h2 className="text-lg font-bold">配置する職員を選択</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors" title="閉じる">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="inline-flex items-center bg-cyan-50 text-cyan-800 px-3 py-1.5 rounded text-sm font-bold border border-cyan-100">
            配置先: {placementName}
          </div>
        </div>
        
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex gap-3 items-center shrink-0">
          <input 
            type="text" 
            placeholder="名前で検索..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border border-[#0F828C] rounded shadow-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0F828C]/30 text-sm"
          />
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="border border-slate-300 rounded shadow-sm px-3 py-1.5 outline-none bg-white font-bold text-sm text-slate-700"
          >
            <option value="unassigned">未配置のみ表示</option>
            <option value="all">全職員を表示</option>
          </select>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <div className="flex items-center px-4 py-1.5 gap-2 bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-600 shrink-0">
            <div className="w-44">今年度（現行）の配置・職名</div>
            <div className="flex-1">氏名</div>
            <div className="w-16 text-center">級</div>
            <div className="w-10 text-right">年齢</div>
            <div className="w-16 text-right">現年数</div>
            <div className="w-16 text-center">来年度状態</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="text-center text-slate-400 py-10 font-bold">該当する職員がいません</div>
            ) : (
              <div className="flex flex-col">
                {filteredEmployees.map(emp => {
                  const isUnassigned = emp.departmentId === 'unassigned';
                  const ys = emp.currentYears;
                  const sk = (emp.currentSkills || []).join('、');
                  const yd = sk ? `${ys}年(${sk})` : `${ys}年`;
                  const age = calculateAge(emp.birthDate, targetYear - 1);
                  
                  return (
                    <div 
                      key={emp.id} 
                      onClick={() => { onSelect(emp.id, targetPlacement); onClose(); }}
                      className="flex items-center px-4 py-2 gap-2 border-b border-slate-100 hover:bg-amber-50 cursor-pointer transition-colors group"
                      title={`${emp.name} をこの枠に配置する`}
                    >
                      <div className="w-44 truncate text-[11px] text-slate-700 group-hover:text-amber-800 transition-colors" title={getCurrInfo(emp)}>
                        {getCurrInfo(emp)}
                      </div>
                      <div className="flex-1 truncate text-[13px] font-bold text-[#065084]" title={emp.name}>
                        {emp.name}
                      </div>
                      <div className="w-16 truncate text-[11px] text-slate-800 text-center">
                        {emp.currentGrade}
                      </div>
                      <div className="w-10 text-[11px] text-slate-800 text-right">
                        {age !== '' ? `${age}歳` : ''}
                      </div>
                      <div className={cx("w-16 text-[11px] text-right font-medium truncate shrink-0", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "text-slate-800")} title={yd}>
                        {yd}
                      </div>
                      <div className="w-16 text-center shrink-0">
                        {isUnassigned ? (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-300">未配置</span>
                        ) : (
                          <span className="text-[10px] text-slate-600">配置済</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FileSaveModal = ({ isOpen, onClose, onSave, defaultName, extension }) => {
  const [fileName, setFileName] = useState('');
  
  useEffect(() => { 
    if (isOpen) { 
      setFileName(defaultName || ''); 
    } 
  }, [isOpen, defaultName]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl border-t-4 border-[#0F828C]">
        <h3 className="text-lg font-bold text-[#320A6B] mb-4">保存ファイル名の設定</h3>
        <div className="space-y-4">
          <FormInput 
            label={`ファイル名 (${extension}は自動で付与されます)`} 
            value={fileName} 
            onChange={setFileName} 
            autoFocus 
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded text-sm font-medium" 
            title="キャンセルして閉じる"
          >
            キャンセル
          </button>
          <button 
            onClick={() => { 
              const finalName = fileName.endsWith(extension) ? fileName : `${fileName}${extension}`;
              onSave(finalName); 
              onClose(); 
            }} 
            disabled={!fileName.trim()} 
            className="px-4 py-2 bg-[#0F828C] text-white rounded text-sm font-bold" 
            title="ファイルとして保存する"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

const NameEditModal = ({ isOpen, onClose, onSave, title, data }) => {
  const [name, setName] = useState(''); 
  const [nextName, setNextName] = useState('');
  
  useEffect(() => { 
    if (isOpen) { 
      setName(data?.name || ''); 
      setNextName(data?.nextName || ''); 
    } 
  }, [isOpen, data]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl border-t-4 border-[#0F828C]">
        <h3 className="text-lg font-bold text-[#320A6B] mb-4">{title}</h3>
        <div className="space-y-4">
          <FormInput label="今年度の名称" value={name} onChange={setName} autoFocus />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              来年度の名称 <span className="text-xs text-slate-400">(変更がある場合)</span>
            </label>
            <input 
              type="text" 
              value={nextName} 
              onChange={e => setNextName(e.target.value)} 
              className="w-full border border-slate-300 rounded p-2 text-sm" 
              placeholder="同じなら空欄" 
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded text-sm font-medium" 
            title="キャンセルして閉じる"
          >
            キャンセル
          </button>
          <button 
            onClick={() => { onSave({ name, nextName }); onClose(); }} 
            disabled={!name.trim()} 
            className="px-4 py-2 bg-[#0F828C] text-white rounded text-sm font-bold" 
            title="変更を保存する"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, data }) => {
  if (!isOpen || !data) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border-t-4 border-rose-500">
        <div className="flex items-center gap-2 mb-4 text-rose-600">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold">削除の確認</h3>
        </div>
        <p className="text-slate-700 text-sm mb-6">
          「<span className="font-bold">{data.title}</span>」を削除しますか？<br/>
          {data.type !== 'emp' && <span className="text-xs text-rose-600">※配置職員は「未配置」に戻ります。</span>}
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded text-sm font-medium" 
            title="キャンセルして閉じる"
          >
            キャンセル
          </button>
          <button 
            onClick={() => { onConfirm(data); onClose(); }} 
            className="px-4 py-2 bg-rose-500 text-white rounded text-sm font-bold" 
            title="完全に削除する"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
};

const TitleChangeConfirmModal = ({ isOpen, onClose, onConfirm, data }) => {
  if (!isOpen || !data) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[300] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border-t-4 border-blue-500 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-4 text-blue-600">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold">職名の変更確認</h3>
        </div>
        <p className="text-slate-700 text-sm mb-6 leading-relaxed">
          <span className="font-bold text-[#320A6B]">{data.empName}</span> さんの職名を<br />
          「<span className="font-bold text-slate-500">{data.oldTitle || '(なし)'}</span>」から「<span className="font-bold text-blue-600">{data.newTitle}</span>」に変更しますか？
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded font-bold text-slate-600 hover:bg-slate-50 transition-colors" 
            title="職名はそのままで配置する"
          >
            いいえ
          </button>
          <button 
            onClick={() => { onConfirm(data.empId, data.newTitle); onClose(); }} 
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors shadow" 
            title="職名も変更して配置する"
          >
            はい（変更する）
          </button>
        </div>
      </div>
    </div>
  );
};

const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {
  const [localEmps, setLocalEmps] = useState([]); 
  const [localDepts, setLocalDepts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState(new Set()); 
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); 
  const [importData, setImportData] = useState(null); 
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => { 
    if (isOpen) {
      setLocalEmps(employees.map(e => ({ 
        ...e, 
        currentSkillsStr: (e.currentSkills || []).join('、'), 
        nextSkillsStr: (e.nextSkills || []).join('、') 
      })));
      setLocalDepts(JSON.parse(JSON.stringify(departments))); 
      setSortConfig({ key: null, direction: 'asc' }); 
      setSelectedIds(new Set()); 
      setDeletedIds(new Set()); 
      setConfirmDeleteOpen(false); 
      setImportData(null); 
      setAlertMessage('');
    }
  }, [isOpen, employees, departments]);

  const sortedEmps = useMemo(() => {
    let items = [...localEmps];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] || ''; 
        let bv = b[sortConfig.key] || '';
        if (sortConfig.key.includes('Years')) { 
          av = Number(av); 
          bv = Number(bv); 
        }
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [localEmps, sortConfig]);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = [
      "職員番号", "氏名", "生年月日", "最終学歴", "採用年月日", "特記事項", 
      "【今年度】部署名", "【今年度】ポスト・班名", "【今年度】班内ポスト名", "【今年度】職名", "【今年度】級", "【今年度】年数", "【今年度】詳細", "【今年度】備考", "【今年度】カウント除外",
      "【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外"
    ].join(',');
    const sampleRow = "000001,和歌山 太郎,S60.01.01,和歌山大学,H20.04.01,特になし,森林整備課,緑化推進班,班長,班長,補佐級II(班長),1,1,,技術職,森林整備課,緑化推進班,班長,班長,補佐級II(班長),2,1+1,,技術職";
    const content = "\uFEFF" + headers + "\n" + sampleRow + "\n";
    downloadFile(content, 'text/csv;charset=utf-8;', '職員一括編集_ひな型.csv');
  };

  const handleExportCSV = () => {
    const headers = [
      "職員番号", "氏名", "生年月日", "最終学歴", "採用年月日", "特記事項", 
      "【今年度】部署名", "【今年度】ポスト・班名", "【今年度】班内ポスト名", "【今年度】職名", "【今年度】級", "【今年度】年数", "【今年度】詳細", "【今年度】備考", "【今年度】カウント除外",
      "【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外"
    ];
    const dMap = new Map(localDepts.map(d => [d.id, d]));
    
    const rows = sortedEmps.map(emp => {
      let cDName = '', cPName = '', cGpName = '';
      const cDept = dMap.get(emp.currentDeptId);
      if (cDept) {
        cDName = cDept.name;
        if (emp.currentPostId) {
          const pst = (cDept.posts || []).find(p => p.id === emp.currentPostId);
          if (pst) cPName = pst.name;
        } else if (emp.currentGroupId) {
          const grp = (cDept.groups || []).find(g => g.id === emp.currentGroupId);
          if (grp) {
            cPName = grp.name;
            if (emp.currentGroupPostId) {
              const gpst = (grp.posts || []).find(p => p.id === emp.currentGroupPostId);
              if (gpst) cGpName = gpst.name;
            }
          }
        }
      }

      let nDName = '', nPName = '', nGpName = '';
      const nDept = dMap.get(emp.departmentId);
      if (nDept) {
        nDName = nDept.name;
        if (emp.postId) {
          const pst = (nDept.posts || []).find(p => p.id === emp.postId);
          if (pst) nPName = pst.name;
        } else if (emp.groupId) {
          const grp = (nDept.groups || []).find(g => g.id === emp.groupId);
          if (grp) {
            nPName = grp.name;
            if (emp.groupPostId) {
              const gpst = (grp.posts || []).find(p => p.id === emp.groupPostId);
              if (gpst) nGpName = gpst.name;
            }
          }
        }
      }
      
      const row = [
        emp.employeeNumber || '',
        emp.name || '',
        emp.birthDate || '',
        emp.education || '',
        emp.hireDate || '',
        emp.note || '',
        cDName,
        cPName,
        cGpName,
        emp.currentTitle || '',
        emp.currentGrade || '',
        emp.currentYears || 0,
        emp.currentSkillsStr || '',
        emp.currentEmploymentType || '',
        emp.currentExclude || '',
        nDName,
        nPName,
        nGpName,
        emp.nextTitle || '',
        emp.nextGrade || '',
        emp.nextYears || 0,
        emp.nextSkillsStr || '',
        emp.nextEmploymentType || '',
        emp.nextExclude || ''
      ];
      return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });
    
    const content = "\uFEFF" + headers.join(',') + "\n" + rows.join("\n");
    downloadFile(content, 'text/csv;charset=utf-8;', '職員一括編集_データ.csv');
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0]; 
    if (!file) return; 
    const target = e.target;
    
    try {
      const buffer = await file.arrayBuffer(); 
      let text = '';
      try { 
        text = new TextDecoder('utf-8', { fatal: true }).decode(buffer); 
      } catch { 
        text = new TextDecoder('shift_jis').decode(buffer); 
      }
      
      const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) { 
        setAlertMessage('データが空です。'); 
        return; 
      }
      
      const nDepts = [...localDepts]; 
      const dMap = new Map(nDepts.map(d => [d.name, d])); 
      const adds = []; 
      const updates = [];
      const existingEmpMap = new Map(localEmps.filter(e => e.employeeNumber).map(e => [e.employeeNumber, e]));
      const existingEmpNameMap = new Map(localEmps.map(e => [e.name, e]));
      const genId = (p) => `${p}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const parsePlacement = (dName, pName, gPName) => {
        let dId = 'unassigned', pId = null, gId = null, gpId = null;
        if (dName) {
          let dept = dMap.get(dName); 
          if (!dept) { 
            dept = { id: genId('dept'), name: dName, type: 'regular', posts: [], groups: [] }; 
            dMap.set(dName, dept); 
            nDepts.push(dept); 
          }
          dId = dept.id;
          if (pName) {
            const isG = gPName || /(班|Ｇ|G|グループ|室|部|試験地|センター|チーム|大学校)$/.test(pName);
            if (isG) {
              let grp = (dept.groups || []).find(g => g.name === pName); 
              if (!grp) { 
                grp = { id: genId('grp'), name: pName, posts: [] }; 
                dept.groups = dept.groups || []; 
                dept.groups.push(grp); 
              }
              gId = grp.id;
              if (gPName) { 
                let gp = (grp.posts || []).find(p => p.name === gPName); 
                if (!gp) { 
                  gp = { id: genId('gpost'), name: gPName }; 
                  grp.posts = grp.posts || []; 
                  grp.posts.push(gp); 
                } 
                gpId = gp.id; 
              }
            } else {
              let pst = (dept.posts || []).find(p => p.name === pName); 
              if (!pst) { 
                pst = { id: genId('post'), name: pName }; 
                dept.posts = dept.posts || []; 
                dept.posts.push(pst); 
              } 
              pId = pst.id;
            }
          }
        }
        return { dId, pId, gId, gpId };
      };

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVRow(lines[i]); 
        if (cols.length < 13) continue;
        
        const [empNum, empName, bStr, edu, hStr, note, cDName, cPName, cGPName, cTitle, cGrade, cYsStr, cSkStr, cNote, cExclude] = cols;
        if (!empName) continue;
        
        const currP = parsePlacement(cDName, cPName, cGPName);
        let nextP = { dId: 'unassigned', pId: null, gId: null, gpId: null };
        let nTitle = cTitle, nGrade = cGrade, nYsStr = '1', nSkStr = '', nNote = '', nExclude = '';
        
        if (cols.length >= 24) {
          const [,,,,,,,,,,,,,,, nDName, nPName, nGPName, nxTitle, nxGrade, nxYsStr, nxSkStr, nxNote, nxExclude] = cols;
          nTitle = nxTitle || ''; 
          nGrade = nxGrade || ''; 
          nYsStr = nxYsStr || '1'; 
          nSkStr = nxSkStr || ''; 
          nNote = nxNote || ''; 
          nExclude = nxExclude || '';
          nextP = parsePlacement(nDName, nPName, nGPName);
        }

        let targetEmp = existingEmpMap.get(empNum);
        if (!targetEmp) targetEmp = existingEmpNameMap.get(empName);

        const newEmpData = {
          employeeNumber: empNum || '', 
          name: empName, 
          birthDate: parseJapaneseDate(bStr), 
          education: edu || '', 
          hireDate: parseJapaneseDate(hStr), 
          note: note || '', 
          currentDeptId: currP.dId, 
          currentPostId: currP.pId, 
          currentGroupId: currP.gId, 
          currentGroupPostId: currP.gpId, 
          currentTitle: cTitle || '', 
          currentGrade: cGrade || '', 
          currentYears: parseInt(cYsStr, 10) || 0, 
          currentSkillsStr: cSkStr || '', 
          currentEmploymentType: cNote || '', 
          currentExclude: cExclude || '', 
          departmentId: nextP.dId, 
          postId: nextP.pId, 
          groupId: nextP.gId, 
          groupPostId: nextP.gpId, 
          nextTitle: nTitle, 
          nextGrade: nGrade, 
          nextYears: parseInt(nYsStr, 10) || 1, 
          nextSkillsStr: nSkStr, 
          nextEmploymentType: nNote, 
          nextExclude: nExclude, 
        };

        if (targetEmp) {
          updates.push({ ...targetEmp, ...newEmpData });
        } else {
          adds.push({ 
            ...newEmpData,
            id: genId('new-emp'), 
            orderCurrent: Date.now()+i, 
            orderNext: Date.now()+i, 
            isNew: true 
          });
        }
      }
      
      if (adds.length > 0 || updates.length > 0) {
        setImportData({ additions: adds, updates: updates, depts: nDepts }); 
      } else {
        setAlertMessage('読み込める職員が見つかりません。');
      }
    } catch(err) { 
      setAlertMessage('読み込みエラー: ' + err.message); 
    } finally { 
      target.value = ''; 
    }
  };

  const handleSave = () => {
    const ps = (s) => (s || '').split(',').reduce((a, x) => a.concat(x.split('、')), []).map(x => x.trim()).filter(Boolean);
    const updates = []; 
    const additions = [];
    
    localEmps.forEach(e => {
      const copy = { 
        ...e, 
        currentYears: Number(e.currentYears), 
        nextYears: Number(e.nextYears), 
        currentSkills: ps(e.currentSkillsStr), 
        nextSkills: ps(e.nextSkillsStr) 
      };
      delete copy.currentSkillsStr; 
      delete copy.nextSkillsStr;
      
      if (copy.isNew) { 
        delete copy.isNew; 
        copy.id = copy.id.replace('new-', 'emp-'); 
        additions.push(copy); 
      } else {
        updates.push(copy);
      }
    });
    
    onSave(updates, Array.from(deletedIds), additions, localDepts);
  };

  const inputCls = "w-full h-full border-none bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-[#0F828C] px-2 py-1.5 text-[11px] placeholder:text-slate-400";
  
  const Th = ({ label, sortKey, className }) => (
    <th 
      onClick={() => { 
        let dir = 'asc'; 
        if (sortConfig.key === sortKey && sortConfig.direction === 'asc') dir = 'desc'; 
        setSortConfig({ key: sortKey, direction: dir }); 
      }} 
      className={cx(className, "cursor-pointer hover:brightness-95 transition-all select-none group/th relative")} 
      title={`「${label}」で並び替える`}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className={cx("text-[10px]", sortConfig.key === sortKey ? "opacity-100 text-[#0F828C]" : "opacity-0 group-hover/th:opacity-30")}>
          {sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '▲'}
        </span>
      </div>
    </th>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-4 max-w-[98vw] w-full shadow-xl border-t-4 border-[#0F828C] max-h-[98vh] flex flex-col relative overflow-hidden">
        
        {/* エラーメッセージ */}
        {alertMessage && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-[300] backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-rose-500 max-w-sm w-full">
              <div className="flex items-center gap-2 mb-4 text-rose-600">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-bold text-lg">エラー</h4>
              </div>
              <p className="text-sm mb-6">{alertMessage}</p>
              <div className="flex justify-end">
                <button onClick={() => setAlertMessage('')} className="px-4 py-2 bg-slate-200 rounded font-bold" title="閉じる">閉じる</button>
              </div>
            </div>
          </div>
        )}
        
        {/* CSVインポート確認 */}
        {importData && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-[300] backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-[#0F828C] max-w-sm w-full">
              <div className="flex items-center gap-2 mb-4 text-[#0F828C]">
                <FolderOpen className="w-6 h-6" />
                <h4 className="font-bold text-lg">CSV読込確認</h4>
              </div>
              <p className="text-sm mb-6 leading-relaxed">
                {importData.updates.length > 0 && <span>既存の職員 <strong>{importData.updates.length}</strong> 名を更新します。<br/></span>}
                {importData.additions.length > 0 && <span>新しい職員 <strong>{importData.additions.length}</strong> 名を追加します。<br/></span>}
                よろしいですか？
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setImportData(null)} className="px-4 py-2 border rounded font-bold" title="キャンセルして閉じる">キャンセル</button>
                <button 
                  onClick={() => { 
                    setLocalDepts(importData.depts); 
                    setLocalEmps(prev => {
                      const updMap = new Map(importData.updates.map(u => [u.id, u]));
                      const next = prev.map(e => updMap.has(e.id) ? updMap.get(e.id) : e);
                      return [...importData.additions, ...next];
                    });
                    setImportData(null); 
                  }} 
                  className="px-4 py-2 bg-[#0F828C] text-white rounded font-bold" 
                  title="読み込んだデータを反映する"
                >
                  反映する
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 削除確認 */}
        {confirmDeleteOpen && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-[300] backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-rose-500 max-w-sm w-full">
              <div className="flex items-center gap-2 mb-4 text-rose-600">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-bold text-lg">削除の確認</h4>
              </div>
              <p className="text-sm mb-6">
                選択した {selectedIds.size} 名を削除しますか？<br/>
                <span className="text-xs text-slate-500">（保存するまで確定しません）</span>
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDeleteOpen(false)} className="px-4 py-2 border rounded font-bold" title="キャンセルして閉じる">キャンセル</button>
                <button 
                  onClick={() => { 
                    setDeletedIds(prev => new Set([...prev, ...selectedIds])); 
                    setLocalEmps(prev => prev.filter(e => !selectedIds.has(e.id))); 
                    setSelectedIds(new Set()); 
                    setConfirmDeleteOpen(false); 
                  }} 
                  className="px-4 py-2 bg-rose-500 text-white rounded font-bold" 
                  title="選択した職員を完全に削除する"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ヘッダーツールバー */}
        <div className="flex justify-between items-center mb-3 border-b pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-[#0F828C]" />
            <h3 className="text-base font-bold">職員一括編集</h3>
            <button 
              onClick={() => { 
                setLocalEmps(prev => [{ 
                  id: `new-emp-${Date.now()}`, 
                  employeeNumber: '', name: '', birthDate: '', education: '', hireDate: '', note: '', 
                  currentDeptId: 'unassigned', currentPostId: null, currentGroupId: null, currentGroupPostId: null, 
                  currentTitle: '', currentGrade: '', currentYears: 0, currentSkillsStr: '', currentEmploymentType: '', currentExclude: '', 
                  departmentId: 'unassigned', postId: null, groupId: null, groupPostId: null, 
                  nextTitle: '', nextGrade: '', nextYears: 1, nextSkillsStr: '', nextEmploymentType: '', nextExclude: '', 
                  orderCurrent: Date.now(), orderNext: Date.now(), isNew: true 
                }, ...prev]); 
              }} 
              className="ml-4 px-3 py-1 bg-sky-100 text-sky-700 rounded text-xs font-bold" 
              title="一覧の一番上に新しい職員の行を追加します"
            >
              職員追加
            </button>
            <label className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold cursor-pointer" title="CSVファイルから職員データをまとめて追加します">
              CSV読込<input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
            <button 
              onClick={handleExportCSV} 
              className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold flex items-center gap-1 border border-indigo-200 hover:bg-indigo-200 transition-colors" 
              title="現在の編集内容をCSV形式で保存します"
            >
              <DownloadCloud className="w-3.5 h-3.5" />CSV保存
            </button>
            <button 
              onClick={handleDownloadTemplate} 
              className="ml-2 px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold flex items-center gap-1 border border-slate-300 hover:bg-slate-200 transition-colors" 
              title="インポート用のCSVひな型をダウンロードします"
            >
              <DownloadCloud className="w-3.5 h-3.5" />ひな型DL
            </button>
            {selectedIds.size > 0 && (
              <button 
                onClick={() => setConfirmDeleteOpen(true)} 
                className="ml-2 px-3 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold transition-colors" 
                title="チェックを入れた職員を一覧から削除します"
              >
                選択削除
              </button>
            )}
          </div>
          <button onClick={onClose} title="閉じる"><X className="w-4 h-4" /></button>
        </div>
        
        {/* テーブルエリア */}
        <div className="overflow-auto flex-1 border border-slate-300 rounded shadow-inner">
          <table className="w-full text-[11px] whitespace-nowrap min-w-max border-collapse">
            <thead className="bg-slate-100 sticky top-0 z-20">
              <tr>
                <th className="px-2 py-1 border-b border-slate-300 bg-slate-200 sticky left-0 z-40 w-8 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"></th>
                <th className="px-2 py-1 border-b border-r-2 border-slate-300 bg-slate-200 sticky left-8 z-30 min-w-[8rem] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)] text-center text-slate-800">氏名</th>
                <th colSpan="5" className="px-2 py-1 border-b border-r text-center bg-slate-200 text-slate-700">基本情報</th>
                <th colSpan="7" className="px-2 py-1 border-b border-r text-center bg-slate-100 text-slate-700">今年度</th>
                <th colSpan="7" className="px-2 py-1 border-b text-center bg-blue-100/50 text-[#065084]">来年度</th>
              </tr>
              <tr>
                <th className="px-2 py-1 border-b border-slate-300 bg-slate-200 sticky left-0 z-40 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" title="すべて選択/解除">
                  <input 
                    type="checkbox" 
                    checked={sortedEmps.length > 0 && selectedIds.size === sortedEmps.length} 
                    onChange={(e) => { 
                      if (e.target.checked) setSelectedIds(new Set(sortedEmps.map(emp => emp.id))); 
                      else setSelectedIds(new Set()); 
                    }} 
                    className="cursor-pointer" 
                  />
                </th>
                <Th label="氏名" sortKey="name" className="px-2 py-1 border-b border-r-2 border-slate-300 bg-slate-200 sticky left-8 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)] text-left" />
                <Th label="職員番号" sortKey="employeeNumber" className="border-r" />
                <Th label="生年月日" sortKey="birthDate" className="border-r" />
                <Th label="最終学歴" sortKey="education" className="border-r" />
                <Th label="採用年月日" sortKey="hireDate" className="border-r" />
                <Th label="特記事項" sortKey="note" className="border-r" />
                <Th label="配置先" sortKey="currentDeptId" className="bg-slate-100 border-r" />
                <Th label="職名" sortKey="currentTitle" className="bg-slate-100 border-r" />
                <Th label="級" sortKey="currentGrade" className="bg-slate-100 border-r" />
                <Th label="年数" sortKey="currentYears" className="bg-slate-100 border-r" />
                <Th label="詳細" sortKey="currentSkillsStr" className="bg-slate-100 border-r" />
                <Th label="備考" sortKey="currentEmploymentType" className="bg-slate-100 border-r" />
                <Th label="カウント除外" sortKey="currentExclude" className="bg-slate-100 border-r" />
                <Th label="配置先" sortKey="departmentId" className="bg-blue-50/50 border-r" />
                <Th label="職名" sortKey="nextTitle" className="bg-blue-50/50 border-r" />
                <Th label="級" sortKey="nextGrade" className="bg-blue-50/50 border-r" />
                <Th label="年数" sortKey="nextYears" className="bg-blue-50/50 border-r" />
                <Th label="詳細" sortKey="nextSkillsStr" className="bg-blue-50/50 border-r" />
                <Th label="備考" sortKey="nextEmploymentType" className="bg-blue-50/50 border-r" />
                <Th label="カウント除外" sortKey="nextExclude" className="bg-blue-50/50" />
              </tr>
            </thead>
            <tbody>
              {sortedEmps.map(emp => {
                const isS = selectedIds.has(emp.id);
                const handleChange = (id, key, val) => setLocalEmps(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));
                
                return (
                  <tr key={emp.id} className={cx("border-b h-8 transition-colors group", isS ? "bg-emerald-50" : emp.isNew ? "bg-sky-50" : "bg-white hover:bg-slate-50")}>
                    <td className={cx("sticky left-0 z-20 text-center border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]", isS ? "bg-emerald-50" : emp.isNew ? "bg-sky-50" : "bg-white group-hover:bg-slate-50")} title="選択する">
                      <input 
                        type="checkbox" 
                        checked={isS} 
                        onChange={(e) => { 
                          const n = new Set(selectedIds); 
                          if (e.target.checked) n.add(emp.id); 
                          else n.delete(emp.id); 
                          setSelectedIds(n); 
                        }} 
                        className="cursor-pointer" 
                      />
                    </td>
                    <td className={cx("sticky left-8 z-10 border-r-2 border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)]", isS ? "bg-emerald-50" : emp.isNew ? "bg-sky-50" : "bg-white group-hover:bg-slate-50")}>
                      <input type="text" value={emp.name||''} onChange={e => handleChange(emp.id,'name',e.target.value)} className={cx(inputCls, "font-bold text-slate-800")} />
                    </td>
                    <td><input type="text" value={emp.employeeNumber||''} onChange={e => handleChange(emp.id,'employeeNumber',e.target.value)} className={inputCls} /></td>
                    <td><input type="date" value={emp.birthDate||''} onChange={e => handleChange(emp.id,'birthDate',e.target.value)} className={inputCls} /></td>
                    <td><input type="text" value={emp.education||''} onChange={e => handleChange(emp.id,'education',e.target.value)} className={inputCls} /></td>
                    <td><input type="date" value={emp.hireDate||''} onChange={e => handleChange(emp.id,'hireDate',e.target.value)} className={inputCls} /></td>
                    <td className="border-r"><input type="text" value={emp.note||''} onChange={e => handleChange(emp.id,'note',e.target.value)} className={inputCls} /></td>
                    <td className="bg-slate-50/30 p-1">
                      <PlacementSelector 
                        className="h-[26px] gap-1" 
                        deptId={emp.currentDeptId} postId={emp.currentPostId} groupId={emp.currentGroupId} groupPostId={emp.currentGroupPostId} 
                        departments={localDepts} isNext={false} 
                        onChange={v => setLocalEmps(prev => prev.map(e => e.id === emp.id ? { ...e, currentDeptId: v.deptId, currentPostId: v.postId, currentGroupId: v.groupId, currentGroupPostId: v.groupPostId } : e))} 
                      />
                    </td>
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentTitle||''} onChange={e => handleChange(emp.id,'currentTitle',e.target.value)} className={inputCls} /></td>
                    <td className="bg-slate-50/30">
                      <select value={emp.currentGrade||''} onChange={e => handleChange(emp.id,'currentGrade',e.target.value)} className={inputCls}>
                        {GRADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="bg-slate-50/30"><input type="number" value={emp.currentYears||0} onChange={e => handleChange(emp.id,'currentYears',e.target.value)} className={inputCls} /></td>
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentSkillsStr||''} onChange={e => handleChange(emp.id,'currentSkillsStr',e.target.value)} placeholder="派1+治1、1+1など" className={inputCls} /></td>
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentEmploymentType||''} onChange={e => handleChange(emp.id,'currentEmploymentType',e.target.value)} placeholder="育代No.1：横山など" className={inputCls} /></td>
                    <td className="bg-slate-50/30 border-r"><input type="text" list="exclude-list-bulk" value={emp.currentExclude||''} onChange={e => handleChange(emp.id,'currentExclude',e.target.value)} placeholder="事務職など" className={inputCls} /></td>
                    <td className="bg-blue-50/30 p-1">
                      <PlacementSelector 
                        className="h-[26px] gap-1" 
                        deptId={emp.departmentId} postId={emp.postId} groupId={emp.groupId} groupPostId={emp.groupPostId} 
                        departments={localDepts} isNext={true} 
                        onChange={v => setLocalEmps(prev => prev.map(e => e.id === emp.id ? { ...e, departmentId: v.deptId, postId: v.postId, groupId: v.groupId, groupPostId: v.groupPostId } : e))} 
                      />
                    </td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextTitle||''} onChange={e => handleChange(emp.id,'nextTitle',e.target.value)} className={inputCls} /></td>
                    <td className="bg-blue-50/30">
                      <select value={emp.nextGrade||''} onChange={e => handleChange(emp.id,'nextGrade',e.target.value)} className={inputCls}>
                        {GRADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="bg-blue-50/30"><input type="number" value={emp.nextYears||0} onChange={e => handleChange(emp.id,'nextYears',e.target.value)} className={inputCls} /></td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextSkillsStr||''} onChange={e => handleChange(emp.id,'nextSkillsStr',e.target.value)} placeholder="派1+治1、1+1など" className={inputCls} /></td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextEmploymentType||''} onChange={e => handleChange(emp.id,'nextEmploymentType',e.target.value)} placeholder="育代No.1：横山など" className={inputCls} /></td>
                    <td className="bg-blue-50/30"><input type="text" list="exclude-list-bulk" value={emp.nextExclude||''} onChange={e => handleChange(emp.id,'nextExclude',e.target.value)} placeholder="事務職など" className={inputCls} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <datalist id="exclude-list-bulk">
            {["事務職", "技術職", "短時間"].map(o => <option key={o} value={o} />)}
          </datalist>
        </div>
        
        {/* フッター */}
        <div className="mt-3 pt-3 border-t flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-500">
            全 {localEmps.length} 名
            {deletedIds.size > 0 && <span className="ml-3 text-rose-500 font-bold">（うち {deletedIds.size} 名削除予定）</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 border rounded text-sm" title="変更を破棄して閉じる">キャンセル</button>
            <button onClick={handleSave} className="px-5 py-1.5 bg-[#0F828C] text-white rounded text-sm font-bold" title="すべての変更を保存して閉じる">一括保存</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

const EmployeeFormSection = ({ title, isCurrent, disabled, fd, setFd, departments, editCurrent, setEditCurrent }) => {
  const p = isCurrent ? 'current' : 'next'; 
  const pd = isCurrent ? 'currentDeptId' : 'departmentId'; 
  const pp = isCurrent ? 'currentPostId' : 'postId'; 
  const pg = isCurrent ? 'currentGroupId' : 'groupId'; 
  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';

  return (
    <div className={cx("p-3 rounded border flex flex-col", isCurrent ? "bg-slate-50 border-slate-200" : "bg-blue-50/50 border-blue-200")}>
      <div className="flex justify-between items-center mb-2 border-b pb-1">
        <h4 className={cx("font-bold text-sm", isCurrent ? "text-slate-700" : "text-[#065084]")}>{title}</h4>
        {isCurrent && setEditCurrent && (
          <label className="flex items-center gap-1 text-xs cursor-pointer" title="今年度のデータを直接編集する">
            <input type="checkbox" checked={editCurrent} onChange={(e) => setEditCurrent(e.target.checked)} className="cursor-pointer"/>
            <span className={editCurrent ? "text-slate-700 font-bold" : "text-slate-400"}>今年度を編集</span>
          </label>
        )}
      </div>
      <div className="relative flex-1">
        {isCurrent && disabled && <div className="absolute inset-0 z-10 bg-slate-50/50 cursor-not-allowed" />}
        <div className="space-y-2">
          <div>
            <label className="block text-xs mb-1">配置先</label>
            <PlacementSelector disabled={disabled} deptId={fd[pd]} postId={fd[pp]} groupId={fd[pg]} groupPostId={fd[pgp]} departments={departments} isNext={!isCurrent} onChange={v => setFd({...fd, [pd]: v.deptId, [pp]: v.postId, [pg]: v.groupId, [pgp]: v.groupPostId})} />
          </div>
          <div className="flex gap-2">
            <FormInput label="職名" disabled={disabled} value={fd[`${p}Title`]} onChange={v => setFd({...fd, [`${p}Title`]: v})} className="flex-1" />
            <FormSelect label="級" disabled={disabled} value={fd[`${p}Grade`]} onChange={v => setFd({...fd, [`${p}Grade`]: v})} options={GRADE_OPTIONS} className="w-[140px]" />
          </div>
          <div className="flex gap-2">
            <FormInput label="年数" type="number" disabled={disabled} value={fd[`${p}Years`]} onChange={v => setFd({...fd, [`${p}Years`]: v})} className="w-16" />
            <FormInput label="年数詳細" disabled={disabled} placeholder="派1+治1、1+1など" value={fd[`${p}SkillsStr`]} onChange={v => setFd({...fd, [`${p}SkillsStr`]: v})} className="flex-1" />
          </div>
          <div className="flex gap-2">
            <FormInput label="備考" disabled={disabled} placeholder="育代No.1：横山など" value={fd[`${p}EmploymentType`]} onChange={v => setFd({...fd, [`${p}EmploymentType`]: v})} className="flex-1" />
            <FormInputWithList label="カウント除外" disabled={disabled} placeholder="事務職など" value={fd[`${p}Exclude`]} onChange={v => setFd({...fd, [`${p}Exclude`]: v})} options={["事務職", "技術職", "短時間"]} listId={`exclude-list-${p}`} className="w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeModal = ({ isOpen, onClose, onSave, initialData, departments }) => {
  const def = { employeeNumber: '', name: '', birthDate: '', education: '', hireDate: '', note: '', currentDeptId: 'unassigned', currentPostId: null, currentGroupId: null, currentGroupPostId: null, currentTitle: '', currentGrade: '', currentYears: 0, currentSkillsStr: '', currentEmploymentType: '', currentExclude: '', departmentId: 'unassigned', postId: null, groupId: null, groupPostId: null, nextTitle: '', nextGrade: '', nextYears: 1, nextSkillsStr: '', nextEmploymentType: '', nextExclude: '' };
  const [fd, setFd] = useState(def); 
  const [editCurrent, setEditCurrent] = useState(false);
  
  useEffect(() => { 
    if (isOpen) { 
      setFd(initialData ? { 
        ...initialData, 
        currentSkillsStr: (initialData.currentSkills || []).join('、'), 
        nextSkillsStr: (initialData.nextSkills || []).join('、') 
      } : def); 
      setEditCurrent(!initialData); 
    } 
  }, [isOpen, initialData]);
  
  if (!isOpen) return null;

  const save = () => { 
    const ps = (s) => (s || '').split(',').reduce((a, x) => a.concat(x.split('、')), []).map(x => x.trim()).filter(Boolean); 
    const d = { 
      ...fd, 
      currentYears: Number(fd.currentYears), 
      nextYears: Number(fd.nextYears), 
      currentSkills: ps(fd.currentSkillsStr), 
      nextSkills: ps(fd.nextSkillsStr) 
    }; 
    delete d.currentSkillsStr; 
    delete d.nextSkillsStr; 
    onSave(d); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-5 max-w-2xl w-full shadow-xl border-t-4 border-[#065084] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold">{initialData ? '職員編集' : '職員追加'}</h3>
          <button onClick={onClose} title="閉じる"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-2">
          <div className="flex gap-3">
            <FormInput label="職員番号" value={fd.employeeNumber} onChange={v => setFd({...fd, employeeNumber: v})} className="w-24" />
            <FormInput label="氏名" value={fd.name} onChange={v => setFd({...fd, name: v})} className="flex-1" />
            <FormInput label="生年月日" type="date" value={fd.birthDate} onChange={v => setFd({...fd, birthDate: v})} className="w-32" />
          </div>
          <div className="flex gap-3">
            <FormInput label="最終学歴" value={fd.education} onChange={v => setFd({...fd, education: v})} className="w-1/3" />
            <FormInput label="採用年月日" type="date" value={fd.hireDate} onChange={v => setFd({...fd, hireDate: v})} className="w-32" />
            <FormInput label="特記事項(共通)" value={fd.note} onChange={v => setFd({...fd, note: v})} className="flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <EmployeeFormSection title="今年度（現行）" isCurrent={true} disabled={!editCurrent} fd={fd} setFd={setFd} departments={departments} editCurrent={editCurrent} setEditCurrent={setEditCurrent} />
            <EmployeeFormSection title="来年度（新）" isCurrent={false} disabled={false} fd={fd} setFd={setFd} departments={departments} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border rounded" title="変更を破棄して閉じる">キャンセル</button>
          <button onClick={save} className="px-6 py-2 bg-[#065084] text-white rounded font-bold" title="職員情報を保存する">保存</button>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { 
    zoom, departments, selectedEmp, employees, currentFileName, cancelSelection, setZoom, filterLevel, setFilterLevel, 
    undo, redo, canUndo, canRedo, handleRollOver, activePlanId, plans, openModal, mutations, modals, closeModal, 
    targetYear, setTargetYear, switchPlan, duplicatePlan, deletePlan, updatePlanName, expandAll, collapseAll, 
    exportToJSON, exportToHTML, loadJSON, handleCellClick, handleAssign 
  } = useApp();
  
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.json')) {
        loadJSON(file);
      }
    }
  }, [loadJSON]);

  const actZoom = zoom * 0.9; 
  const regDepts = departments.filter(d => d.type === 'regular'); 
  const selEmp = selectedEmp ? employees.find(e => e.id === selectedEmp.id) : null;
  
  const currentSummary = useMemo(() => generateGradeSummary(employees, false), [employees]);
  const nextSummary = useMemo(() => generateGradeSummary(employees, true), [employees]);

  useEffect(() => { 
    document.title = "新・人事異動案作成アプリ"; 
    document.documentElement.lang = "ja"; 
  }, []);

  const baseFileName = useMemo(() => { 
    const d = new Date(); 
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_R${targetYear - 2018}人事異動案_ver1`; 
  }, [targetYear]);

  return (
    <div 
      className="min-h-screen bg-slate-200 flex flex-col font-sans text-slate-800 selection-none relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {isDragging && (
        <div className="absolute inset-0 bg-sky-500/20 backdrop-blur-sm z-[999] flex items-center justify-center border-8 border-sky-500 border-dashed m-2 rounded-xl pointer-events-none transition-all">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-200">
            <DownloadCloud className="w-16 h-16 text-sky-500" />
            <h2 className="text-2xl font-bold text-sky-700">JSONファイルをドロップして読み込み</h2>
          </div>
        </div>
      )}

      {/* 画面上部ヘッダー（操作パネル） */}
      <header className="bg-slate-800 text-white shadow z-20 sticky top-0">
        <div className="flex justify-between items-center p-2 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-sky-400" />
            <div className="flex items-center bg-slate-700 rounded overflow-hidden">
              <button onClick={() => setTargetYear(y => y - 1)} className="p-1 hover:bg-slate-600" title="前年度へ"><ChevronDown className="w-4 h-4"/></button>
              <input type="number" value={targetYear} onChange={(e) => setTargetYear(Number(e.target.value))} className="w-12 bg-transparent text-center text-sm font-bold outline-none" title="対象年度" />
              <button onClick={() => setTargetYear(y => y + 1)} className="p-1 hover:bg-slate-600" title="次年度へ"><ChevronUp className="w-4 h-4"/></button>
            </div>
            <h1 className="text-base font-bold">年度(R{targetYear - 2018})人事異動案</h1>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center bg-slate-700 rounded overflow-hidden mr-1">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-slate-600" title="縮小"><ZoomOut className="w-4 h-4"/></button>
              <span className="text-xs font-bold w-10 text-center" title="現在の表示倍率">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 hover:bg-slate-600" title="拡大"><ZoomIn className="w-4 h-4"/></button>
            </div>
            
            <div className="flex items-center gap-1.5 ml-2 mr-2">
              <Filter className="w-4 h-4 text-sky-300" />
              <select 
                value={filterLevel} 
                onChange={e => setFilterLevel(Number(e.target.value))} 
                className={cx("text-xs py-1.5 px-2 rounded outline-none font-bold cursor-pointer transition-colors", filterLevel > 0 ? "bg-sky-500 text-white shadow-inner" : "bg-slate-700 text-slate-200")}
                title="表示する職員の条件を切り替える"
              >
                <option value={0}>全件表示</option>
                {GRADE_OPTIONS.filter(g => g !== "").map(g => (
                  <option key={g} value={GRADE_LEVELS[g]}>{g}以上</option>
                ))}
              </select>
            </div>

            <div className="flex gap-0.5">
              <button onClick={expandAll} className="p-1.5 bg-slate-700 rounded" title="すべての部署を展開する"><ChevronsDown className="w-4 h-4"/></button>
              <button onClick={collapseAll} className="p-1.5 bg-slate-700 rounded" title="すべての部署を折りたたむ"><ChevronsUp className="w-4 h-4"/></button>
            </div>
            <div className="flex gap-0.5">
              <button onClick={undo} disabled={!canUndo} className="p-1.5 bg-slate-700 disabled:opacity-50 rounded" title="直前の操作を取り消す(元に戻す)"><Undo className="w-4 h-4"/></button>
              <button onClick={redo} disabled={!canRedo} className="p-1.5 bg-slate-700 disabled:opacity-50 rounded" title="取り消した操作をやり直す"><Redo className="w-4 h-4"/></button>
            </div>
            <button onClick={() => openModal('saveFile', { type: 'html', defaultName: currentFileName ? currentFileName.replace('.json', '') : baseFileName })} className="bg-indigo-600 px-3 py-1.5 rounded text-xs font-bold" title="現在の表をHTMLファイルとして保存する">表HTML</button>
            <button onClick={() => openModal('saveFile', { type: 'json', defaultName: currentFileName ? currentFileName.replace('.json', '') : baseFileName })} className="bg-slate-700 px-3 py-1.5 rounded text-xs font-bold" title="現在のデータをJSONファイルとして保存する">保存</button>
            <label className="bg-emerald-700 px-3 py-1.5 rounded text-xs font-bold cursor-pointer" title="保存したJSONファイルを読み込む"><FolderOpen className="w-4 h-4 inline mr-1"/><input type="file" accept=".json" onChange={loadJSON} className="hidden" /></label>
          </div>
        </div>
        <div className="flex justify-between items-center bg-slate-900 px-2 pt-2">
          <div className="flex gap-1 overflow-x-auto items-center">
            {plans.map(p => (
              <div key={p.id} onClick={() => switchPlan(p.id)} className={cx("group relative flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-bold cursor-pointer transition-colors max-w-[200px]", p.id === activePlanId ? "bg-slate-200 text-slate-900 shadow z-10" : "bg-slate-700 text-slate-300")} title="この案を表示する">
                <span className="truncate flex-1" title={p.name}>{p.name}</span>
                {p.id === activePlanId && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); openModal('planName', p.name); }} title="案の名前を変更する"><Edit2 className="w-3 h-3" /></button>
                    {plans.length > 1 && <button onClick={(e) => { e.stopPropagation(); deletePlan(p.id); }} title="この案を削除する"><X className="w-3 h-3" /></button>}
                  </div>
                )}
              </div>
            ))}
            <button onClick={duplicatePlan} className="flex items-center gap-1 px-4 py-2 text-sky-400 text-sm font-bold" title="現在の案を複製して別案を作成する"><Copy className="w-4 h-4" /> 複製</button>
            {currentFileName && <div className="flex items-center ml-2 px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[11px] border border-slate-700 select-none"><FileText className="w-3 h-3 mr-1" />{currentFileName}</div>}
          </div>
          <div className="flex gap-2 pb-1.5">
            <button onClick={() => openModal('dept')} className="bg-blue-700 px-3 py-1 rounded text-xs font-bold" title="新しい部署を追加する">部署+</button>
            <button onClick={() => openModal('emp')} className="bg-blue-700 px-3 py-1 rounded text-xs font-bold" title="新しい職員を追加する">職員+</button>
            <button onClick={() => openModal('bulkEdit')} className="bg-emerald-700 px-3 py-1 rounded text-xs font-bold" title="職員データの一括編集やCSVファイルの読み込みを行う">職員一括編集</button>
            <button onClick={() => openModal('rollOver')} className="bg-orange-600 px-3 py-1 rounded text-xs font-bold ml-2" title="来年度の配置を今年度に確定し、新しい年度へ移行する">次年度移行</button>
          </div>
        </div>
      </header>

      {/* メイン画面（表エリア） */}
      <main className="flex-1 p-2 overflow-hidden flex" style={{ transform: `scale(${actZoom})`, transformOrigin: 'top left', width: `${100/actZoom}%`, height: `${100/actZoom}%` }}>
        <div className="flex flex-col md:flex-row gap-2 w-full h-full">
          <div className="flex-1 w-full bg-white rounded shadow-sm border border-slate-400 flex flex-col h-full overflow-hidden">
            <div className="flex bg-slate-100 border-b-2 border-slate-400 font-bold text-xs sticky top-0 z-20 shrink-0">
              <div className="w-[140px] p-2 border-r flex items-center justify-center text-slate-600">配置先</div>
              <div className="flex-1 p-2 text-center border-r bg-slate-200/50 flex flex-col justify-center">
                <div>今年度（現行）</div>
                <div className="text-[10px] font-normal text-slate-900 mt-0.5">{currentSummary}</div>
              </div>
              <div className="flex-1 p-2 text-[#065084] text-center bg-blue-100/50 flex flex-col justify-center">
                <div>来年度（新組織）</div>
                <div className="text-[10px] font-normal text-blue-950 mt-0.5">{nextSummary}</div>
              </div>
              <div className="w-[40px] border-l border-slate-300 flex items-center justify-center bg-slate-200 text-[10px] text-slate-600">メモ</div>
            </div>
            <div className="overflow-y-auto flex-1 pb-20">
              {regDepts.map((d, i) => (
                <DepartmentBlock 
                  key={d.id} dept={d} 
                  onMoveUp={i > 0 ? () => mutations.moveDepartment(d.id, 'up') : undefined} 
                  onMoveDown={i < regDepts.length - 1 ? () => mutations.moveDepartment(d.id, 'down') : undefined} 
                />
              ))}
            </div>
          </div>
          <AppSidebar />
        </div>
      </main>
      
      {/* 職員をつかんでいる時のフローティングバー */}
      {selectedEmp && selEmp && (() => {
        const ys = selEmp.currentYears;
        const sk = (selEmp.currentSkills || []).join('、');
        const yd = sk ? `${ys}年(${sk})` : `${ys}年`;
        const noteText = selEmp.currentEmploymentType;
        const dispTitle = selEmp.currentTitle || '新採';
        const dispGrade = selEmp.currentGrade;
        const dispAge = calculateAge(selEmp.birthDate, targetYear - 1);
        
        return (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0F828C] text-white px-6 py-4 rounded-xl shadow-2xl z-[150] flex flex-col gap-3 border-2 border-white min-w-[480px]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-200" />
                <span className="font-bold text-sm text-slate-50">配置先の枠をクリックしてください</span>
              </div>
              <button 
                onClick={cancelSelection} 
                className="bg-white text-[#0F828C] hover:bg-slate-100 px-4 py-1.5 rounded-full text-xs font-bold transition-colors shadow" 
                title="職員の選択をキャンセルする"
              >
                キャンセル
              </button>
            </div>
            <div className="bg-white text-slate-900 rounded px-3 py-2 flex items-center gap-3 shadow-inner">
              <div className="w-14 truncate text-[11px] text-slate-800" title={dispTitle}>{dispTitle}</div>
              <div className="flex-1 truncate text-sm font-bold text-[#065084]" title={selEmp.name}>{selEmp.name}</div>
              <div className="w-16 truncate text-[11px] text-slate-800 text-center" title={dispGrade}>{dispGrade}</div>
              <div className="w-8 text-[11px] text-slate-800 text-right" title={`${dispAge}歳`}>{dispAge !== '' ? `${dispAge}歳` : ''}</div>
              <div className={cx("w-14 text-[11px] text-right font-medium truncate shrink-0", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "text-slate-800")} title={yd}>{yd}</div>
              <div className="w-16 truncate text-[10px] text-slate-700 text-left shrink-0 ml-1" title={noteText}>{noteText}</div>
            </div>
          </div>
        );
      })()}

      {/* モーダル群の配置 */}
      <NoteEditModal isOpen={modals.note.isOpen} onClose={() => closeModal('note')} onSave={text => mutations.setNote(modals.note.data?.targetId, text)} data={modals.note.data} />
      <EmployeeSelectModal isOpen={modals.empSelect.isOpen} onClose={() => closeModal('empSelect')} onSelect={(empId, placement) => handleAssign(empId, placement)} targetPlacement={modals.empSelect.data} employees={employees} departments={departments} />
      <TitleChangeConfirmModal isOpen={modals.titleChangeConfirm.isOpen} onClose={() => closeModal('titleChangeConfirm')} onConfirm={(empId, newTitle) => mutations.updateEmployee(empId, { nextTitle: newTitle })} data={modals.titleChangeConfirm.data} />
      <EmployeeModal isOpen={modals.emp.isOpen} initialData={modals.emp.data} departments={departments} onClose={() => closeModal('emp')} onSave={modals.emp.data ? d => mutations.updateEmployee(modals.emp.data.id, d) : mutations.addEmployee} />
      <BulkEditModal isOpen={modals.bulkEdit.isOpen} onClose={() => closeModal('bulkEdit')} employees={employees} departments={departments} onSave={(u, d, a, ud) => { if (ud) mutations.updateAllDepartments(ud); mutations.bulkProcessEmployees(u, d, a); closeModal('bulkEdit'); }} />
      <NameEditModal isOpen={modals.dept.isOpen} title="部署編集" data={modals.dept.data} onClose={() => closeModal('dept')} onSave={d => modals.dept.data ? mutations.updateDepartment(modals.dept.data.id, d) : mutations.addDepartment(d)} />
      <NameEditModal isOpen={modals.post.isOpen} title="ポスト編集" data={modals.post.data?.post} onClose={() => closeModal('post')} onSave={d => modals.post.data?.post ? mutations.updatePost(modals.post.data.deptId, modals.post.data.post.id, d) : mutations.addPost(modals.post.data.deptId, d)} />
      <NameEditModal isOpen={modals.group.isOpen} title="班編集" data={modals.group.data?.group} onClose={() => closeModal('group')} onSave={d => modals.group.data?.group ? mutations.updateGroup(modals.group.data.deptId, modals.group.data.group.id, d) : mutations.addGroup(modals.group.data.deptId, d)} />
      <NameEditModal isOpen={modals.groupPost.isOpen} title="班内ポスト編集" data={modals.groupPost.data?.post} onClose={() => closeModal('groupPost')} onSave={d => modals.groupPost.data?.post ? mutations.updateGroupPost(modals.groupPost.data.deptId, modals.groupPost.data.groupId, modals.groupPost.data.post.id, d) : mutations.addGroupPost(modals.groupPost.data.deptId, modals.groupPost.data.groupId, d)} />
      <NameEditModal isOpen={modals.planName.isOpen} title="名前変更" data={{ name: modals.planName.data }} onClose={() => closeModal('planName')} onSave={d => updatePlanName(activePlanId, d.name)} />
      <DeleteConfirmModal isOpen={modals.delConfirm.isOpen} data={modals.delConfirm.data} onClose={() => closeModal('delConfirm')} onConfirm={d => { if (d.type === 'dept') mutations.deleteDepartment(d.id); else if (d.type === 'post') mutations.deletePost(d.deptId, d.id); else if (d.type === 'group') mutations.deleteGroup(d.deptId, d.id); else if (d.type === 'groupPost') mutations.deleteGroupPost(d.deptId, d.groupId, d.id); else if (d.type === 'emp') mutations.deleteEmployee(d.id); }} />
      <FileSaveModal isOpen={modals.saveFile.isOpen} defaultName={modals.saveFile.data?.defaultName} extension={modals.saveFile.data?.type === 'json' ? '.json' : '.html'} onClose={() => closeModal('saveFile')} onSave={(fileName) => { if (modals.saveFile.data.type === 'json') exportToJSON(fileName); else if (modals.saveFile.data.type === 'html') exportToHTML(fileName); }} />
      
      {modals.rollOver.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-t-4 border-orange-500">
            <h3 className="text-lg font-bold mb-4">移行確認</h3>
            <p className="text-sm mb-4">来年度案を今年度として確定し、新年度へ移行します。</p>
            <div className="flex gap-3">
              <button 
                onClick={() => closeModal('rollOver')} 
                className="flex-1 bg-slate-200 py-2 rounded font-bold" 
                title="移行を中止して閉じる"
              >
                中止
              </button>
              <button 
                onClick={() => { handleRollOver(); closeModal('rollOver'); }} 
                className="flex-1 bg-orange-500 text-white py-2 rounded font-bold" 
                title="来年度の構成を今年度に確定する"
              >
                実行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() { 
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}