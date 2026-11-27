import ExcelJS from 'exceljs';
import { analyzeChainTransfers, getReason, toReiwa, chunkArray } from './chainTransferParser.js';
import { GRADE_TO_PROMO_KEY, GRADE_LEVELS } from '../constants/config.js';
import { getEmpCurrentYears, getEmpTitleYears, getFormattedNameWithPrefix, calculateGradeYears, getMidYearPromoRemark, getPromoRemark, buildDeptMap, traverseOrgTree } from './helpers.js';
import { saveWorkbook } from './exportExcel.js';
import { addReasonSheet } from './exportReasonSheet.js';
import { generateDesignatedChangeStats } from './designatedChangeUtils.js';
import { extractDesignatedPromoLists } from './promotionUtils.js';

// Utils
const isDesignated = (grade, title) => {
  const g = String(grade || ''), t = String(title || '');
  const isHosa1 = g.includes('補佐級I(') || g.includes('補佐級Ⅰ') || g.includes('主任');
  if (g.includes('補佐級') && !isHosa1) return true;
  if (g.includes('課長級') || g.includes('所属長級') || g.includes('次長級') || g.includes('部長級') || g.includes('指定職')) return true;
  if (['局長', '次長', '課長', '参事', '部長', '場長', '班長', '専門技術員', '企画員', '主幹'].some(k => t.includes(k))) return true;
  return false;
};



const getEmpNo = (emp) => {
  const no = emp?.employeeNumber || emp?.employeeId || emp?.['職員番号'] || emp?.id || '';
  const str = String(no).trim();
  return /[a-zA-Z_\-]/.test(str) ? '' : str;
};

// 1. 指定職人事異動
const addModalDesignatedSheet = (workbook, sheetName, targetYear, moves, retentions, movesByToPost) => {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 2 }] });
  
  let desigRows = [];
  const usedToMoves = new Set();
  
  const getDisplayGrade = (gradeStr) => {
    const g = String(gradeStr || '');
    if (g.includes('補佐級II') || g.includes('補佐級III')) return '班長級';
    if (g.includes('補佐級I(') || g.includes('係長級') || g.includes('主任') || g.includes('主査')) return '';
    return g;
  };
  
  moves.forEach(move => {
    if (move.fromPost.type === 'unassigned' || move.fromPost.type === 'retired') return;
    const isFromDesig = isDesignated(move.emp.currentGrade, move.fromPost.title);
    
    const incomingMoves = (movesByToPost[move.fromPostId] || []).filter(m => !usedToMoves.has(m));
    let successor = null;
    if (incomingMoves.length > 0) {
      successor = incomingMoves[0];
      usedToMoves.add(successor);
    }
    const isToDesig = successor ? isDesignated(successor.emp.nextGrade, successor.toPost.title) : false;

    if (isFromDesig || isToDesig) {
       desigRows.push({
         postLabel: (move.fromPost.fullDept || move.fromPost.dept) + ' ' + (move.fromPost.title || ''),
         gradeLabel: getDisplayGrade(move.emp.currentGrade),
         predecessor: move, successor
       });
    }
  });

  moves.forEach(move => {
    if (!usedToMoves.has(move)) {
      if (move.toPost.type === 'retired' || move.toPost.type === 'unassigned') return;
      if (isDesignated(move.emp.nextGrade, move.toPost.title)) {
        desigRows.push({
          postLabel: (move.toPost.fullDept || move.toPost.dept) + ' ' + (move.toPost.title || ''),
          gradeLabel: getDisplayGrade(move.emp.nextGrade),
          predecessor: null, successor: move
        });
      }
    }
  });

  retentions.forEach(move => {
    if (isDesignated(move.emp.currentGrade, move.fromPost.title) || isDesignated(move.emp.nextGrade, move.toPost.title)) {
       desigRows.push({
         postLabel: (move.fromPost.fullDept || move.fromPost.dept) + ' ' + (move.fromPost.title || ''),
         gradeLabel: getDisplayGrade(move.emp.currentGrade),
         predecessor: move, successor: move, isRetention: true
       });
    }
  });

  desigRows = desigRows.map(row => {
    const isRetention = row.isRetention;
    const pred = row.predecessor?.emp || {};
    const succ = row.successor?.emp || {};
    const succPost = row.successor?.fromPost || {};
    
    let predReason = isRetention ? '留任' : (row.predecessor ? (row.predecessor.toPost.type === 'retired' ? '退職' : '転任') : '（新設）');
    
    let succRemark = '';
    if (row.successor) {
      const cGrade = row.successor.emp.currentGrade || '';
      const nGrade = row.successor.emp.nextGrade || '';
      const promoStr = getPromoRemark(cGrade, nGrade);
      
      if (promoStr) {
         succRemark = promoStr;
      }
    }

    const sMid = succ ? getMidYearPromoRemark(succ) : '';
    if (sMid) {
      succRemark = succRemark ? `${succRemark}\n(${sMid})` : `(${sMid})`;
    }

    let displaySuccName = '', displaySuccAge = '', displaySuccCurrentYears = '', displaySuccTitleYears = '', displaySuccGradeYears = '', displaySuccPostLabel = '';
    if (!isRetention) {
       displaySuccName = succ.name || (row.predecessor && !row.successor ? '後任なし' : '');
       displaySuccAge = succ.ageNextYear ?? succ.age ?? '';
       displaySuccCurrentYears = row.successor ? (succ.currentYears || '') : '';
       displaySuccTitleYears = row.successor ? getEmpTitleYears(succ) : '';
       displaySuccGradeYears = succ ? calculateGradeYears(succ, targetYear) : '';
       displaySuccPostLabel = succPost.type === 'unassigned' ? '' : ((succPost.fullDept || succPost.dept || '') + ' ' + (succPost.title || ''));
    }

    return {
      postLabel: row.postLabel,
      gradeLabel: row.gradeLabel,
      predName: pred.name || '',
      predAge: pred.ageNextYear ?? pred.age ?? '',
      predCurrentYears: row.predecessor ? (getEmpCurrentYears(pred, targetYear - 1, false) || '') : '',
      predTitleYears: row.predecessor ? getEmpTitleYears(pred) : '',
      predGradeYears: pred ? calculateGradeYears(pred, targetYear) : '',
      predReason: predReason,
      succName: displaySuccName,
      succAge: displaySuccAge,
      succCurrentYears: displaySuccCurrentYears,
      succTitleYears: displaySuccTitleYears,
      succGradeYears: displaySuccGradeYears,
      succPostLabel: displaySuccPostLabel,
      succRemark: succRemark
    };
  });

  desigRows.sort((a, b) => {
    const levelA = GRADE_LEVELS[a.gradeLabel] || 0;
    const levelB = GRADE_LEVELS[b.gradeLabel] || 0;
    if (levelA !== levelB) {
      return levelB - levelA;
    }
    const gyA = Number(a.predGradeYears) || 0;
    const gyB = Number(b.predGradeYears) || 0;
    return gyB - gyA;
  });

  const targetYearR = toReiwa(targetYear);
  const prevYearR = targetYearR - 1;
  const currentConfigTitle = `令和${prevYearR}年度配置（R${prevYearR}.12.1現在）`;

  sheet.mergeCells('A1:A2');
  sheet.getCell('A1').value = `格付`;
  
  sheet.mergeCells('B1:B2');
  sheet.getCell('B1').value = '所属・職名';
  
  sheet.mergeCells('C1:H1');
  sheet.getCell('C1').value = currentConfigTitle;
  
  sheet.mergeCells('I1:O1');
  sheet.getCell('I1').value = `令和${targetYearR}年度配置（案）`;

  const headersBottom = [
    '氏　名',
    `年齢\nR${targetYearR}.4.1\n時点`,
    `現所属\n年数\nR${targetYearR}.3.31\n時点`,
    `在職\n年数\nR${targetYearR}.3.31\n時点`,
    `現格付\n年数\nR${targetYearR}.3.31\n時点`,
    '異動案',
    '氏名',
    `年齢\nR${targetYearR}.4.1\n時点`,
    `現所属\n年数\nR${targetYearR}.3.31\n時点`,
    `在職\n年数\nR${targetYearR}.3.31\n時点`,
    `現格付\n年数\nR${targetYearR}.3.31\n時点`,
    `R${prevYearR}年度 所属・職名`,
    '備　考'
  ];
  
  headersBottom.forEach((h, i) => {
    sheet.getCell(2, i + 3).value = h;
  });

  sheet.getRow(1).height = 23.25;
  sheet.getRow(2).height = 57;

  for (let r = 1; r <= 2; r++) {
    for (let c = 1; c <= 15; c++) {
      const cell = sheet.getCell(r, c);
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      
      let bottomStyle = r === 2 ? 'medium' : 'thin';
      let rightStyle = [1, 2, 8].includes(c) ? 'medium' : 'thin';
      
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style: bottomStyle}, right: {style: rightStyle} };
    }
  }

  desigRows.forEach((r, i) => {
    const row = sheet.addRow([
      r.gradeLabel, r.postLabel, r.predName, r.predAge, r.predCurrentYears, r.predTitleYears, r.predGradeYears,
      r.predReason,
      r.succName, r.succAge, r.succCurrentYears, r.succTitleYears, r.succGradeYears, r.succPostLabel, r.succRemark
    ]);
    
    const nextRow = desigRows[i + 1];
    const isGradeChanged = nextRow && nextRow.gradeLabel !== r.gradeLabel;
    const borderBottomStyle = isGradeChanged ? 'medium' : 'thin';

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      let rightStyle = [1, 2, 8].includes(colNumber) ? 'medium' : 'thin';
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style: borderBottomStyle}, right: {style: rightStyle} };
      if ([1, 4, 5, 6, 7, 8, 10, 11, 12, 13].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });
  });

  sheet.columns = [
    { width: 10 }, { width: 26 }, { width: 15 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 },
    { width: 10 }, { width: 15 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 26 }, { width: 18 }
  ];
};

// 1-2. 指定職の増減
const addModalDesignatedChangeSheet = (workbook, sheetName, targetYear, departments, employees) => {
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  const gradeStats = generateDesignatedChangeStats(departments, employees);
  const targetYearR = toReiwa(targetYear);
  const prevYearR = targetYearR - 1;

  sheet.columns = [
    { width: 28 }, // A: [廃止] 所属・職名 / 令和8年度 指定職数（A）ラベル
    { width: 10 }, // B: [廃止] 理由(左) / （A）数値
    { width: 26 }, // C: [廃止] 理由(右)
    { width: 8 },  // D: [廃止] 人数
    { width: 28 }, // E: [新設] 所属・職名
    { width: 12 }, // F: [新設] 理由(左) / 格付ラベル
    { width: 24 }, // G: [新設] 理由(右)
    { width: 8 }   // H: [新設] 人数 / （A-B+C）数値
  ];

  const grayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };

  // タイトル行
  sheet.getCell('A1').value = '■指定職の増減様式';
  sheet.getCell('A1').font = { bold: true, size: 13 };
  sheet.getRow(1).height = 26;

  let curRow = 3;

  gradeStats.forEach(block => {
    const slotCount = Math.max(block.abolishedItems.length, block.createdItems.length, 3);

    // 1. 上部行：令和8年度 指定職数（A） / 格付
    const rInfo = curRow;
    sheet.getRow(rInfo).height = 22;

    const cellALabel = sheet.getCell(rInfo, 1);
    cellALabel.value = `令和${prevYearR}年度 指定職数　（Ａ）`;
    cellALabel.font = { bold: true };
    cellALabel.fill = grayFill;
    cellALabel.alignment = { vertical: 'middle', horizontal: 'center' };
    cellALabel.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    const cellAVal = sheet.getCell(rInfo, 2);
    cellAVal.value = block.currCount;
    cellAVal.font = { bold: true };
    cellAVal.alignment = { vertical: 'middle', horizontal: 'center' };
    cellAVal.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    const cellGradeLbl = sheet.getCell(rInfo, 6);
    cellGradeLbl.value = '格付：';
    cellGradeLbl.font = { bold: true };
    cellGradeLbl.alignment = { vertical: 'middle', horizontal: 'right' };

    sheet.mergeCells(rInfo, 7, rInfo, 8);
    const cellGradeVal = sheet.getCell(rInfo, 7);
    cellGradeVal.value = block.grade;
    cellGradeVal.font = { bold: true, size: 11 };
    cellGradeVal.alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.getCell(rInfo, 7).border = { bottom: { style: 'medium' } };
    sheet.getCell(rInfo, 8).border = { bottom: { style: 'medium' } };

    // 2. テーブルヘッダー1段目：廃止 / 新設
    const rHdr1 = curRow + 1;
    sheet.getRow(rHdr1).height = 20;
    sheet.mergeCells(rHdr1, 1, rHdr1, 4);
    sheet.mergeCells(rHdr1, 5, rHdr1, 8);
    sheet.getCell(rHdr1, 1).value = '廃　　　　　止';
    sheet.getCell(rHdr1, 5).value = '新　　　　　設';

    for (let c = 1; c <= 8; c++) {
      const cell = sheet.getCell(rHdr1, c);
      cell.font = { bold: true };
      cell.fill = grayFill;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium' },
        bottom: { style: 'thin' },
        left: { style: c === 1 || c === 5 ? 'medium' : 'thin' },
        right: { style: c === 4 || c === 8 ? 'medium' : 'thin' }
      };
    }

    // 3. テーブルヘッダー2段目：所属・職名 / 理由 / 人数
    const rHdr2 = curRow + 2;
    sheet.getRow(rHdr2).height = 20;
    sheet.mergeCells(rHdr2, 2, rHdr2, 3);
    sheet.mergeCells(rHdr2, 6, rHdr2, 7);
    sheet.getCell(rHdr2, 1).value = '所　属　・　職　名';
    sheet.getCell(rHdr2, 2).value = '理　　　由';
    sheet.getCell(rHdr2, 4).value = '人数';
    sheet.getCell(rHdr2, 5).value = '所　属　・　職　名';
    sheet.getCell(rHdr2, 6).value = '理　　　由';
    sheet.getCell(rHdr2, 8).value = '人数';

    for (let c = 1; c <= 8; c++) {
      const cell = sheet.getCell(rHdr2, c);
      cell.font = { bold: true };
      cell.fill = grayFill;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'medium' },
        left: { style: c === 1 || c === 5 ? 'medium' : 'thin' },
        right: { style: c === 4 || c === 8 ? 'medium' : 'thin' }
      };
    }

    // 4. 明細行
    const rDataStart = curRow + 3;
    const rDataEnd = rDataStart + slotCount - 1;

    for (let idx = 0; idx < slotCount; idx++) {
      const r = rDataStart + idx;
      sheet.getRow(r).height = 36;
      sheet.mergeCells(r, 2, r, 3);
      sheet.mergeCells(r, 6, r, 7);

      const ab = block.abolishedItems[idx];
      const cr = block.createdItems[idx];

      sheet.getCell(r, 1).value = ab ? ab.postLabel : '';
      sheet.getCell(r, 2).value = '';
      sheet.getCell(r, 4).value = ab ? ab.count : null;
      sheet.getCell(r, 5).value = cr ? cr.postLabel : '';
      sheet.getCell(r, 6).value = '';
      sheet.getCell(r, 8).value = cr ? cr.count : null;

      for (let c = 1; c <= 8; c++) {
        const cell = sheet.getCell(r, c);
        cell.alignment = {
          vertical: 'middle',
          horizontal: (c === 4 || c === 8) ? 'center' : 'left',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: c === 1 || c === 5 ? 'medium' : 'thin' },
          right: { style: c === 4 || c === 8 ? 'medium' : 'thin' }
        };
      }
    }

    // 5. 合計行（B / C）
    const rTotal = rDataEnd + 1;
    sheet.getRow(rTotal).height = 22;
    sheet.mergeCells(rTotal, 1, rTotal, 3);
    sheet.mergeCells(rTotal, 5, rTotal, 7);

    sheet.getCell(rTotal, 1).value = '合　　　計　　（Ｂ）';
    sheet.getCell(rTotal, 4).value = { formula: `SUM(D${rDataStart}:D${rDataEnd})`, result: block.abolishedTotal };
    sheet.getCell(rTotal, 5).value = '合　　　計　　（Ｃ）';
    sheet.getCell(rTotal, 8).value = { formula: `SUM(H${rDataStart}:H${rDataEnd})`, result: block.createdTotal };

    for (let c = 1; c <= 8; c++) {
      const cell = sheet.getCell(rTotal, c);
      cell.font = { bold: true };
      cell.fill = grayFill;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: c === 1 || c === 5 ? 'medium' : 'thin' },
        right: { style: c === 4 || c === 8 ? 'medium' : 'thin' }
      };
    }

    // 6. 来年度 指定職数（A - B + C）
    const rNext = rTotal + 1;
    sheet.getRow(rNext).height = 24;
    sheet.mergeCells(rNext, 5, rNext, 7);

    sheet.getCell(rNext, 5).value = `令和${targetYearR}年度 指定職数（Ａ－Ｂ＋Ｃ）`;
    sheet.getCell(rNext, 8).value = { formula: `B${rInfo}-D${rTotal}+H${rTotal}`, result: block.nextCount };

    for (let c = 5; c <= 8; c++) {
      const cell = sheet.getCell(rNext, c);
      cell.font = { bold: true };
      if (c < 8) cell.fill = grayFill;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'medium' },
        bottom: { style: 'medium' },
        left: { style: c === 5 ? 'medium' : 'thin' },
        right: { style: c === 8 ? 'medium' : 'thin' }
      };
    }

    curRow = rNext + 2;
  });

  // 記載上の留意事項
  const notesLines = [
    '１　《格付》欄は、「部長級・次長級・所属長級・課長級・班長級」の別を記載してください。',
    '　　なお、次長級の所属長職は、「次長級」に分類してください。',
    '　　課長補佐級は、本庁班長、出先課長ポスト以上について記載してください。',
    '２　職種変更の場合も記載してください。',
    '　　また、格付変更の場合は、各々の格付の「廃止」「新設」欄に記載してください。',
    '３　理由欄は、その必要性が分かるよう詳細に記載してください（必要に応じて資料を添付してください。）。'
  ];
  notesLines.forEach((line, idx) => {
    const r = curRow + idx;
    sheet.getCell(r, 1).value = line;
    sheet.getCell(r, 1).font = { size: 9.5 };
    sheet.getRow(r).height = 18;
  });
};

// 2. 異動案リスト
const addModalListSheet = (workbook, sheetName, targetYear, moves, movesByToPost, departments, retentions, employees) => {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  
    const { deptMap, currMap, nextMap } = buildDeptMap(departments, employees);
    const currOrderMap = {};
    const nextOrderMap = {};
    let order = 0;
    traverseOrgTree(departments, deptMap, currMap, nextMap, 0, (dept, group, title, curr, nxt, type) => {
      if (type === 'system') return;
      if (curr) currOrderMap[curr.id] = order;
      if (nxt) nextOrderMap[nxt.id] = order;
      order++;
    });
  let listRows = [];
  const usedToMoves = new Set();
  
  moves.forEach(move => {
    if (move.fromPost.type === 'unassigned') return;
    const incomingMoves = (movesByToPost[move.fromPostId] || []).filter(m => !usedToMoves.has(m));
    let successor = null;
    if (incomingMoves.length > 0) {
      successor = incomingMoves[0];
      usedToMoves.add(successor);
    }
    const reason = move.toPost.type === 'retired' ? '退職' : `異動(${move.toPost.label})`;
    listRows.push({ predecessor: move, successor, reason });
  });

  moves.forEach(move => {
    if (!usedToMoves.has(move)) {
      if (move.toPost.type === 'retired' || move.toPost.type === 'unassigned') return; // 退職予定者や未配置は後任者として扱わない
      listRows.push({
        predecessor: null, successor: move,
        reason: move.fromPost.type === 'unassigned' ? '新採' : '新設'
      });
    }
  });

  retentions.forEach(ret => {
    listRows.push({
      predecessor: ret,
      successor: null,
      reason: '',
      isRetention: true
    });
  });

  listRows = listRows.map(row => {
    const pred = row.predecessor?.emp || {};
    const succ = row.successor?.emp || {};
    const predPost = row.predecessor?.fromPost || row.successor?.toPost || {};
    const succPost = row.successor?.fromPost || {};
    
    let succName = '';
    if (succ.name) {
      succName = getFormattedNameWithPrefix(succ, true);
    } else if (row.predecessor && !row.successor) {
      succName = row.isRetention ? '' : '後任なし';
    }
    
    const isPromoted = row.successor?.isPromoted || row.successor?.isPromotedToFukuShunin || row.successor?.isPromotedToShocho ? '〇' : '';

    let predEmpNo = getEmpNo(pred);
    if (pred.note && String(pred.note).includes('再フル')) {
      predEmpNo = '';
    }
    let succEmpNo = getEmpNo(succ);
    if (succ.note && String(succ.note).includes('再フル')) {
      succEmpNo = '';
    }

    let orgOrder = 999999;
    if (row.predecessor && currOrderMap[row.predecessor.emp.id] !== undefined) {
      orgOrder = currOrderMap[row.predecessor.emp.id];
    } else if (row.successor && nextOrderMap[row.successor.emp.id] !== undefined) {
      orgOrder = nextOrderMap[row.successor.emp.id];
    }

    return {
      orgOrder,
      predDeptTitle: (predPost.dept || '') + (predPost.title || ''),
      predGroup: predPost.group || '',
      predEmpNo,
      predName: pred.name ? getFormattedNameWithPrefix(pred, false) : '',
      predAge: pred.ageNextYear ?? pred.age ?? '',
      reason: row.reason,
      currentYears: getEmpCurrentYears(pred, targetYear - 1, false) || '',
      succEmpNo,
      succName,
      isPromoted,
      succAge: succ.ageNextYear ?? succ.age ?? '',
      succPostLabel: succPost.type === 'unassigned' ? '' : (succPost.label || ''),
      noteStr: succ.note || pred.note || ''
    };
  });

  listRows.sort((a, b) => a.orgOrder - b.orgOrder);

  const targetYearR = toReiwa(targetYear);
  const prevYearR = targetYearR - 1;

  const cols = [
    '所属・職名', '班係', '職員番号', '氏名', `年齢\nR${targetYearR}.4.1時点`, '事由', '現所属\n年数', 
    '後任者\n職員番号', '後任者 氏名', '昇任\n昇格', `年齢\nR${targetYearR}.4.1時点`, `R${prevYearR}年度所属・職名`, '特記事項'
  ];

  const headerRow = sheet.addRow(cols);
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: colNumber === 7 ? {style:'medium'} : {style:'thin'} };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

  listRows.forEach(r => {
    const row = sheet.addRow([
      r.predDeptTitle, r.predGroup, r.predEmpNo, r.predName, r.predAge, r.reason, r.currentYears ? r.currentYears + '年' : '',
      r.succEmpNo, r.succName, r.isPromoted, r.succAge, r.succPostLabel, r.noteStr
    ]);
    row.eachCell((cell, colNumber) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: colNumber === 7 ? {style:'medium'} : {style:'thin'} };
      if ((colNumber === 3 || colNumber === 8) && cell.value !== null && cell.value !== undefined && cell.value.toString().trim() !== '') {
        const num = Number(cell.value);
        if (!isNaN(num)) {
          cell.value = num;
          cell.numFmt = '[$-411]000000';
        }
      }
      if ([3, 5, 7, 8, 10, 11].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });
  });

  sheet.columns = [
    { width: 25 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 8 }, { width: 18 }, { width: 10 },
    { width: 12 }, { width: 15 }, { width: 8 }, { width: 8 }, { width: 25 }, { width: 25 }
  ];
};

// 4. 3年未満特記
const addModalShortTenureSheet = (workbook, sheetName, targetYear, moves) => {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  
  let shortRows = [];
  moves.forEach(move => {
    if (move.fromPost.type === 'unassigned' || move.fromPost.type === 'retired') return;
    if (move.toPost.type === 'unassigned' && !move.toPost.dept) return;
    if (move.toPost.type === 'retired') return;
    if (move.emp && move.emp.note && String(move.emp.note).includes('臨任')) return;
    
    const currentYearsStr = getEmpCurrentYears(move.emp, targetYear - 1, false);
    const currentYears = Number(currentYearsStr);
    
    if (currentYears < 3 && !isNaN(currentYears)) {
      shortRows.push({
        name: move.emp.name || '',
        oldPost: (move.fromPost.fullDept || move.fromPost.dept || '') + ' ' + (move.fromPost.title || ''),
        newPost: move.toPost.type === 'unassigned' ? '未配置' : ((move.toPost.fullDept || move.toPost.dept || '') + ' ' + (move.toPost.title || '')),
        years: currentYears
      });
    }
  });

  shortRows.sort((a, b) => a.oldPost.localeCompare(b.oldPost));

  const headers = ['氏名', '旧所属名及び職名', '新所属名及び職名', '異動理由', '年数'];
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

  shortRows.forEach(r => {
    const row = sheet.addRow([r.name, r.oldPost, r.newPost, '', r.years]);
    row.eachCell((cell, colNumber) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      cell.alignment = { vertical: 'middle', horizontal: [1, 5].includes(colNumber) ? 'center' : 'left', wrapText: true };
    });
  });

  sheet.columns = [
    { width: 15 }, { width: 30 }, { width: 30 }, { width: 40 }, { width: 8 }
  ];
};

// 5. 6年以上特記
const addModalLongTenureSheet = (workbook, sheetName, targetYear, employees, deptMap) => {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  
  let longRows = [];
  employees.forEach(emp => {
    const cDeptName = deptMap[emp.currentDeptId]?.name || '';
    const nDeptName = deptMap[emp.departmentId]?.name || '';
    const currentPostStr = cDeptName + (cDeptName && emp.currentTitle ? '　' : '') + (emp.currentTitle || '');
    const nextPostStr = nDeptName + (nDeptName && emp.nextTitle ? '　' : '') + (emp.nextTitle || '');
    
    const isRetained = currentPostStr === nextPostStr;
    if (!isRetained) return;
    
    if (emp.note && String(emp.note).includes('臨任')) return;
    if (emp.nextDept === '退職' || emp.currentDept === '退職') return;
    
    const currentYearsStr = getEmpCurrentYears(emp, targetYear - 1, false);
    const currentYears = Number(currentYearsStr);
    
    if (currentYears >= 5 && !isNaN(currentYears)) {
      longRows.push({
        name: emp.name || '',
        post: currentPostStr,
        years: currentYears + 1
      });
    }
  });

  longRows.sort((a, b) => a.post.localeCompare(b.post));

  const headers = ['氏名', '所属名及び職名', '特記事項', '年数'];
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

  longRows.forEach(r => {
    const row = sheet.addRow([r.name, r.post, '', r.years]);
    row.eachCell((cell, colNumber) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      cell.alignment = { vertical: 'middle', horizontal: [1, 4].includes(colNumber) ? 'center' : 'left', wrapText: true };
    });
  });

  sheet.columns = [
    { width: 15 }, { width: 35 }, { width: 50 }, { width: 8 }
  ];
};

// 6-1. 昇任者一覧（■指定職昇任者一覧様式）
const addModalPromotionSheet = (workbook, sheetName, targetYear, employees, departments) => {
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  const { promotionRows } = extractDesignatedPromoLists(employees, departments, targetYear);
  const targetYearR = toReiwa(targetYear);
  const grayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };

  sheet.columns = [
    { width: 10 }, // A: 昇任後格付
    { width: 18 }, // B: 氏　　名
    { width: 25 }, // C: 旧所属名及び職名
    { width: 25 }, // D: 新所属名及び職名
    { width: 8 },  // E: R9.4 年齢
    { width: 8 },  // F: 現格付年数
    { width: 46 }  // G: 理　　　　　　由
  ];

  sheet.getCell('A1').value = '■指定職昇任者一覧様式';
  sheet.getCell('A1').font = { bold: true, size: 12 };
  sheet.getRow(1).height = 20;

  sheet.getCell('A3').value = '※　格付順に記載して下さい。';
  sheet.mergeCells('D3:G3');
  sheet.getCell('D3').value = '職種（　　　　　　　　　　）　　担当者所属・氏名（　　　　　　　　　　　　　　　　　　　）';
  sheet.getCell('D3').alignment = { horizontal: 'right', vertical: 'middle' };
  sheet.getRow(3).height = 18;
  sheet.getRow(4).height = 6;

  const headers = [
    '昇任後\n格付',
    '氏　　名',
    '旧所属名及び職名',
    '新所属名及び職名',
    `R${targetYearR}.4\n年齢`,
    '現格付\n年数',
    '理　　　　　　由'
  ];
  sheet.getRow(5).height = 30;
  headers.forEach((h, idx) => {
    const cell = sheet.getCell(5, idx + 1);
    cell.value = h;
    cell.font = { bold: true };
    cell.fill = grayFill;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium' },
      bottom: { style: 'medium' },
      left: { style: idx === 0 ? 'medium' : 'thin' },
      right: { style: idx === 6 ? 'medium' : 'thin' }
    };
  });

  const totalSlots = Math.max(promotionRows.length, 8);
  for (let i = 0; i < totalSlots; i++) {
    const rIdx = 6 + i;
    const rowData = promotionRows[i];
    const row = sheet.getRow(rIdx);
    row.height = 30.75;

    const vals = rowData
      ? [rowData.gradeLabel, rowData.name, rowData.oldPost, rowData.newPost, rowData.age, rowData.gradeYears, '']
      : ['', '', '', '', '', '', ''];

    vals.forEach((val, cIdx) => {
      const colNumber = cIdx + 1;
      const cell = sheet.getCell(rIdx, colNumber);
      cell.value = val;
      cell.alignment = {
        vertical: 'middle',
        horizontal: [3, 4, 7].includes(colNumber) ? 'left' : 'center',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: i === totalSlots - 1 ? 'medium' : 'thin' },
        left: { style: colNumber === 1 ? 'medium' : 'thin' },
        right: { style: colNumber === 7 ? 'medium' : 'thin' }
      };
    });
  }

  const noteStartRow = 6 + totalSlots + 1;
  const notesLines = [
    '①　新指定職（補佐級（班長級）以上）の職員のうち、昇任を推薦する者について記載してください。',
    '②　格付欄は、昇任後の格付（「部長級・次長級・課長級・補佐級」の別）を記載してください。',
    '③　理由については、これまでの実績・成果を含め詳細に記載願います。'
  ];
  notesLines.forEach((line, idx) => {
    const r = noteStartRow + idx;
    sheet.getCell(r, 1).value = line;
    sheet.getCell(r, 1).font = { size: 9.5 };
    sheet.getRow(r).height = 17;
  });
};

// 6-2. 昇格者一覧（■指定職昇格者一覧様式）
const addModalAdvancementSheet = (workbook, sheetName, targetYear, employees, departments) => {
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  const { advancementRows } = extractDesignatedPromoLists(employees, departments, targetYear);
  const targetYearR = toReiwa(targetYear);
  const grayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };

  sheet.columns = [
    { width: 10 }, // A: 格付
    { width: 18 }, // B: 氏　　名
    { width: 8 },  // C: R9.4 年齢
    { width: 25 }, // D: 旧所属名及び職名
    { width: 8 },  // E: 職年数
    { width: 25 }, // F: 新所属名及び職名
    { width: 50 }  // G: 理　　由
  ];

  sheet.getCell('A1').value = '■指定職昇格者一覧様式';
  sheet.getCell('A1').font = { bold: true, size: 12 };
  sheet.getRow(1).height = 20;

  sheet.getCell('A3').value = '※　格付順に記載して下さい。';
  sheet.mergeCells('F3:G3');
  sheet.getCell('F3').value = '職種（　　　　　　　　　　）　　担当者所属・氏名（　　　　　　　　　　　　　　　　　　　）';
  sheet.getCell('F3').alignment = { horizontal: 'right', vertical: 'middle' };
  sheet.getRow(3).height = 18;
  sheet.getRow(4).height = 6;

  const headers = [
    '格付',
    '氏　　名',
    `R${targetYearR}.4\n年齢`,
    '旧所属名及び職名',
    '職年数',
    '新所属名及び職名',
    '理　　由'
  ];
  sheet.getRow(5).height = 30;
  headers.forEach((h, idx) => {
    const cell = sheet.getCell(5, idx + 1);
    cell.value = h;
    cell.font = { bold: true };
    cell.fill = grayFill;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'medium' },
      bottom: { style: 'medium' },
      left: { style: idx === 0 ? 'medium' : 'thin' },
      right: { style: idx === 6 ? 'medium' : 'thin' }
    };
  });

  const totalSlots = Math.max(advancementRows.length, 8);
  for (let i = 0; i < totalSlots; i++) {
    const rIdx = 6 + i;
    const rowData = advancementRows[i];
    const row = sheet.getRow(rIdx);
    row.height = 31.5;

    const vals = rowData
      ? [rowData.gradeLabel, rowData.name, rowData.age, rowData.oldPost, rowData.titleYears, rowData.newPost, '']
      : ['', '', '', '', '', '', ''];

    vals.forEach((val, cIdx) => {
      const colNumber = cIdx + 1;
      const cell = sheet.getCell(rIdx, colNumber);
      cell.value = val;
      cell.alignment = {
        vertical: 'middle',
        horizontal: [4, 6, 7].includes(colNumber) ? 'left' : 'center',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: i === totalSlots - 1 ? 'medium' : 'thin' },
        left: { style: colNumber === 1 ? 'medium' : 'thin' },
        right: { style: colNumber === 7 ? 'medium' : 'thin' }
      };
    });
  }

  const noteStartRow = 6 + totalSlots + 1;
  const notesLines = [
    [1, '①　新指定職（補佐級（班長級）以上）の職員のうち、昇格を推薦する者について記載してください。'],
    [1, '②　ここでいう「昇格者」とは、同一の格付内で現に任用している職より上位の職へ任用する者をいいます。'],
    [2, '※ 「スタッフ職　→　ポスト職　　例えば　主任　→　本庁班長又は出先課長」を記載して下さい。'],
    [2, '※ 「課長級　→　所属長級　例えば　本庁副課長又は振興局副部長　→　本庁課長又は振興局部長」を記載して下さい。'],
    [2, '※本庁の「◯◯班長　→　課長補佐兼◯◯班長」も記載して下さい。　※対象者は、「課長補佐級経験5年以上かつ本庁班長・出先課長3年以上経験」の職員です。'],
    [1, '③　格付欄は、「部長級・次長級・課長級・補佐級」の別を記載して下さい。'],
    [1, `④　年齢は令和${targetYearR}年４月１日現在で、職年数は現在（昇格前）の職の年数を記載願います。`],
    [1, '⑤　理由については、これまでの実績・成果を含め詳細に記載願います。']
  ];
  notesLines.forEach(([col, line], idx) => {
    const r = noteStartRow + idx;
    sheet.getCell(r, col).value = line;
    sheet.getCell(r, col).font = { size: 9.5 };
    sheet.getRow(r).height = 17;
  });
};

// 7. つなぎ表 (List style, max 4 chain links)
const addModalChainSheet = (workbook, sheetName, chains, movesByFromPost, movesByToPost) => {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  
  const headers = ['事由・氏名', '異動内容1', '異動内容2', '異動内容3', '異動内容4'];
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

  chains.forEach(chain => {
    const firstMove = chain[0];
    const lastMove = chain[chain.length - 1];
    const isLastEmpty = !(movesByToPost[lastMove.fromPostId]?.length) && lastMove.fromPost.type !== 'unassigned';
    const isRetired = firstMove.toPost.type === 'retired';
    
    const cells = [];
    chain.forEach((move, i) => {
      if (isRetired && i === 0) return;
      cells.push({ type: 'move', move });
    });
    if (isLastEmpty) cells.push({ type: 'empty', move: lastMove });

    const chunks = chunkArray(cells, 4);
    const reason = getReason(chain, movesByFromPost);
    
    chunks.forEach((chunk, idx) => {
      let rowData = ['', '', '', '', ''];
      
      if (idx === 0) {
         let reasonStr = reason + '\n';
         const post = isRetired ? firstMove.fromPost : firstMove.toPost;
         reasonStr += (post.dept || '') + '\n' + (post.title || '');
         if (isRetired) reasonStr += '\n' + (firstMove.emp?.name || '');
         rowData[0] = reasonStr;
      }
      
      chunk.forEach((cell, cIdx) => {
        if (cell.type === 'move') {
           const postTo = cell.move.toPost.type === 'retired' ? '退職' : (cell.move.toPost.type === 'unassigned' ? '未配置' : ((cell.move.toPost.dept || '') + ' ' + (cell.move.toPost.title || '')));
           const postFrom = cell.move.fromPost.type === 'unassigned' ? '未配置' : ((cell.move.fromPost.dept || '') + ' ' + (cell.move.fromPost.title || ''));
           rowData[cIdx + 1] = postTo + '\n' + (cell.move.emp?.name || '') + '\n' + postFrom;
        } else if (cell.type === 'empty') {
           rowData[cIdx + 1] = '後任なし\n' + (cell.move.fromPost.dept || '') + ' ' + (cell.move.fromPost.title || '');
        }
      });
      
      const row = sheet.addRow(rowData);
      row.eachCell(c => {
        c.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      });
    });
  });

  sheet.columns = [
    { width: 25 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }
  ];
};

export const exportModalExcel = async (fileName, targetYear, employees, departments, notes = []) => {
  const workbook = new ExcelJS.Workbook();
  const data = analyzeChainTransfers(employees, departments, targetYear);
  const { chains, movesByToPost, movesByFromPost, moves, retentions } = data;

  addModalDesignatedSheet(workbook, '指定職人事異動', targetYear, moves, retentions, movesByToPost);
  addModalDesignatedChangeSheet(workbook, '指定職の増減', targetYear, departments, employees);
  addModalListSheet(workbook, '異動案リスト', targetYear, moves, movesByToPost, departments, retentions, employees);
  
  const deptMap = {};
  departments.forEach(d => { deptMap[d.id] = d; });
  const currMap = {};
  const nextMap = {};
  
  addReasonSheet(workbook, '増減理由', targetYear, departments, deptMap, currMap, nextMap, employees, notes);
  addModalShortTenureSheet(workbook, '3年未満特記', targetYear, moves);
  addModalLongTenureSheet(workbook, '6年以上特記', targetYear, employees, deptMap);
  addModalPromotionSheet(workbook, '昇任者一覧', targetYear, employees, departments);
  addModalAdvancementSheet(workbook, '昇格者一覧', targetYear, employees, departments);
  addModalChainSheet(workbook, 'つなぎ表', chains, movesByFromPost, movesByToPost);

  await saveWorkbook(workbook, fileName);
};
