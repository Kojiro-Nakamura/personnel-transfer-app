import { GRADE_LEVELS, GRADE_TO_PROMO_KEY } from '../constants/config.js';
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

export const getPromotedBorderClass = (grade) => {
  switch (grade) {
    case "部長級": return "border-purple-400";
    case "次長級": return "border-red-400";
    case "所属長級": return "border-orange-400";
    case "課長級": return "border-yellow-400";
    case "補佐級III(補佐兼班長)": return "border-sky-400";
    case "補佐級II(班長)": return "border-emerald-400";
    case "補佐級I(主任)": return "border-pink-400";
    case "係長級(主査)": return "border-slate-400";
    case "一般": return "border-indigo-300";
    default: return "border-slate-300";
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
  // Remove any trailing text after a space (e.g. " R6 56歳")
  str = str.split(/[\s　]/)[0];
  // 全角英数字・記号を半角に変換
  str = str.replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

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

export const parsePromoDate = (str) => {
  if (!str) return '';
  str = String(str).trim();
  str = str.split(/[\s　]/)[0];
  // 全角英数字・記号を半角に変換
  str = str.replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  
  if (/^\d{4}$/.test(str) || /^\d{4}年$/.test(str)) {
    const y = parseInt(str, 10);
    return `${y}-04-01`;
  }
  const eraMatch = str.match(/^(M|T|S|H|R|明治|大正|昭和|平成|令和)(\d+|元)年?$/i);
  if (eraMatch) {
    let [, era, yearStr] = eraMatch;
    let year = yearStr === '元' ? 1 : parseInt(yearStr, 10);
    if (era === '明治' || era.toUpperCase() === 'M') year += 1867;
    else if (era === '大正' || era.toUpperCase() === 'T') year += 1911;
    else if (era === '昭和' || era.toUpperCase() === 'S') year += 1925;
    else if (era === '平成' || era.toUpperCase() === 'H') year += 1988;
    else if (era === '令和' || era.toUpperCase() === 'R') year += 2018;
    return `${year}-04-01`;
  }
  return parseJapaneseDate(str);
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

  let upperSubtotal = 0;
  const upperGrades = ["部長級", "次長級", "所属長級", "課長級"];
  upperGrades.forEach(g => {
    if (counts[g]) upperSubtotal += counts[g];
  });

  const summaryParts = [];
  const order = ["部長級", "次長級", "所属長級", "課長級", "補佐級III(補佐兼班長)", "補佐級II(班長)", "補佐級I(主任)", "係長級(主査)", "一般"];
  order.forEach(grade => {
    if (grade === "課長級") {
      if (counts[grade] || upperSubtotal > 0) {
        summaryParts.push(`${grade}${counts[grade] || 0}人（課長級以上小計${upperSubtotal}人）`);
      }
    } else {
      if (counts[grade]) summaryParts.push(`${grade}${counts[grade]}人`);
    }
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

export const getMaxGroupLevel = (group, gm) => {
  let maxLevel = 0;
  const checkCurrent = (emp) => {
    if (!emp) return;
    maxLevel = Math.max(maxLevel, emp.currentGrade ? getGradeLevel(emp.currentGrade) : 0);
  };
  const checkNext = (emp) => {
    if (!emp) return;
    maxLevel = Math.max(maxLevel, emp.nextGrade ? getGradeLevel(emp.nextGrade) : 0);
  };
  group.posts?.forEach(post => {
    const gpd = gm.posts[post.id];
    if (!gpd) return;
    gpd.current.forEach(checkCurrent);
    gpd.next.forEach(checkNext);
  });
  gm.direct?.current?.forEach(checkCurrent);
  gm.direct?.next?.forEach(checkNext);
  return maxLevel;
};

export const getMaxDeptLevel = (dept, dm) => {
  let maxLevel = 0;
  const checkCurrent = (emp) => {
    if (!emp) return;
    maxLevel = Math.max(maxLevel, emp.currentGrade ? getGradeLevel(emp.currentGrade) : 0);
  };
  const checkNext = (emp) => {
    if (!emp) return;
    maxLevel = Math.max(maxLevel, emp.nextGrade ? getGradeLevel(emp.nextGrade) : 0);
  };
  dept.posts?.forEach(post => {
    const pd = dm.posts[post.id];
    if (!pd) return;
    pd.current.forEach(checkCurrent);
    pd.next.forEach(checkNext);
  });
  dept.groups?.forEach(group => {
    const gm = dm.groups[group.id];
    maxLevel = Math.max(maxLevel, getMaxGroupLevel(group, gm));
  });
  dm.direct?.current?.forEach(checkCurrent);
  dm.direct?.next?.forEach(checkNext);
  return maxLevel;
};

export const isGroupVisible = (group, gm, filterLevel) => {
  if (filterLevel === 0) return true;
  let hasVisible = false;

  const checkCurrent = (emp) => {
    if (!emp) return;
    if ((emp.currentGrade ? getGradeLevel(emp.currentGrade) : 0) >= filterLevel) hasVisible = true;
  };
  const checkNext = (emp) => {
    if (!emp) return;
    if ((emp.nextGrade ? getGradeLevel(emp.nextGrade) : 0) >= filterLevel) hasVisible = true;
  };

  group.posts?.forEach(post => {
    const gpd = gm.posts[post.id];
    if (!gpd) return;
    gpd.current.forEach(checkCurrent);
    gpd.next.forEach(checkNext);
  });
  
  if (hasVisible) return true;

  gm.direct?.current?.forEach(checkCurrent);
  gm.direct?.next?.forEach(checkNext);

  return hasVisible;
};

export const isDeptVisible = (dept, dm, filterLevel) => {
  if (filterLevel === 0) return true;
  let hasVisible = false;

  const checkCurrent = (emp) => {
    if (!emp) return;
    if ((emp.currentGrade ? getGradeLevel(emp.currentGrade) : 0) >= filterLevel) hasVisible = true;
  };
  const checkNext = (emp) => {
    if (!emp) return;
    if ((emp.nextGrade ? getGradeLevel(emp.nextGrade) : 0) >= filterLevel) hasVisible = true;
  };

  dept.posts?.forEach(post => {
    const pd = dm.posts[post.id];
    if (!pd) return;
    pd.current.forEach(checkCurrent);
    pd.next.forEach(checkNext);
  });

  if (hasVisible) return true;

  dept.groups?.forEach(group => {
    const gm = dm.groups[group.id];
    if (isGroupVisible(group, gm, filterLevel)) {
      hasVisible = true;
    }
  });

  if (hasVisible) return true;

  dm.direct?.current?.forEach(checkCurrent);
  dm.direct?.next?.forEach(checkNext);

  return hasVisible;
};

export const traverseOrgTree = (departments, deptMap, currMap, nextMap, filterLevel, callback) => {
  departments.filter(dept => dept.type === 'regular').forEach(dept => {
    const dm = deptMap[dept.id];
    
    if (filterLevel > 0 && !isDeptVisible(dept, dm, filterLevel)) {
      return;
    }

    dept.posts.forEach(post => { 
      const pd = dm.posts[post.id]; 
      const maxRows = Math.max(pd.current.length, pd.next.length, 1);
      for (let i = 0; i < maxRows; i++) {
        callback(dept, null, post.name, pd.current[i], pd.next[i], 'post', i, post); 
      }
    });

    dept.groups.forEach(group => { 
      const gm = dm.groups[group.id]; 
      
      if (filterLevel > 0 && !isGroupVisible(group, gm, filterLevel)) {
        return;
      }

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

export const getEraFormattedYear = (year) => {
  if (year >= 2019) return `${year}(R${year - 2018})`;
  if (year >= 1989) return `${year}(H${year - 1988})`;
  if (year >= 1926) return `${year}(S${year - 1925})`;
  if (year >= 1912) return `${year}(T${year - 1911})`;
  return `${year}`;
};

export const extractYearFromHeader = (str) => {
  if (!str) return null;
  const adMatch = str.match(/(\d{4})/);
  if (adMatch) return parseInt(adMatch[1], 10);
  
  const eraMatch = str.match(/(M|T|S|H|R|明治|大正|昭和|平成|令和)(\d+|元)/i);
  if (eraMatch) {
    let [, era, yearStr] = eraMatch;
    let year = yearStr === '元' ? 1 : parseInt(yearStr, 10);
    
    if (era === '明治' || era.toUpperCase() === 'M') year += 1867;
    else if (era === '大正' || era.toUpperCase() === 'T') year += 1911;
    else if (era === '昭和' || era.toUpperCase() === 'S') year += 1925;
    else if (era === '平成' || era.toUpperCase() === 'H') year += 1988;
    else if (era === '令和' || era.toUpperCase() === 'R') year += 2018;
    return year;
  }
  
  return null;
};

export const getEraSuffix = (year) => {
  if (!year) return '';
  const y = parseInt(year, 10);
  if (isNaN(y)) return '';
  if (y >= 2019) return `R${y - 2018}`;
  if (y >= 1989) return `H${y - 1988}`;
  if (y >= 1926) return `S${y - 1925}`;
  if (y >= 1912) return `T${y - 1911}`;
  return '';
};

export const calculateServiceYears = (promoDateStr, targetYearOrDate) => {
  if (!promoDateStr || !targetYearOrDate) return '';
  const cleanPromoStr = String(promoDateStr).split(' ')[0];
  const promoDate = new Date(cleanPromoStr);
  if (isNaN(promoDate.getTime())) return '';
  
  let targetDate;
  if (typeof targetYearOrDate === 'string' && targetYearOrDate.includes('-')) {
    targetDate = new Date(targetYearOrDate);
  } else {
    targetDate = new Date(Number(targetYearOrDate), 3, 1);
  }
  
  if (isNaN(targetDate.getTime())) return '';

  const diffTime = targetDate - promoDate;
  if (diffTime < 0) return '1'; 
  
  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const yearsPassed = diffTime / msPerYear;
  
  const formatted = (yearsPassed + 1).toFixed(2);
  return parseFloat(formatted).toString();
};

export const getFiscalYear = (dateStr) => {
  if (!dateStr) return null;
  const parts = String(dateStr).split('-');
  if (parts.length < 2) {
    const y = parseInt(parts[0], 10);
    return isNaN(y) ? null : y;
  }
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(y) || isNaN(m)) return null;
  if (m <= 3) return y - 1;
  return y;
};

export const getEraSuffixForDate = (dateStr) => {
  const fYear = getFiscalYear(dateStr);
  return fYear ? getEraSuffix(fYear) : '';
};

export const formatPromoDateWithEra = (promoDateStr, targetYear) => {
  if (!promoDateStr) return '';
  let normalizedStr = String(promoDateStr).trim();
  if (/^\d{4}$/.test(normalizedStr) || /^\d{4}年度?$/.test(normalizedStr)) {
    normalizedStr = normalizedStr.replace(/\D/g, '') + '-04-01';
  }
  const date = new Date(normalizedStr);
  if (isNaN(date.getTime())) return normalizedStr;
  
  const y = date.getFullYear();
  const mStr = String(date.getMonth() + 1).padStart(2, '0');
  const dStr = String(date.getDate()).padStart(2, '0');
  
  const era = getEraSuffixForDate(normalizedStr);
  const dateStr = `${y}-${mStr}-${dStr}${era ? `(${era})` : ''}`;
  
  if (targetYear) {
    const serviceYears = calculateServiceYears(promoDateStr, targetYear);
    if (serviceYears) {
      return `${serviceYears}年目>${dateStr}`;
    }
  }
  return dateStr;
};

export const getEmpCurrentYears = (emp, targetYear, isNext = false) => {
  if (!emp) return '';
  const grade = isNext ? emp.nextGrade : emp.currentGrade;
  const pKey = GRADE_TO_PROMO_KEY[grade];
  let calculatedYears = '';
  if (pKey && emp[pKey]) {
    const sYears = calculateServiceYears(emp[pKey], targetYear);
    if (sYears) calculatedYears = sYears;
  }
  if (!calculatedYears) {
    calculatedYears = isNext ? (emp.nextYears || '') : (emp.currentYears || '');
  }
  return calculatedYears;
};
