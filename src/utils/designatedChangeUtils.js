import { buildDeptMap, isTempRemark } from './helpers.js';

export const DESIGNATED_GRADE_CATEGORIES = [
  '部長級',
  '次長級',
  '所属長級',
  '課長級',
  '班長級'
];

export const getDesignatedGradeCategory = (emp, isNext) => {
  if (!emp || emp.isArchived) return null;

  const deptId = isNext ? emp.departmentId : emp.currentDeptId;
  if (!deptId || deptId === 'unassigned' || deptId === 'retired') return null;

  const exclude = String((isNext ? emp.nextExclude : emp.currentExclude) || '').trim();
  if (exclude !== '') return null;

  const remark = String((isNext ? emp.nextEmploymentType : emp.currentEmploymentType) || '').trim();
  if (isTempRemark(remark)) return null;

  const g = String((isNext ? emp.nextGrade : emp.currentGrade) || '').trim();
  if (!g) return null;

  if (g.includes('部長級')) return '部長級';
  if (g.includes('次長級')) return '次長級';
  if (g.includes('所属長級')) return '所属長級';
  if (g.includes('課長級')) return '課長級';
  const isHosa1 = g.includes('補佐級I(') || g.includes('補佐級Ⅰ') || g.includes('主任');
  if ((g.includes('補佐級') && !isHosa1) || g.includes('班長級')) return '班長級';

  return null;
};

const pairSlotEmployees = (currList = [], nextList = [], preferTitleMatch = false) => {
  const usedCurr = new Set();
  const usedNext = new Set();
  const pairs = [];

  // 1. 同一人物（留任・同一枠内昇格等）を最優先でペアリング
  currList.forEach((c, ci) => {
    if (!c) return;
    const ni = nextList.findIndex((n, idx) => n && !usedNext.has(idx) && n.id === c.id);
    if (ni !== -1) {
      usedCurr.add(ci);
      usedNext.add(ni);
      pairs.push([c, nextList[ni]]);
    }
  });

  // 2. 直属枠など複数人が入る枠では職名＋指定職格付一致、次に指定職格付一致でペアリング
  if (preferTitleMatch) {
    currList.forEach((c, ci) => {
      if (!c || usedCurr.has(ci)) return;
      const cCat = getDesignatedGradeCategory(c, false);
      const cTitle = String(c.currentTitle || '').trim();
      const ni = nextList.findIndex((n, idx) => {
        if (!n || usedNext.has(idx)) return false;
        const nCat = getDesignatedGradeCategory(n, true);
        const nTitle = String(n.nextTitle || '').trim();
        return cTitle && cTitle === nTitle && cCat === nCat;
      });
      if (ni !== -1) {
        usedCurr.add(ci);
        usedNext.add(ni);
        pairs.push([c, nextList[ni]]);
      }
    });

    currList.forEach((c, ci) => {
      if (!c || usedCurr.has(ci)) return;
      const cTitle = String(c.currentTitle || '').trim();
      if (!cTitle) return;
      const ni = nextList.findIndex((n, idx) => {
        if (!n || usedNext.has(idx)) return false;
        return String(n.nextTitle || '').trim() === cTitle;
      });
      if (ni !== -1) {
        usedCurr.add(ci);
        usedNext.add(ni);
        pairs.push([c, nextList[ni]]);
      }
    });
  } else {
    // ポスト枠内で複数人いる場合、同じ指定職格付同士を先にペアリングして不要な格付変更を防ぐ
    currList.forEach((c, ci) => {
      if (!c || usedCurr.has(ci)) return;
      const cCat = getDesignatedGradeCategory(c, false);
      if (!cCat) return;
      const ni = nextList.findIndex((n, idx) => {
        if (!n || usedNext.has(idx)) return false;
        return getDesignatedGradeCategory(n, true) === cCat;
      });
      if (ni !== -1) {
        usedCurr.add(ci);
        usedNext.add(ni);
        pairs.push([c, nextList[ni]]);
      }
    });
  }

  // 3. ポスト枠の残りを順番にペアリング（後任への交代・格付変更・職種変更）
  if (!preferTitleMatch) {
    const remCurr = currList.map((c, ci) => ({ c, ci })).filter(x => x.c && !usedCurr.has(x.ci));
    const remNext = nextList.map((n, ni) => ({ n, ni })).filter(x => x.n && !usedNext.has(x.ni));
    const pairLen = Math.min(remCurr.length, remNext.length);
    for (let k = 0; k < pairLen; k++) {
      usedCurr.add(remCurr[k].ci);
      usedNext.add(remNext[k].ni);
      pairs.push([remCurr[k].c, remNext[k].n]);
    }
  }

  // 4. 余り（純減＝廃止、純増＝新設）
  currList.forEach((c, ci) => {
    if (c && !usedCurr.has(ci)) pairs.push([c, null]);
  });
  nextList.forEach((n, ni) => {
    if (n && !usedNext.has(ni)) pairs.push([null, n]);
  });

  return pairs;
};

const formatPostLabel = (deptName, groupName, title) => {
  const fullDept = [deptName, groupName].filter(Boolean).join('');
  return [fullDept, title].filter(Boolean).join('　');
};

export const generateDesignatedChangeStats = (departments = [], employees = []) => {
  const activeEmps = (employees || []).filter(e => !e.isArchived);
  const { deptMap } = buildDeptMap(departments, activeEmps);

  const statsMap = {};
  DESIGNATED_GRADE_CATEGORIES.forEach(grade => {
    statsMap[grade] = {
      grade,
      currCount: 0,
      abolishedItems: [],
      createdItems: [],
      abolishedTotal: 0,
      createdTotal: 0,
      nextCount: 0
    };
  });

  const processPair = (currEmp, nextEmp, currDeptName, nextDeptName, currGroupName, nextGroupName, defaultCurrPostName, defaultNextPostName) => {
    const currCat = getDesignatedGradeCategory(currEmp, false);
    const nextCat = getDesignatedGradeCategory(nextEmp, true);

    if (currCat) {
      statsMap[currCat].currCount += 1;
    }

    if (currCat === nextCat) return;

    const currExclude = currEmp ? String(currEmp.currentExclude || '').trim() : '';
    const nextExclude = nextEmp ? String(nextEmp.nextExclude || '').trim() : '';

    const currTitle = (currEmp?.currentTitle || defaultCurrPostName || '').trim();
    const nextTitle = (nextEmp?.nextTitle || defaultNextPostName || '').trim();

    const currPostLabel = formatPostLabel(currDeptName, currGroupName, currTitle);
    const nextPostLabel = formatPostLabel(nextDeptName, nextGroupName, nextTitle);

    if (currCat && nextCat && currCat !== nextCat) {
      // 格付変更：旧格付の「廃止」と新格付の「新設」の双方に計上
      const suffix = `（格付変更　${currCat}　→　${nextCat}）`;
      statsMap[currCat].abolishedItems.push({
        postLabel: `${currPostLabel}\n${suffix}`,
        reason: '',
        count: 1
      });
      statsMap[nextCat].createdItems.push({
        postLabel: `${nextPostLabel}\n${suffix}`,
        reason: '',
        count: 1
      });
      return;
    }

    if (currCat && !nextCat) {
      let label = currPostLabel;
      if (nextExclude) {
        label += `\n（職種変更　→　${nextExclude}）`;
      }
      statsMap[currCat].abolishedItems.push({
        postLabel: label,
        reason: '',
        count: 1
      });
    }

    if (!currCat && nextCat) {
      let label = nextPostLabel;
      if (currExclude) {
        label += `\n（職種変更　${currExclude}　→）`;
      }
      statsMap[nextCat].createdItems.push({
        postLabel: label,
        reason: '',
        count: 1
      });
    }
  };

  (departments || []).filter(d => d.type === 'regular').forEach(dept => {
    const dm = deptMap[dept.id];
    if (!dm) return;

    const currDeptName = (dept.name || '').trim();
    const nextDeptName = ((dept.nextName && dept.nextName.trim()) ? dept.nextName : dept.name || '').trim();

    // 1. 課ポスト
    (dept.posts || []).forEach(post => {
      const pd = dm.posts[post.id];
      if (!pd) return;
      const currPostName = (post.name || '').trim();
      const nextPostName = ((post.nextName && post.nextName.trim()) ? post.nextName : post.name || '').trim();
      const pairs = pairSlotEmployees(pd.current, pd.next, false);
      pairs.forEach(([c, n]) => {
        processPair(c, n, currDeptName, nextDeptName, '', '', currPostName, nextPostName);
      });
    });

    // 2. 班・グループ
    (dept.groups || []).forEach(group => {
      const gm = dm.groups[group.id];
      if (!gm) return;
      const currGroupName = (group.name || '').trim();
      const nextGroupName = ((group.nextName && group.nextName.trim()) ? group.nextName : group.name || '').trim();

      // 2a. 班ポスト
      (group.posts || []).forEach(gp => {
        const gpd = gm.posts[gp.id];
        if (!gpd) return;
        const currGpName = (gp.name || '').trim();
        const nextGpName = ((gp.nextName && gp.nextName.trim()) ? gp.nextName : gp.name || '').trim();
        const pairs = pairSlotEmployees(gpd.current, gpd.next, false);
        pairs.forEach(([c, n]) => {
          processPair(c, n, currDeptName, nextDeptName, currGroupName, nextGroupName, currGpName, nextGpName);
        });
      });

      // 2b. 班直属（指定職が含まれる場合）
      const directPairs = pairSlotEmployees(gm.direct?.current || [], gm.direct?.next || [], true);
      directPairs.forEach(([c, n]) => {
        processPair(c, n, currDeptName, nextDeptName, currGroupName, nextGroupName, '', '');
      });
    });

    // 3. 課直属（指定職が含まれる場合）
    const deptDirectPairs = pairSlotEmployees(dm.direct?.current || [], dm.direct?.next || [], true);
    deptDirectPairs.forEach(([c, n]) => {
      processPair(c, n, currDeptName, nextDeptName, '', '', '', '');
    });
  });

  return DESIGNATED_GRADE_CATEGORIES.map(grade => {
    const entry = statsMap[grade];
    entry.abolishedTotal = entry.abolishedItems.reduce((sum, item) => sum + (item.count || 0), 0);
    entry.createdTotal = entry.createdItems.reduce((sum, item) => sum + (item.count || 0), 0);
    entry.nextCount = entry.currCount - entry.abolishedTotal + entry.createdTotal;
    return entry;
  });
};
