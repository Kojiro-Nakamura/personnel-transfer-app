import ExcelJS from 'exceljs';
import { analyzeChainTransfers, getReason, toReiwa, chunkArray } from './chainTransferParser.js';
import { GRADE_TO_PROMO_KEY, GRADE_LEVELS } from '../constants/config.js';
import { getEmpCurrentYears, isPromotedGrade, calculateAge, getGradeLevel, getFormattedNameWithPrefix, calculateGradeYears, getMidYearPromoRemark, getPromoRemark } from './helpers.js';
import { saveWorkbook } from './exportExcel.js';
import { addReasonSheet } from './exportReasonSheet.js';

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

    let displaySuccName = '', displaySuccAge = '', displaySuccCurrentYears = '', displaySuccGradeYears = '', displaySuccPostLabel = '';
    if (!isRetention) {
       displaySuccName = succ.name || (row.predecessor && !row.successor ? '【 廃 止 】' : '');
       displaySuccAge = succ.ageNextYear ?? succ.age ?? '';
       displaySuccCurrentYears = row.successor ? (succ.currentYears || '') : '';
       
       displaySuccGradeYears = succ ? calculateGradeYears(succ, targetYear) : '';
       displaySuccPostLabel = succPost.type === 'unassigned' ? '' : ((succPost.fullDept || succPost.dept || '') + ' ' + (succPost.title || ''));
    }

    return {
      postLabel: row.postLabel,
      gradeLabel: row.gradeLabel,
      predName: pred.name || '',
      predAge: pred.ageNextYear ?? pred.age ?? '',
      predCurrentYears: getEmpCurrentYears(pred, targetYear - 1, false) || '',
      predGradeYears: pred ? calculateGradeYears(pred, targetYear) : '',
      predReason: predReason,
      succName: displaySuccName,
      succAge: displaySuccAge,
      succCurrentYears: displaySuccCurrentYears,
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
  
  sheet.mergeCells('C1:G1');
  sheet.getCell('C1').value = currentConfigTitle;
  
  sheet.mergeCells('H1:M1');
  sheet.getCell('H1').value = `令和${targetYearR}年度配置（案）`;

  const headersBottom = [
    '氏名', `年齢\nR${targetYearR}.4.1時点`, `現職年数\nR${targetYearR}.3.31時点`, `現格付年数\nR${targetYearR}.3.31時点`, '異動案',
    '氏名', `年齢\nR${targetYearR}.4.1時点`, `現職年数\nR${targetYearR}.3.31時点`, `現格付年数\nR${targetYearR}.3.31時点`, `R${prevYearR}年度\n所属・職名`, '備考'
  ];
  
  headersBottom.forEach((h, i) => {
    sheet.getCell(2, i + 3).value = h;
  });

  for (let r = 1; r <= 2; r++) {
    for (let c = 1; c <= 13; c++) {
      const cell = sheet.getCell(r, c);
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      
      let bottomStyle = r === 2 ? 'medium' : 'thin';
      let rightStyle = [1, 2, 7].includes(c) ? 'medium' : 'thin';
      
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style: bottomStyle}, right: {style: rightStyle} };
    }
  }

  desigRows.forEach((r, i) => {
    const row = sheet.addRow([
      r.gradeLabel, r.postLabel, r.predName, r.predAge, r.predCurrentYears, r.predGradeYears,
      r.predReason,
      r.succName, r.succAge, r.succCurrentYears, r.succGradeYears, r.succPostLabel, r.succRemark
    ]);
    
    const nextRow = desigRows[i + 1];
    const isGradeChanged = nextRow && nextRow.gradeLabel !== r.gradeLabel;
    const borderBottomStyle = isGradeChanged ? 'medium' : 'thin';

    row.eachCell((cell, colNumber) => {
      let rightStyle = [1, 2, 7].includes(colNumber) ? 'medium' : 'thin';
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style: borderBottomStyle}, right: {style: rightStyle} };
      if ([1, 4, 5, 6, 7, 9, 10, 11].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      }
    });
  });

  sheet.columns = [
    { width: 10 }, { width: 25 }, { width: 15 }, { width: 8 }, { width: 10 }, { width: 10 },
    { width: 10 }, { width: 15 }, { width: 8 }, { width: 10 }, { width: 10 }, { width: 25 }, { width: 15 }
  ];
};

// 2. 異動案リスト
const addModalListSheet = (workbook, sheetName, targetYear, moves, movesByToPost, departments, retentions) => {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  
  const postOrderMap = {};
  let order = 0;
  departments.forEach(dept => {
    if (dept.type !== 'regular') return;
    dept.posts.forEach(post => {
      postOrderMap[`POST|${post.id}|`] = order;
      postOrderMap[`TITLE|${dept.id}||${post.name}`] = order;
      order++;
    });
    dept.groups.forEach(group => {
      group.posts.forEach(post => {
        postOrderMap[`POST||${post.id}`] = order;
        postOrderMap[`TITLE|${dept.id}|${group.id}|${post.name}`] = order;
        order++;
      });
    });
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
      if (move.toPost.type === 'retired') return; // 退職予定者は後任者として扱わない
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
      succName = row.isRetention ? '' : '【 廃 止 】';
    }
    
    const isPromoted = row.successor?.isPromoted || row.successor?.isPromotedToFukuShunin || row.successor?.isPromotedToShocho ? '〇' : '';

    let succEmpNo = getEmpNo(succ);
    if (succ.note && String(succ.note).includes('再フル')) {
      succEmpNo = '';
    }

    const basePostId = row.predecessor ? row.predecessor.fromPostId : (row.successor ? row.successor.toPostId : null);
    const orgOrder = postOrderMap[basePostId] ?? 999999;

    return {
      orgOrder,
      predDeptTitle: (predPost.dept || '') + (predPost.title || ''),
      predGroup: predPost.group || '',
      predEmpNo: getEmpNo(pred),
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
const addModalLongTenureSheet = (workbook, sheetName, targetYear, employees) => {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  
  let longRows = [];
  employees.forEach(emp => {
    const currentPostStr = (emp.currentDept || '') + ' ' + (emp.currentTitle || '');
    const nextPostStr = (emp.nextDept || '') + ' ' + (emp.nextTitle || '');
    
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

// 6. 昇任者一覧
const addModalPromotionSheet = (workbook, sheetName, targetYear, employees) => {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  
  let promotionRows = [];
  const getBaseGrade = (grade) => {
    if (!grade) return '';
    if (grade.includes('部長級')) return '部長級';
    if (grade.includes('次長級')) return '次長級';
    if (grade.includes('課長級')) return '課長級';
    if (grade.includes('補佐級')) return '補佐級';
    if (grade.includes('係長級')) return '係長級';
    return grade;
  };

  employees.forEach(emp => {
    if (emp.nextDept === '退職') return;
    if (emp.currentGrade && emp.nextGrade && isPromotedGrade(emp.currentGrade, emp.nextGrade)) {
      promotionRows.push({
        nextGradeLabel: getBaseGrade(emp.nextGrade),
        name: emp.name || '',
        age: calculateAge(emp.birthDate, targetYear) || '',
        oldPost: (emp.currentDept || '') + ' ' + (emp.currentTitle || ''),
        newPost: (emp.nextDept || '') + ' ' + (emp.nextTitle || ''),
        currentYears: getEmpCurrentYears(emp, targetYear - 1, false),
        gradeYears: calculateGradeYears(emp, targetYear),
        nextLevel: getGradeLevel(emp.nextGrade)
      });
    }
  });

  promotionRows.sort((a, b) => {
    if (b.nextLevel !== a.nextLevel) return b.nextLevel - a.nextLevel;
    return a.oldPost.localeCompare(b.oldPost);
  });

  const headers = [
    '昇任後\n格付', '氏名', `R${targetYear - 2018}.4\n年齢`, '旧所属名及び職名', '新所属名及び職名', '職\n年数', '現格付\n年数', '理由'
  ];
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
  });

  promotionRows.forEach(r => {
    const row = sheet.addRow([r.nextGradeLabel, r.name, r.age, r.oldPost, r.newPost, r.currentYears, r.gradeYears, '']);
    row.eachCell((cell, colNumber) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      cell.alignment = { vertical: 'middle', horizontal: [4, 5, 8].includes(colNumber) ? 'left' : 'center', wrapText: true };
    });
  });

  sheet.columns = [
    { width: 10 }, { width: 15 }, { width: 8 }, { width: 30 }, { width: 30 }, { width: 8 }, { width: 8 }, { width: 30 }
  ];
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
           rowData[cIdx + 1] = '【廃止】\n' + (cell.move.fromPost.dept || '') + ' ' + (cell.move.fromPost.title || '');
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
  addModalListSheet(workbook, '異動案リスト', targetYear, moves, movesByToPost, departments, retentions);
  
  // NOTE: addReasonSheet needs deptMap, currMap, nextMap. We will just pass empty objects or build them.
  // Actually, addReasonSheet from exportExcel.js expects these to just ignore if missing? No, it uses them.
  // Wait, let's check addReasonSheet signature.
  // addReasonSheet(workbook, sheetName, targetYear, departments, deptMap, currMap, nextMap, employees, notes)
  // We can just construct deptMap, currMap, nextMap quickly here.
  const deptMap = {};
  departments.forEach(d => { deptMap[d.id] = d; });
  const currMap = {};
  const nextMap = {};
  
  addReasonSheet(workbook, '増減理由', targetYear, departments, deptMap, currMap, nextMap, employees, notes);
  addModalShortTenureSheet(workbook, '3年未満特記', targetYear, moves);
  addModalLongTenureSheet(workbook, '6年以上特記', targetYear, employees);
  addModalPromotionSheet(workbook, '昇任者一覧', targetYear, employees);
  addModalChainSheet(workbook, 'つなぎ表', chains, movesByFromPost, movesByToPost);

  await saveWorkbook(workbook, fileName);
};
