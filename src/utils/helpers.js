import { GRADE_LEVELS } from '../constants/config.js';
export const cx = (...classes) => classes.filter(Boolean).join(' ');
export const getGradeLevel = (grade) => GRADE_LEVELS[grade] || 1;

export const isPromotedGrade = (currGrade, nextGrade) => {
  const nextLvl = getGradeLevel(nextGrade);
  const currLvl = getGradeLevel(currGrade);
  return nextLvl > currLvl && nextLvl > 0;
};

export const getPromotedBgClass = (grade) => {
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

export const getPromotedBgColorCode = (grade) => {
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

export const calculateAge = (birthDate, targetYear) => { 
  if (!birthDate || isNaN(targetYear)) return ''; 
  const date = new Date(birthDate); 
  let age = targetYear - date.getFullYear(); 
  if (date.getMonth() + 1 > 4 || (date.getMonth() + 1 === 4 && date.getDate() > 1)) {
    age--; 
  }
  return age; 
};

export const parseJapaneseDate = (str) => {
  if (!str) return '';
  str = String(str).trim();

  // Try standard YYYY-MM-DD or YYYY/MM/DD or YYYY年MM月DD日
  const adMatch = str.match(/^(\d{4})[-\/\.年](\d{1,2})[-\/\.月](\d{1,2})日?$/);
  if (adMatch) {
    const [, y, m, d] = adMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // Try Japanese Era matching: e.g. S60.1.1, S60/01/01, S60-1-1, 昭和60年1月1日
  const eraMatch = str.match(/^(M|T|S|H|R|明治|大正|昭和|平成|令和)(\d+|元)[-\/\.年](\d{1,2})[-\/\.月](\d{1,2})日?$/i);
  if (eraMatch) {
    let [, era, yearStr, monthStr, dayStr] = eraMatch;
    let year = yearStr === '元' ? 1 : parseInt(yearStr, 10);
    
    if (era === '明治' || era.toUpperCase() === 'M') year += 1867;
    else if (era === '大正' || era.toUpperCase() === 'T') year += 1911;
    else if (era === '昭和' || era.toUpperCase() === 'S') year += 1925;
    else if (era === '平成' || era.toUpperCase() === 'H') year += 1988;
    else if (era === '令和' || era.toUpperCase() === 'R') year += 2018;
    
    return `${year}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
  }

  // Try standard Date parsing as fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str;
};

export const parseCSVRow = (str) => {
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

export const getPairs = (curr = [], next = []) => {
  const length = Math.max(curr.length, next.length, 1);
  return Array.from({ length }).map((_, i) => [curr[i], next[i], i]);
};

export const getCounts = (emps, isNext) => {
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

export const formatCountText = ({ main, other }) => {
  return other > 0 ? `${main}人（その他${other}人）` : `${main}人`;
};

export const generateGradeSummary = (emps, isNext) => {
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

export const filterDirects = (list, filterLevel, isNext) => {
  if (filterLevel === 0) return list;
  return list.filter(emp => {
    const grade = isNext ? emp.nextGrade : emp.currentGrade;
    return getGradeLevel(grade) >= filterLevel;
  });
};

export const calcNextSkills = (skills, years, isSameSlot, isSameDepartment) => { 
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

export const calcOrder = (array, index, position, key) => { 
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

export const clearPlacement = (emp, targetId, type) => { 
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

export const createMoveProps = (emp, index, length, isSource, mutations) => ({
  onMoveUp: emp && index > 0 ? () => mutations.moveEmployee(emp.id, isSource, 'up') : undefined,
  onMoveDown: emp && index < length - 1 ? () => mutations.moveEmployee(emp.id, isSource, 'down') : undefined
});

export const downloadFile = (content, mimeType, filename) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a'); 
  link.href = URL.createObjectURL(blob); 
  link.download = filename; 
  link.click();
};

export const traverseOrgTree = (departments, deptMap, currMap, nextMap, filterLevel, callback) => {
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

export const getPlacementName = (deptId, postId, groupId, groupPostId, depts) => {
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
