// Utilities for parsing chain transfers (玉突き異動)
export const calculateAge = (birthDateString, targetDateString) => {
  if (!birthDateString) return null;
  let normalizedStr = birthDateString.toString().trim();
  if (normalizedStr.length === 8 && !normalizedStr.includes('-') && !normalizedStr.includes('/')) {
    normalizedStr = `${normalizedStr.substring(0, 4)}-${normalizedStr.substring(4, 6)}-${normalizedStr.substring(6, 8)}`;
  } else {
    normalizedStr = normalizedStr.replace(/\//g, '-');
  }
  const birthDate = new Date(normalizedStr);
  if (isNaN(birthDate.getTime())) return null;
  
  const targetDate = new Date(targetDateString);
  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const m = targetDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) age--;
  return age;
};

export const chunkArray = (array, size) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size));
};

export const toReiwa = (year) => {
  return year - 2018; // 2019年=令和1年
};

const _createMaps = (departments) => {
  const deptMap = {}, groupMap = {};
  departments.forEach(d => {
    deptMap[d.id] = d.name;
    (d.groups || []).forEach(g => { groupMap[g.id] = g.name; });
  });
  return { deptMap, groupMap };
};

const _getPostId = (emp, isNext) => {
  const deptId = isNext ? emp.departmentId : emp.currentDeptId;
  const groupId = isNext ? emp.groupId : emp.currentGroupId;
  const postId = isNext ? emp.postId : emp.currentPostId;
  const groupPostId = isNext ? emp.groupPostId : emp.currentGroupPostId;
  const title = isNext ? emp.nextTitle : emp.currentTitle;

  if (deptId === 'unassigned') return `unassigned_${emp.id}`;
  if (deptId === 'retired') return `retired_${emp.id}`;
  if (postId || groupPostId) return `POST|${postId || ''}|${groupPostId || ''}`;
  return `TITLE|${deptId || ''}|${groupId || ''}|${title || ''}`;
};

const _getPostDetails = (deptId, groupId, title, maps) => {
  if (deptId === 'unassigned') return { type: 'unassigned', dept: '', group: '', title: '新規採用', label: '新規採用' };
  if (deptId === 'retired') return { type: 'retired', dept: '', group: '', title: '退職 / 転出', label: '退職 / 転出' };
  
  const dept = maps.deptMap[deptId] || '';
  const group = maps.groupMap[groupId] || '';
  const fullDept = [dept, group].filter(Boolean).join('');
  const postName = [fullDept, title].filter(Boolean).join(' ');
  
  return { type: 'regular', dept, group, fullDept, title: title || '', label: postName || '(役職なし)' };
};

const _getPromotedSuffix = (currentGrade, nextGrade) => {
  if (!nextGrade) return "";
  const levels = ['係長級', '補佐級', '課長級', '所属長級', '次長級', '部長級'];
  const currentVal = levels.findIndex(lvl => currentGrade?.includes(lvl)) + 1;
  const nextVal = levels.findIndex(lvl => nextGrade?.includes(lvl)) + 1;

  if (nextVal > currentVal && nextVal >= 2) {
    if (nextGrade.includes('次長級')) return '(次)';
    if (nextGrade.includes('所属長級')) return '(所)';
    if (nextGrade.includes('課長級')) return '(課)';
    if (nextGrade.includes('補佐級')) return '(補)';
  }
  return "";
};

const _createAllMoves = (employees, deptMap, groupMap, targetYear) => {
  const maps = { deptMap, groupMap };
  const thisYearDate = `${targetYear - 1}-04-01`;
  const nextYearDate = `${targetYear}-04-01`;

  return employees.map(emp => {
    const hasCurrentTitle = (emp.currentTitle || '').trim() !== '';
    const hasValidHistory = hasCurrentTitle && emp.currentDeptId !== 'unassigned';
    const suffix = hasValidHistory ? _getPromotedSuffix(emp.currentGrade, emp.nextGrade) : "";
    const isToShocho = hasValidHistory && (emp.currentGrade || '').includes('課長級') && (emp.nextGrade || '').includes('所属長級');

    const birthDateStr = emp.birthDate || emp.birthday || emp['生年月日'];
    emp.ageThisYear = calculateAge(birthDateStr, thisYearDate) ?? emp.age;
    emp.ageNextYear = calculateAge(birthDateStr, nextYearDate) ?? emp.age;

    return {
      emp,
      fromPostId: _getPostId(emp, false),
      toPostId: _getPostId(emp, true),
      fromPost: _getPostDetails(emp.currentDeptId, emp.currentGroupId, emp.currentTitle, maps),
      toPost: _getPostDetails(emp.departmentId, emp.groupId, emp.nextTitle, maps),
      isTitleChanged: hasCurrentTitle && emp.currentTitle !== emp.nextTitle, 
      isPromoted: suffix !== "", 
      promotedSuffix: suffix, 
      isPromotedToFukuShunin: hasValidHistory && emp.currentTitle !== '副主任' && emp.nextTitle === '副主任',
      isPromotedToShocho: isToShocho 
    };
  });
};

const _groupMoves = (moves) => {
  const movesByToPost = {};
  const movesByFromPost = {};
  moves.forEach(m => {
    (movesByToPost[m.toPostId] ??= []).push(m);
    (movesByFromPost[m.fromPostId] ??= []).push(m);
  });
  return { movesByToPost, movesByFromPost };
};

const _buildChains = (moves, movesByToPost, movesByFromPost) => {
  const visited = new Set();
  const chains = [];

  const startMoves = moves.filter(m => m.emp.departmentId === 'retired' || !(movesByFromPost[m.toPostId]?.length));

  const buildChain = (startMove) => {
    const chain = [];
    let curr = startMove;
    while (curr && !visited.has(curr)) {
      chain.push(curr);
      visited.add(curr);
      const unvisitedNext = (movesByToPost[curr.fromPostId] || []).filter(nm => !visited.has(nm));
      curr = unvisitedNext[0] || null;
    }
    return chain;
  };

  startMoves.forEach(sm => { if (!visited.has(sm)) chains.push(buildChain(sm)); });
  moves.forEach(m => { if (!visited.has(m)) chains.push(buildChain(m)); });

  return chains.sort((a, b) => b.length - a.length);
};

export const getReason = (chain, movesByFromPost) => {
  if (!chain?.length) return '';
  const first = chain[0];
  const last = chain[chain.length - 1];
  
  const isRetired = first.toPost.type === 'retired';
  const isNewPost = !isRetired && !(movesByFromPost[first.toPostId]?.length);
  const isNewHire = last.fromPost.type === 'unassigned';

  if (isRetired) return chain.length === 1 ? '退職廃止' : (isNewHire ? '退職新採' : '退職後任');
  if (isNewPost) return isNewHire ? '新設新採' : '新設';
  return isNewHire ? '新採' : '内部昇格/異動';
};

export const analyzeChainTransfers = (employees, departments, targetYear = 2027) => {
  const { deptMap, groupMap } = _createMaps(departments || []);
  
  const allEmpMoves = _createAllMoves(employees || [], deptMap, groupMap, targetYear);
  const moves = allEmpMoves.filter(m => m.fromPostId !== m.toPostId);
  const retentions = allEmpMoves.filter(m => m.fromPostId === m.toPostId && m.fromPost.type !== 'unassigned' && m.fromPost.type !== 'retired');

  const { movesByToPost, movesByFromPost } = _groupMoves(moves);
  const chains = _buildChains(moves, movesByToPost, movesByFromPost);

  return { chains, movesByToPost, movesByFromPost, moves, retentions };
};
