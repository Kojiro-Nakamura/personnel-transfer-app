import { parseJapaneseDate } from './helpers.js';

export function getBirthFiscalYearForSim(dateStr) {
  const clean = parseJapaneseDate(dateStr);
  if (!clean) return null;
  const m = String(clean).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  let year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (month < 4 || (month === 4 && day === 1)) {
    year -= 1;
  }
  return year;
}

export function formatSimEraYear(y) {
  const r = y - 2018;
  return r >= 1 ? `${y}(R${r})` : `${y}`;
}

/**
 * 現在表示中の案から基準年度の在籍母集団を抽出する
 * ルール: 臨任・育代は正規在籍人員（必要定員枠）に含め、他除外(nextExclude/currentExclude)は含めない
 */
export function extractSimBaseline({ employees = [], departments = [], targetYear = 2027, baseMode = 'next' }) {
  const isNext = baseMode === 'next';
  const yr = Number(targetYear) || 2027;
  const baseYear = isNext ? yr : yr - 1;

  const deptMap = new Map();
  (departments || []).forEach(d => deptMap.set(d.id, d));

  let excludedCount = 0;
  const ikukyuBirthYears = [];
  const placedRaw = [];

  (employees || []).forEach(emp => {
    if (!emp || emp.isArchived) return;
    const dId = isNext ? emp.departmentId : emp.currentDeptId;
    if (!dId || dId === 'unassigned' || dId === 'retired') return;
    const deptObj = deptMap.get(dId);
    if (deptObj && deptObj.type && deptObj.type !== 'regular') return;
    const deptName = deptObj?.name || '';
    if (deptName.includes('退職')) return;

    // 他除外は在籍人員に含めない
    const ex = String((isNext ? emp.nextExclude : emp.currentExclude) || '').trim();
    if (ex !== '') {
      excludedCount++;
      if (ex.includes('育休')) {
        const b = getBirthFiscalYearForSim(emp.birthDate);
        if (b && (baseYear - 1) - b < 60) ikukyuBirthYears.push(b);
      }
      return;
    }

    placedRaw.push({ emp, deptName });
  });

  let upperPosts = 0;
  let leaderPosts = 0;
  let newHiresInBaseYear = 0;
  let tempCount = 0;
  let ikudaiCount = 0;
  let over65Count = 0;
  let ikukyuMatchIdx = 0;

  const activeStaff = [];

  placedRaw.forEach(({ emp, deptName }) => {
    const grade = String((isNext ? emp.nextGrade : emp.currentGrade) || '').trim();
    const remark = String((isNext ? emp.nextEmploymentType : emp.currentEmploymentType) || '').trim();
    const nameStr = String(emp.name || '氏名未設定').trim();

    const isTemp = /臨任|臨時/.test(remark) || /^臨任/.test(nameStr);
    const isIkudai = remark.includes('育代') || /^育代/.test(nameStr);
    const isNewHire = remark.includes('新採') || /^新規?採用/.test(nameStr);

    if (isTemp) tempCount++;
    if (isIkudai) ikudaiCount++;
    if (isNewHire) newHiresInBaseYear++;

    if (['部長級', '次長級', '所属長級', '課長級'].includes(grade)) {
      upperPosts++;
      leaderPosts++;
    } else if (['補佐級III(補佐兼班長)', '補佐級II(班長)'].includes(grade)) {
      leaderPosts++;
    }

    let bFY = getBirthFiscalYearForSim(emp.birthDate);

    if (isIkudai) {
      if (ikukyuMatchIdx < ikukyuBirthYears.length) {
        bFY = ikukyuBirthYears[ikukyuMatchIdx++];
      } else if (!bFY || (baseYear - 1) - bFY >= 60) {
        bFY = (baseYear - 1) - 30;
      }
    } else if (!bFY) {
      if (isNewHire) bFY = (baseYear - 1) - 22;
      else bFY = (baseYear - 1) - 35;
    }

    const ageAtBase = (baseYear - 1) - bFY;
    if (!isTemp && ageAtBase >= 65) {
      over65Count++;
    }

    activeStaff.push({
      id: emp.id,
      name: nameStr,
      bFY,
      ageAtBase,
      grade,
      remark,
      deptName,
      isTemp,
      isIkudai,
      isNewHire
    });
  });

  const totalPlacedCount = activeStaff.length;
  const nonTempCount = totalPlacedCount - tempCount;

  return {
    baseYear,
    activeStaff,
    totalPlacedCount,
    nonTempCount,
    tempCount,
    ikudaiCount,
    over65Count,
    excludedCount,
    upperPosts,
    leaderPosts,
    newHiresInBaseYear
  };
}

/**
 * 中長期採用計画・人員構成シミュレーション実行（減員はすべて小数点以下四捨五入）
 */
export function runRecruitmentSimulation({
  base,
  startHeadcount: rawStart,
  goalYears: rawGoalYears,
  goalHeadcount: rawGoal,
  selectedHorizon = 15,
  strategy = 'level',
  tempMode: rawTempMode = 'replace_temp',
  baseAnnualHire = 5,
  postGoalAnnualHire = 5,
  age60DropPct = 10,
  midAttritionPct = 0.5,
  customHiresByYear = {}
}) {
  const fallbackTotal = Math.max(1, base.totalPlacedCount || 1);
  const startHeadcount = Math.max(1, Number(rawStart) || fallbackTotal);
  const goalYears = Math.max(1, Math.min(30, Number(rawGoalYears) || 10));
  const goalHeadcount = Math.max(1, Number(rawGoal) || fallbackTotal);
  const horizon = Math.max(Number(selectedHorizon) || 15, goalYears);
  const tempMode = strategy === 'replace' ? 'replace_temp' : rawTempMode;
  const age60DropRate = Number(age60DropPct) / 100;
  const midAttritionRate = Number(midAttritionPct) / 100;
  const hireAge = 22;

  const getYearTarget = (step) => {
    if (step <= 0) return startHeadcount;
    if (step >= goalYears) return goalHeadcount;
    return Math.round(startHeadcount + (goalHeadcount - startHeadcount) * (step / goalYears));
  };

  const cohorts = {};
  base.activeStaff.forEach(s => {
    if (s.isTemp && tempMode === 'replace_temp') return;
    let effectiveBFY = s.bFY;
    if (s.isTemp && tempMode === 'keep_temp' && s.ageAtBase >= 65) {
      effectiveBFY = (base.baseYear - 1) - 35;
    }
    if (!cohorts[effectiveBFY]) cohorts[effectiveBFY] = { existing: 0, hired: 0, names: [] };
    cohorts[effectiveBFY].existing += 1;
    cohorts[effectiveBFY].names.push(s.name);
  });

  const applyYearlyReductions = (cMap, y, step) => {
    let retire65Count = 0;
    const retire65Names = [];
    let yakushoku60Count = 0;
    const yakushoku60Names = [];
    let loss60Total = 0;

    const deductInt = (c, n) => {
      let rem = n;
      const fromEx = Math.min(c.existing, rem);
      c.existing -= fromEx;
      rem -= fromEx;
      if (rem > 0) {
        c.hired = Math.max(0, c.hired - rem);
      }
    };

    Object.keys(cMap).forEach(bStr => {
      const bFY = Number(bStr);
      const age = (y - 1) - bFY;
      const c = cMap[bFY];
      const tot = c.existing + c.hired;
      if (tot <= 0) return;

      if (age >= 65) {
        retire65Count += tot;
        if (c.names.length > 0) {
          if (c.names.length > tot) {
            retire65Names.push(`${c.names.join('、')}（うち既減員除く${tot}名）`);
          } else {
            retire65Names.push(...c.names);
          }
        }
        c.existing = 0;
        c.hired = 0;
        c.names = [];
      } else if (age === 60) {
        yakushoku60Count += tot;
        yakushoku60Names.push(...c.names);
        const loss60 = Math.min(tot, Math.round(tot * age60DropRate));
        loss60Total += loss60;
        deductInt(c, loss60);
      }
    });

    const under60Entries = Object.entries(cMap)
      .map(([bStr, c]) => ({ bFY: Number(bStr), c, tot: c.existing + c.hired }))
      .filter(x => (y - 1) - x.bFY < 60 && x.tot > 0);

    const under60Pool = under60Entries.reduce((s, x) => s + x.tot, 0);
    const lossMidTotal = Math.min(under60Pool, Math.round(under60Pool * midAttritionRate));

    if (lossMidTotal > 0 && under60Entries.length > 0) {
      let remMid = lossMidTotal;
      while (remMid > 0) {
        const avail = under60Entries.filter(x => (x.c.existing + x.c.hired) > 0);
        if (avail.length === 0) break;
        avail.sort((a, b) => {
          const diff = (b.c.existing + b.c.hired) - (a.c.existing + a.c.hired);
          if (diff !== 0) return diff;
          return ((a.bFY * 13 + step * 7) % 97) - ((b.bFY * 13 + step * 7) % 97);
        });
        for (let i = 0; i < avail.length && remMid > 0; i++) {
          deductInt(avail[i].c, 1);
          remMid--;
        }
      }
    }

    return {
      retire65Count,
      retire65Names,
      yakushoku60Count,
      yakushoku60Names,
      attritionLoss: loss60Total + lossMidTotal
    };
  };

  // ●年後に▲人を達成する理論平準化採用数と、到達後の維持採用数を算出
  const simZeroGoal = JSON.parse(JSON.stringify(cohorts));
  for (let step = 1; step <= goalYears; step++) {
    applyYearlyReductions(simZeroGoal, base.baseYear + step, step);
  }
  const endZeroAtGoal = Object.values(simZeroGoal).reduce((s, c) => s + c.existing + c.hired, 0);
  const retentionGoal = Math.max(0.85, 1 - midAttritionRate * (goalYears / 2));
  const neededHiresToGoal = Math.max(0, (goalHeadcount - endZeroAtGoal) / retentionGoal);
  const recommendedAnnualHire = neededHiresToGoal / goalYears;

  let postGoalRecommendedHire = recommendedAnnualHire;
  if (horizon > goalYears) {
    const simPost = JSON.parse(JSON.stringify(cohorts));
    const approxHire = Math.round(recommendedAnnualHire);
    for (let step = 1; step <= goalYears; step++) {
      const y = base.baseYear + step;
      applyYearlyReductions(simPost, y, step);
      const bFY = (y - 1) - hireAge;
      if (!simPost[bFY]) simPost[bFY] = { existing: 0, hired: 0, names: [] };
      simPost[bFY].hired += approxHire;
    }
    const atGoalCount = Object.values(simPost).reduce((s, c) => s + c.existing + c.hired, 0);
    for (let step = goalYears + 1; step <= horizon; step++) {
      applyYearlyReductions(simPost, base.baseYear + step, step);
    }
    const endPostZero = Object.values(simPost).reduce((s, c) => s + c.existing + c.hired, 0);
    const postDrop = Math.max(0, atGoalCount - endPostZero);
    const remYears = horizon - goalYears;
    const retentionPost = Math.max(0.85, 1 - midAttritionRate * (remYears / 2));
    postGoalRecommendedHire = (postDrop / retentionPost) / remYears;
  }

  const summarizeSnapshots = (cMap, y) => {
    let total = 0;
    let under60 = 0;
    let age60to64 = 0;
    let age45to59 = 0;
    let age35to44 = 0;
    let under35 = 0;
    const ageBins = {};
    for (let a = 20; a <= 65; a++) ageBins[a] = { existing: 0, hired: 0 };

    Object.entries(cMap).forEach(([bStr, c]) => {
      const bFY = Number(bStr);
      const age = (y - 1) - bFY;
      const tot = c.existing + c.hired;
      if (tot <= 0) return;
      total += tot;
      if (age >= 60) {
        age60to64 += tot;
      } else {
        under60 += tot;
        if (age >= 45) age45to59 += tot;
        else if (age >= 35) age35to44 += tot;
        else under35 += tot;
      }
      const clampedAge = Math.max(20, Math.min(64, age));
      ageBins[clampedAge].existing += c.existing;
      ageBins[clampedAge].hired += c.hired;
    });
    return { total, under60, age60to64, age45to59, age35to44, under35, ageBins };
  };

  const yearly = [];
  const simCohorts = JSON.parse(JSON.stringify(cohorts));

  const snap0 = summarizeSnapshots(simCohorts, base.baseYear);
  const baseYakushokuNames = base.activeStaff.filter(s => !s.isTemp && s.ageAtBase === 60).map(s => s.name);
  yearly.push({
    step: 0,
    year: base.baseYear,
    yearTarget: getYearTarget(0),
    prevTotal: snap0.total,
    placedTotalWithTemp: base.totalPlacedCount,
    tempShortageSlots: tempMode === 'replace_temp' ? base.tempCount : 0,
    retire65Count: 0,
    retire65Names: [],
    yakushoku60Count: baseYakushokuNames.length,
    yakushoku60Names: baseYakushokuNames,
    attritionLoss: 0,
    hires: base.newHiresInBaseYear,
    isBase: true,
    isGoalYear: false,
    ...snap0
  });

  for (let step = 1; step <= horizon; step++) {
    const y = base.baseYear + step;
    const yearTarget = getYearTarget(step);
    const prevTotal = yearly[yearly.length - 1].total;
    const {
      retire65Count,
      retire65Names,
      yakushoku60Count,
      yakushoku60Names,
      attritionLoss
    } = applyYearlyReductions(simCohorts, y, step);

    const preHireSnap = summarizeSnapshots(simCohorts, y);
    let plannedHire = 0;
    if (customHiresByYear[y] !== undefined) {
      plannedHire = Number(customHiresByYear[y]);
    } else if (strategy === 'level') {
      plannedHire = step <= goalYears ? Number(baseAnnualHire) : Number(postGoalAnnualHire);
    } else {
      plannedHire = Math.max(0, yearTarget - preHireSnap.total);
    }

    const newHireBFY = (y - 1) - hireAge;
    if (!simCohorts[newHireBFY]) simCohorts[newHireBFY] = { existing: 0, hired: 0, names: [] };
    simCohorts[newHireBFY].hired += plannedHire;

    const snap = summarizeSnapshots(simCohorts, y);
    yearly.push({
      step,
      year: y,
      yearTarget,
      prevTotal,
      placedTotalWithTemp: snap.total,
      tempShortageSlots: Math.max(0, yearTarget - snap.total),
      retire65Count,
      retire65Names,
      yakushoku60Count,
      yakushoku60Names,
      attritionLoss,
      hires: plannedHire,
      isCustomHire: customHiresByYear[y] !== undefined,
      isBase: false,
      isGoalYear: step === goalYears,
      ...snap
    });
  }

  return {
    base,
    horizon,
    strategy,
    tempMode,
    startHeadcount,
    goalYears,
    goalHeadcount,
    recommendedAnnualHire,
    postGoalRecommendedHire,
    yearly
  };
}

export function exportSimulationCsv(sim, planName = '') {
  if (!sim) return;
  const colName = sim.tempMode === 'replace_temp' ? '正職員在籍数(育代含)' : '在籍総数(臨任・育代含)';
  const diffColName = sim.strategy === 'replace' ? '目標比過不足(臨任なし)' : '目標比過不足(マイナスは要臨任数)';
  const headers = [
    '年度',
    '前年度末人員',
    '65歳定年退職等',
    '60歳役職定年',
    '時短・中途減見込',
    '計画採用数(正職員)',
    colName,
    'うち59歳以下',
    'うち60-64歳',
    '年度目標人員',
    diffColName,
    '65歳定年退職等対象者',
    '60歳役職定年対象者'
  ];
  const lines = [headers.join(',')];
  sim.yearly.forEach(r => {
    const diff = Math.round(r.total) - r.yearTarget;
    const row = [
      formatSimEraYear(r.year) + (r.isGoalYear ? '(目標年)' : ''),
      r.isBase ? '' : Math.round(r.prevTotal),
      r.isBase ? '' : r.retire65Count,
      r.yakushoku60Count,
      r.isBase ? '' : Math.round(r.attritionLoss),
      r.hires,
      Math.round(r.total),
      Math.round(r.under60),
      Math.round(r.age60to64),
      r.yearTarget,
      diff,
      `"${r.retire65Names.join('・')}"`,
      `"${r.yakushoku60Names.join('・')}"`
    ];
    lines.push(row.join(','));
  });
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const suffix = planName ? `_${planName}` : '';
  a.href = url;
  a.download = `採用計画シミュレーション_${sim.base.baseYear}基準${suffix}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
