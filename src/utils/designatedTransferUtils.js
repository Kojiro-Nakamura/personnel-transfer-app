import { GRADE_LEVELS } from '../constants/config.js';
import {
  getEmpCurrentYears,
  getEmpTitleYears,
  calculateGradeYears,
  getMidYearPromoRemark,
  getPromoRemark,
  isTempRemark
} from './helpers.js';

const OFFICIAL_JOB_TYPES = [
  '獣医師（衛生）', '獣医師（畜産）', '臨床検査技師', '診療放射線', '歯科衛生士',
  '文書専門員', '精神保健', '社会福祉', '専任教員', '作業療法', '歯科医師',
  '計量技師', '工業技術', '機械技師', '職業指導', '農業工学', 'ジオパーク',
  '保健師', '看護師', '栄養士', '薬剤師', '電気職',
  '教官', '無線', '情報', '化学', '医師', '農学', '林学', '水産', '船舶', '土木', '建築'
];

export const inferOwnJobName = (fileName = '') => {
  const s = String(fileName || '');
  for (const jt of OFFICIAL_JOB_TYPES) {
    const base = jt.replace(/職$/, '');
    if (s.includes(base)) return base;
  }
  return '';
};

const formatExcludedParenLabel = (excludeStr) => {
  const clean = String(excludeStr || '').trim().replace(/^[（(]|[）)]$/g, '');
  if (!clean) return '';
  if (clean.endsWith('職') || clean.includes('短時間') || clean.includes('育休')) {
    return `（${clean}）`;
  }
  return `（${clean}職）`;
};

const toShortJobName = (excludeStr) => {
  const clean = String(excludeStr || '').trim().replace(/^[（(]|[）)]$/g, '');
  if (!clean) return '';
  return clean.replace(/職$/, '');
};

export const isDesignatedGradeOrTitle = (grade, title) => {
  const g = String(grade || '');
  const t = String(title || '');
  const isHosa1 = g.includes('補佐級I(') || g.includes('補佐級Ⅰ') || g.includes('主任');
  if (g.includes('補佐級') && !isHosa1) return true;
  if (g.includes('課長級') || g.includes('所属長級') || g.includes('次長級') || g.includes('部長級') || g.includes('指定職') || g.includes('班長級')) return true;
  if (['局長', '次長', '課長', '参事', '部長', '場長', '班長', '専門技術員', '企画員', '主幹'].some(k => t.includes(k))) {
    // 役職定年等により級が空欄で「副主任」等になっている場合は除外（上のsomeには含まれないが念のため級なし非指定職をガード）
    if (!g && (t.includes('副主任') || t.includes('副主査'))) return false;
    return true;
  }
  return false;
};

export const getDesignatedDisplayGrade = (gradeStr) => {
  const g = String(gradeStr || '');
  if (g.includes('補佐級II') || g.includes('補佐級III') || g.includes('班長級')) return '班長級';
  if (g.includes('補佐級I(') || g.includes('補佐級Ⅰ') || g.includes('係長級') || g.includes('主任') || g.includes('主査')) return '';
  return g;
};

const isReemploymentRemark = (remark) => {
  const r = String(remark || '');
  return /再任用|再フル|再短|定年前/.test(r);
};

const isYakushokuTeinen = (emp) => {
  if (!emp) return false;
  const nextRem = String(emp.nextEmploymentType || '');
  const nextTitle = String(emp.nextTitle || '');
  return nextRem.includes('役職定年') || nextTitle.includes('副主任');
};

const formatPostFull = (post) => {
  if (!post || post.type === 'unassigned' || post.type === 'retired') return '';
  const deptPart = post.fullDept || post.dept || '';
  const titlePart = post.title || '';
  return [deptPart, titlePart].filter(Boolean).join('　');
};

/**
 * 指定職人事異動様式（提出04）の行データを構築・ソートする
 */
export const buildDesignatedTransferRows = ({
  moves = [],
  retentions = [],
  movesByToPost = {},
  targetYear,
  currentFileName = ''
}) => {
  const ownJob = inferOwnJobName(currentFileName);
  const rawRows = [];
  const usedToMoves = new Set();

  const getCurrStatus = (move) => {
    if (!move || !move.emp) return { isOwnDesig: false, isExcludedDesig: false, exclude: '' };
    const emp = move.emp;
    const exclude = String(emp.currentExclude || '').trim();
    const isTemp = isTempRemark(emp.currentEmploymentType);
    if (isTemp) return { isOwnDesig: false, isExcludedDesig: false, exclude: '' };
    const desig = isDesignatedGradeOrTitle(emp.currentGrade, move.fromPost?.title || emp.currentTitle);
    if (exclude !== '') {
      return { isOwnDesig: false, isExcludedDesig: desig || !!move.fromPost?.title, exclude };
    }
    return { isOwnDesig: desig, isExcludedDesig: false, exclude: '' };
  };

  const getNextStatus = (move) => {
    if (!move || !move.emp) return { isOwnDesig: false, isExcludedDesig: false, exclude: '' };
    const emp = move.emp;
    const exclude = String(emp.nextExclude || '').trim();
    const isTemp = isTempRemark(emp.nextEmploymentType);
    if (isTemp) return { isOwnDesig: false, isExcludedDesig: false, exclude: '' };
    const desig = isDesignatedGradeOrTitle(emp.nextGrade, move.toPost?.title || emp.nextTitle);
    if (exclude !== '') {
      return { isOwnDesig: false, isExcludedDesig: desig || !!move.toPost?.title, exclude };
    }
    return { isOwnDesig: desig, isExcludedDesig: false, exclude: '' };
  };

  // 1. 異動があるポスト（前任者ベース）
  moves.forEach(move => {
    if (move.fromPost.type === 'unassigned' || move.fromPost.type === 'retired') return;
    const predSt = getCurrStatus(move);

    const incomingMoves = (movesByToPost[move.fromPostId] || []).filter(m => !usedToMoves.has(m));
    let successor = null;
    if (incomingMoves.length > 0) {
      // 自職種の指定職後任を優先、いなければ職種変更（他カウント除外）後任を採用
      const ownSucc = incomingMoves.find(m => getNextStatus(m).isOwnDesig);
      const exclSucc = incomingMoves.find(m => getNextStatus(m).isExcludedDesig);
      successor = ownSucc || exclSucc || incomingMoves[0];
      usedToMoves.add(successor);
    }
    const succSt = getNextStatus(successor);

    // 両年度とも自職種の指定職に関係しない枠（例：事務職→事務職、一般→一般）は除外
    if (!predSt.isOwnDesig && !succSt.isOwnDesig) return;

    const gradeLabel = predSt.isOwnDesig
      ? (getDesignatedDisplayGrade(move.emp.currentGrade) || getDesignatedDisplayGrade(successor?.emp?.nextGrade))
      : getDesignatedDisplayGrade(successor?.emp?.nextGrade);

    rawRows.push({
      postLabel: formatPostFull(move.fromPost),
      gradeLabel,
      predecessor: move,
      predSt,
      successor,
      succSt,
      isRetention: false
    });
  });

  // 2. 前任者がいない新設指定職ポスト（後任者ベース）
  moves.forEach(move => {
    if (usedToMoves.has(move)) return;
    if (move.toPost.type === 'retired' || move.toPost.type === 'unassigned') return;
    const succSt = getNextStatus(move);
    if (succSt.isOwnDesig) {
      rawRows.push({
        postLabel: formatPostFull(move.toPost),
        gradeLabel: getDesignatedDisplayGrade(move.emp.nextGrade),
        predecessor: null,
        predSt: { isOwnDesig: false, isExcludedDesig: false, exclude: '' },
        successor: move,
        succSt,
        isRetention: false
      });
    }
  });

  // 3. 同一枠継続（留任、または同一枠内での職種変更・指定職化・役職定年降任など）
  retentions.forEach(move => {
    const predSt = getCurrStatus(move);
    const succSt = getNextStatus(move);

    if (!predSt.isOwnDesig && !succSt.isOwnDesig) return;

    if (predSt.isOwnDesig && succSt.isOwnDesig) {
      // 純粋な留任（または同一枠内昇格）
      rawRows.push({
        postLabel: formatPostFull(move.fromPost),
        gradeLabel: getDesignatedDisplayGrade(move.emp.currentGrade) || getDesignatedDisplayGrade(move.emp.nextGrade),
        predecessor: move,
        predSt,
        successor: move,
        succSt,
        isRetention: true
      });
    } else if (predSt.isOwnDesig && !succSt.isOwnDesig) {
      // 同一枠内で他職種へ変更、または役職定年等で非指定職へ移行（ポスト廃止扱い）
      rawRows.push({
        postLabel: formatPostFull(move.fromPost),
        gradeLabel: getDesignatedDisplayGrade(move.emp.currentGrade),
        predecessor: move,
        predSt,
        successor: succSt.isExcludedDesig ? move : null,
        succSt: succSt.isExcludedDesig ? succSt : { isOwnDesig: false, isExcludedDesig: false, exclude: '' },
        isRetention: false
      });
    } else if (!predSt.isOwnDesig && succSt.isOwnDesig) {
      // 同一枠内で非指定職（主任など）または他職種から指定職へ新設・昇格
      rawRows.push({
        postLabel: formatPostFull(move.toPost),
        gradeLabel: getDesignatedDisplayGrade(move.emp.nextGrade),
        predecessor: predSt.isExcludedDesig ? move : null,
        predSt,
        successor: move,
        succSt,
        isRetention: false
      });
    }
  });

  const desigRows = rawRows.map(row => {
    const { isRetention, predSt, succSt } = row;
    const pred = row.predecessor?.emp || {};
    const succ = row.successor?.emp || {};
    const succPost = row.successor?.fromPost || {};

    // --- 今年度配置側（C〜H列） ---
    let predName = '';
    let predAge = '';
    let predBirthDate = '';
    let predCurrentYears = '';
    let predTitleYears = '';
    let predGradeYears = '';

    if (predSt.isOwnDesig) {
      predName = pred.name || '';
      predAge = pred.ageNextYear ?? pred.age ?? '';
      predBirthDate = pred.birthDate || '';
      predCurrentYears = getEmpCurrentYears(pred, targetYear - 1, false) || '';
      predTitleYears = getEmpTitleYears(pred);
      predGradeYears = calculateGradeYears(pred, targetYear);
    } else if (predSt.isExcludedDesig) {
      // 記載例 Row 9: 氏　名に「〇〇　〇〇\n（〇〇職）」、年齢・年数は空欄
      const parenJob = formatExcludedParenLabel(predSt.exclude);
      const rawName = (pred.name || '').trim();
      if (rawName && rawName !== predSt.exclude && rawName !== parenJob) {
        predName = `${rawName}\n${parenJob}`;
      } else {
        predName = parenJob;
      }
    }

    // 異動案（H列: 留任 / 転任 / 退職 / 廃止 / （新設））
    let predReason = '';
    const isPredRetiring = Boolean(
      row.predecessor && (
        row.predecessor.toPost?.type === 'retired' ||
        (!isReemploymentRemark(pred.currentEmploymentType) && isReemploymentRemark(pred.nextEmploymentType))
      )
    );

    if (isRetention) {
      predReason = '留任';
    } else if (!predSt.isOwnDesig) {
      // 純新設、または他職種からの職種変更（記載例 Row 9）
      predReason = '（新設）';
    } else if (!succSt.isOwnDesig) {
      // 来年度に自職種の指定職後任がいない（職種変更による廃止 or ポスト廃止）
      if (succSt.isExcludedDesig) {
        // 記載例 Row 8: 職種変更（他職種へ） → 「廃止」（前任者が退職の場合のみ「退職」）
        predReason = isPredRetiring ? '退職' : '廃止';
      } else if (isPredRetiring) {
        predReason = '退職';
      } else if (isYakushokuTeinen(pred)) {
        // 吹き出し: 役職定年により副主任として勤務継続する場合は「転任」
        predReason = '転任';
      } else {
        predReason = '廃止';
      }
    } else {
      // 自職種の指定職後任がいる通常の交代（記載例 Row 6: 退職 / Row 7: 転任）
      predReason = isPredRetiring ? '退職' : '転任';
    }

    // --- 来年度配置（案）側（I〜O列） ---
    let displaySuccName = '';
    let displaySuccAge = '';
    let displaySuccCurrentYears = '';
    let displaySuccTitleYears = '';
    let displaySuccGradeYears = '';
    let displaySuccPostLabel = '';
    let succRemark = '';

    if (isRetention) {
      // 記載例 Row 10: 留任時は右側空欄（同一枠内で昇任・昇格がある場合のみ備考に表示）
      const promoStr = getPromoRemark(pred.currentGrade || '', succ.nextGrade || '');
      if (promoStr) {
        succRemark = promoStr;
      }
    } else if (succSt.isOwnDesig) {
      displaySuccName = succ.name || '';
      displaySuccAge = succ.ageNextYear ?? succ.age ?? '';
      displaySuccCurrentYears = succ.currentYears || '';
      displaySuccTitleYears = getEmpTitleYears(succ);
      displaySuccGradeYears = calculateGradeYears(succ, targetYear);
      displaySuccPostLabel = formatPostFull(succPost);

      const remarkParts = [];
      if (predSt.isExcludedDesig) {
        // 記載例 Row 9: 職種変更　〇〇→〇〇
        const fromJob = toShortJobName(predSt.exclude);
        remarkParts.push(`職種変更　${fromJob}→${ownJob}`);
      }
      const promoStr = getPromoRemark(succ.currentGrade || '', succ.nextGrade || '');
      if (promoStr) {
        remarkParts.push(promoStr);
      }
      const sMid = getMidYearPromoRemark(succ);
      if (sMid) {
        remarkParts.push(`(${sMid})`);
      }
      succRemark = remarkParts.join('\n');
    } else if (succSt.isExcludedDesig) {
      // 記載例 Row 8: 氏名に「（事務職）」、年齢〜R8所属は空欄、備考に「職種変更　〇〇→事務」
      displaySuccName = formatExcludedParenLabel(succSt.exclude);
      const toJob = toShortJobName(succSt.exclude);
      succRemark = `職種変更　${ownJob}→${toJob}`;
    } else if (predSt.isOwnDesig) {
      // ポスト廃止：「後任なし」ではなく「（廃止）」と記載
      displaySuccName = '（廃止）';
    }

    return {
      postLabel: row.postLabel,
      gradeLabel: row.gradeLabel,
      predName,
      predAge,
      predBirthDate,
      predCurrentYears,
      predTitleYears,
      predGradeYears,
      predReason,
      succName: displaySuccName,
      succAge: displaySuccAge,
      succCurrentYears: displaySuccCurrentYears,
      succTitleYears: displaySuccTitleYears,
      succGradeYears: displaySuccGradeYears,
      succPostLabel: displaySuccPostLabel,
      succRemark
    };
  });

  // 格付順（部長級→次長級→所属長級→課長級→班長級） × 今年度配置者の年齢の高い順
  const desigGradeOrder = { '部長級': 10, '次長級': 9, '所属長級': 8, '課長級': 7, '班長級': 5 };
  desigRows.sort((a, b) => {
    const levelA = desigGradeOrder[a.gradeLabel] ?? GRADE_LEVELS[a.gradeLabel] ?? 0;
    const levelB = desigGradeOrder[b.gradeLabel] ?? GRADE_LEVELS[b.gradeLabel] ?? 0;
    if (levelA !== levelB) {
      return levelB - levelA;
    }

    const hasAgeA = a.predAge !== '' && a.predAge != null && !isNaN(Number(a.predAge));
    const hasAgeB = b.predAge !== '' && b.predAge != null && !isNaN(Number(b.predAge));
    if (hasAgeA && !hasAgeB) return -1;
    if (!hasAgeA && hasAgeB) return 1;
    if (hasAgeA && hasAgeB) {
      const ageDiff = Number(b.predAge) - Number(a.predAge);
      if (ageDiff !== 0) return ageDiff;
      if (a.predBirthDate && b.predBirthDate && a.predBirthDate !== b.predBirthDate) {
        return a.predBirthDate < b.predBirthDate ? -1 : 1;
      }
    }

    const gyA = Number(a.predGradeYears) || 0;
    const gyB = Number(b.predGradeYears) || 0;
    if (gyB !== gyA) return gyB - gyA;

    const sAgeA = Number(a.succAge) || 0;
    const sAgeB = Number(b.succAge) || 0;
    return sAgeB - sAgeA;
  });

  return desigRows;
};
