import { GRADE_LEVELS } from '../constants/config.js';
import {
  calculateAge,
  calculateGradeYears,
  getEmpTitleYears,
  getGradeLevel,
  isTempRemark
} from './helpers.js';

export const getOfficialBaseGrade = (grade) => {
  const g = String(grade || '').trim();
  if (!g) return '';
  if (g.includes('部長級')) return '部長級';
  if (g.includes('次長級')) return '次長級';
  if (g.includes('所属長級') || g.includes('課長級')) return '課長級';
  if (g.includes('補佐級') || g.includes('班長級')) return '補佐級';
  if (g.includes('係長級')) return '係長級';
  return g;
};

const BASE_GRADE_RANK = {
  '部長級': 4,
  '次長級': 3,
  '課長級': 2,
  '補佐級': 1,
  '係長級': 0
};

const formatDeptAndTitle = (deptObj, groupId, title, isNext) => {
  if (!deptObj || deptObj.id === 'unassigned' || deptObj.id === 'retired') return '';
  const dName = (isNext && deptObj.nextName && deptObj.nextName.trim())
    ? deptObj.nextName.trim()
    : (deptObj.name || '').trim();
  let gName = '';
  if (groupId) {
    const gObj = (deptObj.groups || []).find(g => g.id === groupId);
    if (gObj) {
      gName = (isNext && gObj.nextName && gObj.nextName.trim())
        ? gObj.nextName.trim()
        : (gObj.name || '').trim();
    }
  }
  const t = String(title || '').trim();
  const fullDept = (gName && !t.includes(gName)) ? `${dName}${gName}` : dName;
  return [fullDept, t].filter(Boolean).join('　');
};

/**
 * 新指定職（補佐級II(班長)以上）への「昇任者一覧」と「昇格者一覧」を抽出する
 * - 昇任: 格付区分（部長級・次長級・課長級・補佐級）自体が上位へ上がる者
 * - 昇格: 同一の格付区分内でより上位の職（主任→班長、班長→補佐兼班長、課長級→所属長級）へ上がる者
 */
export const extractDesignatedPromoLists = (employees = [], departments = [], targetYear) => {
  const designatedMinLevel = GRADE_LEVELS['補佐級II(班長)'] || 5;
  const deptById = {};
  (departments || []).forEach(d => {
    deptById[d.id] = d;
  });

  const promotionRows = [];
  const advancementRows = [];

  (employees || []).forEach(emp => {
    if (!emp || emp.isArchived) return;
    if (!emp.departmentId || emp.departmentId === 'retired' || emp.departmentId === 'unassigned') return;
    if (!emp.currentDeptId || emp.currentDeptId === 'retired' || emp.currentDeptId === 'unassigned') return;
    if (emp.nextDept === '退職' || emp.currentDept === '退職') return;
    if (emp.nextExclude && String(emp.nextExclude).trim() !== '') return;
    if (isTempRemark(emp.nextEmploymentType)) return;

    const cLevel = getGradeLevel(emp.currentGrade);
    const nLevel = getGradeLevel(emp.nextGrade);
    if (nLevel < designatedMinLevel || nLevel <= cLevel) return;

    const currBase = getOfficialBaseGrade(emp.currentGrade);
    const nextBase = getOfficialBaseGrade(emp.nextGrade);
    const currRank = BASE_GRADE_RANK[currBase] ?? -1;
    const nextRank = BASE_GRADE_RANK[nextBase] ?? -1;

    const cDept = deptById[emp.currentDeptId];
    const nDept = deptById[emp.departmentId];
    const oldPost = formatDeptAndTitle(cDept, emp.currentGroupId, emp.currentTitle, false);
    const newPost = formatDeptAndTitle(nDept, emp.groupId, emp.nextTitle, true);
    const age = calculateAge(emp.birthDate, targetYear) ?? '';

    if (nextRank > currRank) {
      // 昇任（部長級・次長級・課長級・補佐級の格付が上がる場合）
      promotionRows.push({
        emp,
        gradeLabel: nextBase,
        baseRank: nextRank,
        nextLevel: nLevel,
        name: emp.name || '',
        oldPost,
        newPost,
        age,
        gradeYears: calculateGradeYears(emp, targetYear)
      });
    } else if (nextRank === currRank && nLevel > cLevel) {
      // 昇格（同一格付内で上位の職へ任用される場合：主任→班長、班長→補佐兼班長、課長級→所属長級）
      advancementRows.push({
        emp,
        gradeLabel: nextBase,
        baseRank: nextRank,
        nextLevel: nLevel,
        name: emp.name || '',
        age,
        oldPost,
        titleYears: getEmpTitleYears(emp),
        newPost
      });
    }
  });

  promotionRows.sort((a, b) => {
    if (b.baseRank !== a.baseRank) return b.baseRank - a.baseRank;
    if (b.nextLevel !== a.nextLevel) return b.nextLevel - a.nextLevel;
    const gyDiff = (Number(b.gradeYears) || 0) - (Number(a.gradeYears) || 0);
    if (gyDiff !== 0) return gyDiff;
    return a.oldPost.localeCompare(b.oldPost, 'ja');
  });

  advancementRows.sort((a, b) => {
    if (b.baseRank !== a.baseRank) return b.baseRank - a.baseRank;
    if (b.nextLevel !== a.nextLevel) return b.nextLevel - a.nextLevel;
    const tyDiff = (Number(b.titleYears) || 0) - (Number(a.titleYears) || 0);
    if (tyDiff !== 0) return tyDiff;
    return a.oldPost.localeCompare(b.oldPost, 'ja');
  });

  return { promotionRows, advancementRows };
};
