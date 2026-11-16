import { isTempRemark } from '../helpers.js';

// 所属配置シートの標準行定義（画像の並び順＋R8→R9追加部署）
const DEPT_ALLOCATION_ROWS = [
  { groupName: '〇〇振興局', subName: '局長', matchDepts: ['〇〇振興局'], roleFilter: 'shinkokyoku_head' },
  { groupName: '森林林業局', subName: '森林林業局長', matchDepts: ['林業振興課', '森林林業局'], roleFilter: 'forestry_bureau_head' },
  { groupName: '', subName: '林業振興課', matchDepts: ['林業振興課'], roleFilter: 'exclude_forestry_bureau_head' },
  { groupName: '', subName: '　循環型林業推進室', matchDepts: ['循環型林業推進室', '　循環型林業推進室'] },
  { groupName: '', subName: '森林整備課', matchDepts: ['森林整備課'] },
  { groupName: '', subName: '　全国育樹祭推進室', matchDepts: ['全国育樹祭推進室', '　全国育樹祭推進室'] },
  { groupName: '林業試験場', subName: '', matchDepts: ['林業試験場'] },
  { groupName: 'わかやま森林と緑の公社', subName: '', matchDepts: ['わかやま森林と緑の公社'] },
  { groupName: '農林水産政策局', subName: '農林大学校林業研修部', matchDepts: ['農林大学校', '農林大学校林業研修部'] },
  { groupName: '知事室', subName: '東京事務所', matchDepts: ['東京事務所'] },
  { groupName: '総務部', subName: '財政課', matchDepts: ['財政課'] },
  { groupName: '', subName: '情報基盤課', matchDepts: ['情報基盤課'] },
  { groupName: '地域振興部', subName: '観光振興課', matchDepts: ['観光振興課'] },
  { groupName: '環境生活部', subName: '自然環境課', matchDepts: ['自然環境課'] },
  { groupName: '商工労働部', subName: '成長産業推進課', matchDepts: ['成長産業推進課'] },
  { groupName: '農林水産部', subName: '農林水産振興課', matchDepts: ['農林水産振興課'] },
  { groupName: '', subName: '研究推進課', matchDepts: ['研究推進課'] },
  { groupName: '', subName: 'クビアカツヤカミキリ対策室', matchDepts: ['クビアカツヤカミキリ対策室'] },
  { groupName: '県土整備部', subName: '技術調査課', matchDepts: ['技術調査課'] },
  { groupName: '', subName: '検査・技術支援課', matchDepts: ['検査・技術支援課'] },
  { groupName: '', subName: '土砂災害啓発センター', matchDepts: ['土砂災害啓発センター'] },
  { groupName: '', subName: '都市政策課盛土対策室', matchDepts: ['都市政策課盛土対策室', '盛土対策室'] },
  { groupName: '監査委員事務局', subName: '第一課', matchDepts: ['監査委員事務局第一課', '監査委員会事務局第一課'] },
  { groupName: '振興局', subName: '海草', matchDepts: ['海草農林水産振興部', '海草振興局'] },
  { groupName: '', subName: '那賀', matchDepts: ['那賀農林水産振興部', '那賀振興局'] },
  { groupName: '', subName: '伊都', matchDepts: ['伊都農林水産振興部', '伊都振興局'] },
  { groupName: '', subName: '有田', matchDepts: ['有田農林水産振興部', '有田振興局'] },
  { groupName: '', subName: '日高', matchDepts: ['日高農林水産振興部', '日高振興局'] },
  { groupName: '', subName: '西牟婁', matchDepts: ['西牟婁農林水産振興部', '西牟婁振興局'] },
  { groupName: '', subName: '東牟婁', matchDepts: ['東牟婁農林水産振興部', '東牟婁振興局'] }
];

const FILL_YELLOW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
const FILL_GREEN = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
const FILL_BLUE = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } };

const FONT_BASE = { name: 'BIZ UDPゴシック', size: 10, color: { argb: 'FF000000' } };
const FONT_RED = { name: 'BIZ UDPゴシック', size: 10, color: { argb: 'FFFF0000' } };
const FONT_TITLE = { name: 'BIZ UDPゴシック', size: 14, bold: true, color: { argb: 'FF000000' } };
const FONT_HEADER = { name: 'BIZ UDPゴシック', size: 10, color: { argb: 'FF000000' } };
const FONT_SMALL_BOX = { name: 'BIZ UDPゴシック', size: 7, color: { argb: 'FF000000' } };
const FONT_REMARK = { name: 'BIZ UDPゴシック', size: 8.5, color: { argb: 'FF000000' } };
const FONT_FOOTER_MAIN = { name: 'BIZ UDPゴシック', size: 9.5, color: { argb: 'FF000000' } };
const FONT_FOOTER_RED = { name: 'BIZ UDPゴシック', size: 9.5, color: { argb: 'FFFF0000' } };
const FONT_FOOTER_SMALL = { name: 'BIZ UDPゴシック', size: 8.5, color: { argb: 'FF000000' } };
const FONT_FOOTER_TINY = { name: 'BIZ UDPゴシック', size: 7.5, color: { argb: 'FF000000' } };
const FONT_SUBTITLE = { name: 'BIZ UDPゴシック', size: 10.5, color: { argb: 'FF000000' } };

const NUM_FMT_DIFF = '#,##0;"▲ "#,##0;0';
const NUM_FMT_COUNT = '#,##0';

// 氏名の姓抽出（同姓がいる場合は「田中(雅)」のように名の1文字目を付与）
const buildShortNameFormatter = (employees) => {
  const surnameCounts = {};
  const splitName = (fullName) => {
    const clean = String(fullName || '').replace(/^新規採用No\.\d+[（(](.+?)[）)]$/, '$1').trim();
    const parts = clean.split(/[\s　]+/);
    if (parts.length >= 2) {
      return { surname: parts[0], given: parts.slice(1).join('') };
    }
    return { surname: clean, given: '' };
  };

  employees.forEach(e => {
    if (e.isArchived) return;
    const { surname } = splitName(e.name);
    if (surname) surnameCounts[surname] = (surnameCounts[surname] || 0) + 1;
  });

  return (emp) => {
    const { surname, given } = splitName(emp.name);
    if (surnameCounts[surname] > 1 && given) {
      return `${surname}(${given.charAt(0)})`;
    }
    return surname;
  };
};

// 職員の年度別カテゴリ判定
const classifyEmployee = (emp, isNext) => {
  const deptId = isNext ? emp.departmentId : emp.currentDeptId;
  if (!deptId || deptId === 'unassigned') return 'unassigned';
  if (deptId === 'retired') return 'retired';

  const excludeVal = String((isNext ? emp.nextExclude : emp.currentExclude) || '').trim();
  if (excludeVal !== '') return 'excluded';

  const remark = String((isNext ? emp.nextEmploymentType : emp.currentEmploymentType) || '').trim();
  if (isTempRemark(remark)) return 'temp';
  if (remark.includes('役職定年')) return 'yakushoku';
  if (remark.includes('再任用') || remark.includes('再フル')) return 'saininyo';
  if (isNext && remark.includes('新採')) return 'new_hire';
  return 'regular';
};

export const addDeptAllocationSheet = (workbook, sheetName, targetYear, departments, employees, notes = []) => {
  const currEraNum = targetYear - 2019;
  const nextEraNum = targetYear - 2018;
  const activeEmps = (employees || []).filter(e => !e.isArchived);
  const regularDepts = (departments || []).filter(d => d.type === 'regular');
  const formatShortName = buildShortNameFormatter(activeEmps);

  // 森林林業局長判定ヘルパー（林業振興課の「局長」ポストまたは職名「局長」「森林林業局長」）
  const isForestryBureauHead = (emp, isNext, deptObj) => {
    const title = String((isNext ? emp.nextTitle : emp.currentTitle) || '').trim();
    if (title === '局長' || title === '森林林業局長') return true;
    if (deptObj) {
      const postId = isNext ? emp.postId : emp.currentPostId;
      const post = (deptObj.posts || []).find(p => p.id === postId);
      if (post && (post.name === '局長' || post.name === '森林林業局長')) return true;
    }
    return false;
  };

  // 〇〇振興局の局長判定ヘルパー
  const isShinkokyokuHead = (emp, isNext) => {
    const title = String((isNext ? emp.nextTitle : emp.currentTitle) || '').trim();
    return title === '振興局長';
  };

  // 行データの構築
  const matchedDeptIds = new Set();
  const tableRows = DEPT_ALLOCATION_ROWS.map(rowDef => {
    const matchedDepts = regularDepts.filter(d => {
      const n1 = (d.name || '').trim();
      const n2 = (d.nextName || '').trim();
      return rowDef.matchDepts.includes(n1) || (n2 && rowDef.matchDepts.includes(n2));
    });
    matchedDepts.forEach(d => matchedDeptIds.add(d.id));
    return {
      ...rowDef,
      deptObjs: matchedDepts
    };
  });

  // 未掲載の新規部署があれば振興局の前に追加
  regularDepts.forEach(d => {
    if (!matchedDeptIds.has(d.id)) {
      const dispName = d.nextName && d.nextName !== d.name ? d.nextName : d.name;
      tableRows.push({
        groupName: 'その他',
        subName: dispName,
        matchDepts: [d.name],
        deptObjs: [d]
      });
    }
  });

  // 各行のブロック境界（groupNameがある行が新しい部局ブロックの開始）を特定
  let currentGroup = '';
  tableRows.forEach((row, idx) => {
    if (row.groupName) {
      currentGroup = row.groupName;
      row.isGroupStart = true;
    } else {
      row.isGroupStart = false;
    }
    row.effectiveGroup = currentGroup;
    const nextRow = tableRows[idx + 1];
    row.isGroupEnd = !nextRow || Boolean(nextRow.groupName);
  });

  const ws = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: false }],
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      margins: { left: 0.4, right: 0.4, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 }
    }
  });

  // 列幅設定 (A〜G)
  ws.columns = [
    { width: 22 }, // A: 部局名
    { width: 23 }, // B: 所属（課室・振興局）
    { width: 9.5 }, // C: 今年度（臨任除く）
    { width: 9.5 }, // D: 今年度（臨任含む）
    { width: 9.5 }, // E: 来年度（臨任含む）
    { width: 8.5 }, // F: 増減
    { width: 46 }  // G: 備考
  ];

  // --- 行1〜3: タイトルと「臨任職員を除く/含む」注記枠 ---
  ws.getRow(1).height = 10;
  ws.getRow(2).height = 16;
  ws.getRow(3).height = 16;

  ws.getCell('A2').value = `令和${nextEraNum}年度　林学職員所属配置`;
  ws.getCell('A2').font = FONT_TITLE;
  ws.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' };

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  ws.getCell('G2').value = dateStr;
  ws.getCell('G2').font = FONT_BASE;
  ws.getCell('G2').alignment = { vertical: 'middle', horizontal: 'right' };

  // C2:C3 (臨任職員を除く↓ 赤枠), D2:D3 (臨任職員を含む↓ 灰枠), E2:E3 (臨任職員を含む↓ 赤枠)
  const topBoxes = [
    { col: 3, text: '臨任職員を除く\n↓', borderColor: 'FFFF0000', borderStyle: 'medium' },
    { col: 4, text: '臨任職員を含む\n↓', borderColor: 'FF808080', borderStyle: 'thin' },
    { col: 5, text: '臨任職員を含む\n↓', borderColor: 'FFFF0000', borderStyle: 'medium' }
  ];
  topBoxes.forEach(({ col, text, borderColor, borderStyle }) => {
    ws.mergeCells(2, col, 3, col);
    const cellTop = ws.getCell(2, col);
    const cellBottom = ws.getCell(3, col);
    cellTop.value = text;
    cellTop.font = FONT_SMALL_BOX;
    cellTop.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cellTop.border = {
      top: { style: borderStyle, color: { argb: borderColor } },
      left: { style: borderStyle, color: { argb: borderColor } },
      right: { style: borderStyle, color: { argb: borderColor } }
    };
    cellBottom.border = {
      bottom: { style: borderStyle, color: { argb: borderColor } },
      left: { style: borderStyle, color: { argb: borderColor } },
      right: { style: borderStyle, color: { argb: borderColor } }
    };
  });

  // --- 行4: テーブルヘッダー ---
  const headerRowIdx = 4;
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.height = 20;
  ws.mergeCells(headerRowIdx, 1, headerRowIdx, 2);
  ws.getCell(headerRowIdx, 1).value = '所属';
  ws.getCell(headerRowIdx, 3).value = `R${currEraNum}`;
  ws.getCell(headerRowIdx, 4).value = `R${currEraNum}`;
  ws.getCell(headerRowIdx, 5).value = `R${nextEraNum}`;
  ws.getCell(headerRowIdx, 6).value = '増減';
  ws.getCell(headerRowIdx, 7).value = '備考';

  for (let c = 1; c <= 7; c++) {
    const cell = ws.getCell(headerRowIdx, c);
    cell.font = FONT_HEADER;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'double', color: { argb: 'FF000000' } },
      left: c === 1 ? { style: 'thin', color: { argb: 'FF000000' } } : (c === 2 ? undefined : { style: 'hair', color: { argb: 'FF000000' } }),
      right: c === 7 ? { style: 'thin', color: { argb: 'FF000000' } } : (c === 1 ? undefined : { style: 'hair', color: { argb: 'FF000000' } })
    };
  }

  // --- 行5〜: データ行 ---
  const firstDataRow = 5;
  let totalCurrExcl = 0;
  let totalCurrIncl = 0;
  let totalNextIncl = 0;

  tableRows.forEach((rowDef, idx) => {
    const r = firstDataRow + idx;
    const row = ws.getRow(r);
    row.height = 19;

    const deptIdSet = new Set(rowDef.deptObjs.map(d => d.id));
    const deptMapById = new Map(rowDef.deptObjs.map(d => [d.id, d]));

    let currExcl = 0;
    let currIncl = 0;
    let nextIncl = 0;

    const matchesRowRole = (emp, isNext) => {
      const dId = isNext ? emp.departmentId : emp.currentDeptId;
      if (!deptIdSet.has(dId)) return false;
      const deptObj = deptMapById.get(dId);
      if (rowDef.roleFilter === 'forestry_bureau_head') {
        return isForestryBureauHead(emp, isNext, deptObj);
      }
      if (rowDef.roleFilter === 'exclude_forestry_bureau_head') {
        return !isForestryBureauHead(emp, isNext, deptObj);
      }
      if (rowDef.roleFilter === 'shinkokyoku_head') {
        return isShinkokyokuHead(emp, isNext);
      }
      return true;
    };

    activeEmps.forEach(emp => {
      if (matchesRowRole(emp, false)) {
        const cat = classifyEmployee(emp, false);
        if (cat === 'regular' || cat === 'yakushoku' || cat === 'saininyo') {
          currExcl++;
          currIncl++;
        } else if (cat === 'temp') {
          currIncl++;
        }
      }
      if (matchesRowRole(emp, true)) {
        const cat = classifyEmployee(emp, true);
        if (cat === 'regular' || cat === 'yakushoku' || cat === 'saininyo' || cat === 'new_hire' || cat === 'temp') {
          nextIncl++;
        }
      }
    });

    totalCurrExcl += currExcl;
    totalCurrIncl += currIncl;
    totalNextIncl += nextIncl;

    const diff = nextIncl - currExcl;

    // 部署メモがあれば備考欄に反映
    let remarkText = '';
    if (rowDef.deptObjs.length > 0 && rowDef.roleFilter !== 'forestry_bureau_head') {
      const deptNotes = rowDef.deptObjs
        .map(d => (notes || []).find(n => n.targetId === `dept-${d.id}`)?.text)
        .filter(Boolean);
      if (deptNotes.length > 0) {
        remarkText = deptNotes.join('\n');
      }
    }

    row.getCell(1).value = rowDef.groupName || null;
    row.getCell(2).value = rowDef.subName || null;
    row.getCell(3).value = currExcl;
    row.getCell(4).value = currIncl;
    row.getCell(5).value = nextIncl;
    row.getCell(6).value = {
      formula: `E${r}-C${r}`,
      result: diff
    };
    row.getCell(7).value = remarkText || null;

    // フォント・配置・表示形式
    row.getCell(1).font = FONT_BASE;
    row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    row.getCell(2).font = FONT_BASE;
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

    for (let c = 3; c <= 6; c++) {
      const cell = row.getCell(c);
      cell.font = FONT_BASE;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.numFmt = c === 6 ? NUM_FMT_DIFF : NUM_FMT_COUNT;
    }

    row.getCell(7).font = FONT_REMARK;
    row.getCell(7).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

    // 背景色と赤字ルール
    const hasCurrTemp = currExcl < currIncl;
    if (hasCurrTemp) {
      row.getCell(3).fill = FILL_YELLOW;
      row.getCell(4).fill = FILL_YELLOW;
      row.getCell(3).font = FONT_RED;
    }

    if (nextIncl !== currIncl) {
      // D列（今年度・臨任含む）とE列（来年度・臨任含む）で人数が増減した行は「緑」
      row.getCell(5).fill = FILL_GREEN;
    } else if (hasCurrTemp && currIncl === nextIncl) {
      // 今年度臨任がいて来年度も同数維持または補充された行は「青」＋増減赤字
      row.getCell(5).fill = FILL_BLUE;
      if (diff !== 0) {
        row.getCell(6).font = FONT_RED;
      }
    }

    // 罫線設定（部局ブロック境界は実線thin、ブロック内は点線hair）
    const topStyle = idx === 0 ? 'double' : (rowDef.isGroupStart ? 'thin' : 'hair');
    const bottomStyle = rowDef.isGroupEnd ? 'thin' : 'hair';

    for (let c = 1; c <= 7; c++) {
      row.getCell(c).border = {
        top: { style: topStyle, color: { argb: 'FF000000' } },
        bottom: { style: bottomStyle, color: { argb: 'FF000000' } },
        left: c === 1 ? { style: 'thin', color: { argb: 'FF000000' } } : { style: 'hair', color: { argb: 'FF000000' } },
        right: c === 7 ? { style: 'thin', color: { argb: 'FF000000' } } : { style: 'hair', color: { argb: 'FF000000' } }
      };
    }
  });

  // --- 計行 ---
  const lastDataRow = firstDataRow + tableRows.length - 1;
  const totalRowIdx = lastDataRow + 1;
  const totalRow = ws.getRow(totalRowIdx);
  totalRow.height = 22;

  ws.mergeCells(totalRowIdx, 1, totalRowIdx, 2);
  totalRow.getCell(1).value = '計';
  totalRow.getCell(1).font = FONT_BASE;
  totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  totalRow.getCell(3).value = { formula: `SUM(C${firstDataRow}:C${lastDataRow})`, result: totalCurrExcl };
  totalRow.getCell(4).value = { formula: `SUM(D${firstDataRow}:D${lastDataRow})`, result: totalCurrIncl };
  totalRow.getCell(5).value = { formula: `SUM(E${firstDataRow}:E${lastDataRow})`, result: totalNextIncl };
  totalRow.getCell(6).value = { formula: `E${totalRowIdx}-C${totalRowIdx}`, result: totalNextIncl - totalCurrExcl };

  for (let c = 3; c <= 6; c++) {
    const cell = totalRow.getCell(c);
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
    cell.numFmt = c === 6 ? NUM_FMT_DIFF : NUM_FMT_COUNT;
    cell.font = (c === 3 || c === 6) ? FONT_RED : FONT_BASE;
    if (c <= 5) {
      cell.fill = FILL_YELLOW;
    }
  }

  for (let c = 1; c <= 7; c++) {
    totalRow.getCell(c).border = {
      top: { style: 'double', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      left: c === 1 ? { style: 'thin', color: { argb: 'FF000000' } } : (c === 2 ? undefined : { style: 'hair', color: { argb: 'FF000000' } }),
      right: c === 7 ? { style: 'thin', color: { argb: 'FF000000' } } : (c === 1 ? undefined : { style: 'hair', color: { argb: 'FF000000' } })
    };
  }

  // =========================================================================
  // 下部集計・内訳エリアの自動集計
  // =========================================================================
  const currRegularEmps = activeEmps.filter(e => classifyEmployee(e, false) === 'regular');
  const currYakushokuEmps = activeEmps.filter(e => classifyEmployee(e, false) === 'yakushoku');
  const currSaininyoEmps = activeEmps.filter(e => classifyEmployee(e, false) === 'saininyo');
  const currNonTempTotal = currRegularEmps.length + currYakushokuEmps.length + currSaininyoEmps.length;

  const nextRegularEmps = activeEmps.filter(e => classifyEmployee(e, true) === 'regular');
  const nextYakushokuEmps = activeEmps.filter(e => classifyEmployee(e, true) === 'yakushoku');
  const nextSaininyoEmps = activeEmps.filter(e => classifyEmployee(e, true) === 'saininyo');
  const nextNewHireEmps = activeEmps.filter(e => classifyEmployee(e, true) === 'new_hire');

  const nextWithoutNewHireTotal = nextRegularEmps.length + nextYakushokuEmps.length + nextSaininyoEmps.length;
  const nextNonTempTotal = nextWithoutNewHireTotal + nextNewHireEmps.length;
  const nextTempShortage = totalNextIncl - nextNonTempTotal;

  // R8正規から外れた人（60歳到達・役職定年移行・退職・短時間移行など）の分類
  const regularToYakushokuOrRetire60 = [];
  const regularToShortTime = [];
  const regularToOtherRetire = [];
  currRegularEmps.forEach(emp => {
    const nextCat = classifyEmployee(emp, true);
    if (nextCat === 'regular') return;
    const nextRem = String(emp.nextEmploymentType || '');
    if (nextCat === 'yakushoku' || nextRem.includes('役職定年')) {
      regularToYakushokuOrRetire60.push(emp);
    } else if (nextCat === 'excluded') {
      regularToShortTime.push(emp);
    } else {
      regularToOtherRetire.push(emp);
    }
  });

  // 新たにR9で正規に入った人（再採用など、新採を除く）
  const newlyJoinedRegular = nextRegularEmps.filter(emp => classifyEmployee(emp, false) !== 'regular');

  // R8役職定年から外れた人（定年退職→再任用フルなど）
  const yakushokuLeavers = currYakushokuEmps.filter(emp => classifyEmployee(emp, true) !== 'yakushoku');
  // 新たにR9役職定年になった人
  const newlyYakushoku = nextYakushokuEmps.filter(emp => classifyEmployee(emp, false) !== 'yakushoku');

  // R8再任用フルから外れた人（短時間移行・任期満了/臨任移行など）
  const saininyoLeavers = currSaininyoEmps.filter(emp => classifyEmployee(emp, true) !== 'saininyo');
  const saininyoToShort = saininyoLeavers.filter(emp => classifyEmployee(emp, true) === 'excluded');
  const saininyoToExpired = saininyoLeavers.filter(emp => classifyEmployee(emp, true) !== 'excluded');
  // 新たにR9再任用フルになった人
  const newlySaininyo = nextSaininyoEmps.filter(emp => classifyEmployee(emp, false) !== 'saininyo');

  // 詳細テキストの組み立て
  const detailParts = [`${currNonTempTotal}名`];
  if (regularToYakushokuOrRetire60.length > 0) {
    detailParts.push(`-${regularToYakushokuOrRetire60.length}名(定年退職)`);
  }
  if (yakushokuLeavers.length > 0) {
    detailParts.push(`-${yakushokuLeavers.length}名(役職退職)`);
  }
  if (regularToShortTime.length > 0) {
    detailParts.push(`-${regularToShortTime.length}名(定年前再任用短時間)`);
  }
  if (regularToOtherRetire.length > 0) {
    detailParts.push(`-${regularToOtherRetire.length}名(早期退職)`);
  }
  if (saininyoLeavers.length > 0) {
    const subBreak = [];
    if (saininyoToShort.length > 0) subBreak.push(`短時間${saininyoToShort.length}名`);
    if (saininyoToExpired.length > 0) subBreak.push(`任期満了${saininyoToExpired.length}名`);
    const subStr = subBreak.length > 0 ? `：${subBreak.join('、')}` : '';
    detailParts.push(`-${saininyoLeavers.length}名(再任用フル(副主査)${subStr})`);
  }
  if (newlyYakushoku.length > 0) {
    detailParts.push(`＋${newlyYakushoku.length}名(役職定年フル(副主任))`);
  }
  if (newlySaininyo.length > 0) {
    detailParts.push(`＋${newlySaininyo.length}名(再任用フル(副主査))`);
  }
  if (newlyJoinedRegular.length > 0) {
    detailParts.push(`＋${newlyJoinedRegular.length}名(再採用)`);
  }
  const detailFormulaText = `【${detailParts.join('')}】`;

  // 正規職員の右欄内訳テキスト組み立て
  const regFormulaParts = [`${currRegularEmps.length}名`];
  if (regularToYakushokuOrRetire60.length > 0) {
    regFormulaParts.push(`- ${regularToYakushokuOrRetire60.length}名（${regularToYakushokuOrRetire60.map(formatShortName).join('、')}）`);
  }
  if (regularToShortTime.length > 0) {
    regFormulaParts.push(`- ${regularToShortTime.length}名（${regularToShortTime.map(formatShortName).join('、')}）`);
  }
  if (regularToOtherRetire.length > 0) {
    regFormulaParts.push(`- ${regularToOtherRetire.length}名（${regularToOtherRetire.map(formatShortName).join('、')}）`);
  }
  if (newlyJoinedRegular.length > 0) {
    regFormulaParts.push(`＋ ${newlyJoinedRegular.length}名（${newlyJoinedRegular.map(formatShortName).join('、')}）`);
  }
  const regBreakdownText = regFormulaParts.join(' ');

  // 新規採用職員の試験区分集計
  const newHireCategories = {};
  nextNewHireEmps.forEach(emp => {
    const rem = String(emp.nextEmploymentType || '');
    const m = rem.match(/[（(]([^）)]+)[）)]/);
    const cat = m ? m[1] : '通常枠';
    newHireCategories[cat] = (newHireCategories[cat] || 0) + 1;
  });
  const newHireBreakdownText = Object.entries(newHireCategories)
    .map(([k, cnt]) => `${k}（${cnt}名）`)
    .join('、');

  let curRow = totalRowIdx + 1;

  // 1. ○R8.4林学職員数
  const rCurrSummary = ws.getRow(curRow++);
  rCurrSummary.height = 17;
  rCurrSummary.getCell(1).value = `○R${currEraNum}.4林学職員数　${currNonTempTotal}名【正規職員${currRegularEmps.length}名、役職定年${currYakushokuEmps.length}名、再任用フルタイム${currSaininyoEmps.length}名含む】`;
  rCurrSummary.getCell(1).font = FONT_FOOTER_MAIN;
  rCurrSummary.getCell(1).alignment = { vertical: 'middle' };

  // 2. 【※R8内訳：...】
  const rCurrDetail = ws.getRow(curRow++);
  rCurrDetail.height = 16;
  const currYakushokuNames = currYakushokuEmps.map(formatShortName).join('、');
  const currSaininyoNames = currSaininyoEmps.map(formatShortName).join('、');
  rCurrDetail.getCell(1).value = `　　【※R${currEraNum}内訳：現役${currRegularEmps.length}名＋役職定年${currYakushokuEmps.length}名（${currYakushokuNames}）＋再任用フル${currSaininyoEmps.length}名（${currSaininyoNames}）】`;
  rCurrDetail.getCell(1).font = FONT_FOOTER_SMALL;
  rCurrDetail.getCell(1).alignment = { vertical: 'middle' };

  // 3. ○R9.4林学職員数（新規採用職員含まない）
  const rNextWithoutNew = ws.getRow(curRow++);
  rNextWithoutNew.height = 18;
  rNextWithoutNew.getCell(1).value = `○R${nextEraNum}.4林学職員数（新規採用職員含まない）`;
  rNextWithoutNew.getCell(1).font = FONT_FOOTER_MAIN;
  rNextWithoutNew.getCell(1).alignment = { vertical: 'middle' };
  rNextWithoutNew.getCell(3).value = `${nextWithoutNewHireTotal}名`;
  rNextWithoutNew.getCell(3).font = FONT_FOOTER_RED;
  rNextWithoutNew.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };

  // 4. （詳細）
  const rNextDetail = ws.getRow(curRow++);
  rNextDetail.height = 16;
  rNextDetail.getCell(1).value = '　（詳細）';
  rNextDetail.getCell(1).font = FONT_FOOTER_MAIN;
  rNextDetail.getCell(1).alignment = { vertical: 'middle' };
  rNextDetail.getCell(2).value = detailFormulaText;
  rNextDetail.getCell(2).font = FONT_FOOTER_TINY;
  rNextDetail.getCell(2).alignment = { vertical: 'middle' };

  // 5. 令和9年度林学職員 見出し
  const rNextHeader = ws.getRow(curRow++);
  rNextHeader.height = 19;
  rNextHeader.getCell(1).value = `令和${nextEraNum}年度林学職員`;
  rNextHeader.getCell(1).font = FONT_SUBTITLE;
  rNextHeader.getCell(1).alignment = { vertical: 'middle' };

  // 6. 内訳4行（正規職員、役職定年フル勤務職員、再任用フル勤務職員、令和9年度新規採用職員）
  const breakdownStartRow = curRow;
  const breakdownItems = [
    {
      label: '正規職員',
      count: nextRegularEmps.length,
      desc: regBreakdownText
    },
    {
      label: '役職定年フル勤務職員',
      count: nextYakushokuEmps.length,
      desc: nextYakushokuEmps.map(formatShortName).join('、')
    },
    {
      label: '再任用フル勤務職員',
      count: nextSaininyoEmps.length,
      desc: nextSaininyoEmps.map(formatShortName).join('、')
    },
    {
      label: `令和${nextEraNum}年度新規採用職員`,
      count: nextNewHireEmps.length,
      desc: newHireBreakdownText
    }
  ];

  breakdownItems.forEach((item, idx) => {
    const rIdx = curRow++;
    const row = ws.getRow(rIdx);
    row.height = 18;
    row.getCell(1).value = item.label;
    row.getCell(1).font = FONT_SUBTITLE;
    row.getCell(1).alignment = { vertical: 'middle' };

    row.getCell(3).value = item.count;
    row.getCell(3).font = FONT_SUBTITLE;
    row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    row.getCell(3).numFmt = '#,##0" 名"';

    row.getCell(6).value = item.desc;
    row.getCell(6).font = FONT_FOOTER_MAIN;
    row.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };

    if (idx === breakdownItems.length - 1) {
      // 新規採用職員の下に実線（計の上線）
      for (let c = 1; c <= 4; c++) {
        row.getCell(c).border = { bottom: { style: 'thin', color: { argb: 'FF000000' } } };
      }
    }
  });
  const breakdownEndRow = curRow - 1;

  // 7. 計
  const subTotalRowIdx = curRow++;
  const rSubTotal = ws.getRow(subTotalRowIdx);
  rSubTotal.height = 19;
  rSubTotal.getCell(1).value = '　　　　計';
  rSubTotal.getCell(1).font = FONT_SUBTITLE;
  rSubTotal.getCell(1).alignment = { vertical: 'middle' };
  rSubTotal.getCell(3).value = {
    formula: `SUM(C${breakdownStartRow}:C${breakdownEndRow})`,
    result: nextNonTempTotal
  };
  rSubTotal.getCell(3).font = FONT_SUBTITLE;
  rSubTotal.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
  rSubTotal.getCell(3).numFmt = '#,##0" 名"';

  // 8. 令和9年度配置案(人数)
  const planCountRowIdx = curRow++;
  const rPlanCount = ws.getRow(planCountRowIdx);
  rPlanCount.height = 19;
  rPlanCount.getCell(1).value = `令和${nextEraNum}年度配置案(人数)`;
  rPlanCount.getCell(1).font = FONT_SUBTITLE;
  rPlanCount.getCell(1).alignment = { vertical: 'middle' };
  rPlanCount.getCell(3).value = {
    formula: `E${totalRowIdx}`,
    result: totalNextIncl
  };
  rPlanCount.getCell(3).font = FONT_SUBTITLE;
  rPlanCount.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
  rPlanCount.getCell(3).numFmt = '#,##0" 名"';

  // 9. 臨時的任用職員
  const tempShortageRowIdx = curRow++;
  const rTempShortage = ws.getRow(tempShortageRowIdx);
  rTempShortage.height = 19;
  rTempShortage.getCell(1).value = '臨時的任用職員';
  rTempShortage.getCell(1).font = FONT_SUBTITLE;
  rTempShortage.getCell(1).alignment = { vertical: 'middle' };
  rTempShortage.getCell(3).value = {
    formula: `C${planCountRowIdx}-C${subTotalRowIdx}`,
    result: nextTempShortage
  };
  rTempShortage.getCell(3).font = FONT_SUBTITLE;
  rTempShortage.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
  rTempShortage.getCell(3).numFmt = '#,##0" 名"';

  rTempShortage.getCell(6).value = `${totalNextIncl}名 － ${nextNonTempTotal}名 ＝ ${nextTempShortage}名不足（ ${nextTempShortage}名 → 臨時任用職員で対応）`;
  rTempShortage.getCell(6).font = FONT_SUBTITLE;
  rTempShortage.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };

  return ws;
};
