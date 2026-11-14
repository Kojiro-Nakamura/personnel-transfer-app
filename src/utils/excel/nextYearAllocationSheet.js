import { GRADE_LEVELS } from '../../constants/config.js';
import { getGradeLevel, isTempRemark } from '../helpers.js';

// 添付エクセル（様式２：３．次年度配置案）の標準所属並び順と表記
const STANDARD_DEPT_ROWS = [
  { displayName: '情報基盤課', matchNames: ['情報基盤課'] },
  { displayName: '自然環境課', matchNames: ['自然環境課'] },
  { displayName: '成長産業推進課', matchNames: ['成長産業推進課'] },
  { displayName: '農林水産振興課', matchNames: ['農林水産振興課'] },
  { displayName: '研究推進課', matchNames: ['研究推進課'] },
  { displayName: '林業振興課', matchNames: ['林業振興課'] },
  { displayName: '　循環型林業推進室', matchNames: ['循環型林業推進室', '　循環型林業推進室'] },
  { displayName: '森林整備課', matchNames: ['森林整備課'] },
  { displayName: '　全国育樹祭推進室', matchNames: ['全国育樹祭推進室', '　全国育樹祭推進室'] },
  { displayName: '技術調査課', matchNames: ['技術調査課'] },
  { displayName: '検査・技術支援課', matchNames: ['検査・技術支援課'] },
  { displayName: '監査委員事務局第一課', matchNames: ['監査委員事務局第一課', '監査委員会事務局第一課'] },
  { displayName: '海草農林水産振興部', matchNames: ['海草農林水産振興部'] },
  { displayName: '那賀農林水産振興部', matchNames: ['那賀農林水産振興部'] },
  { displayName: '伊都農林水産振興部', matchNames: ['伊都農林水産振興部'] },
  { displayName: '有田農林水産振興部', matchNames: ['有田農林水産振興部'] },
  { displayName: '日高農林水産振興部', matchNames: ['日高農林水産振興部'] },
  { displayName: '西牟婁農林水産振興部', matchNames: ['西牟婁農林水産振興部'] },
  { displayName: '東牟婁農林水産振興部', matchNames: ['東牟婁農林水産振興部'] },
  { displayName: '林業試験場', matchNames: ['林業試験場'] },
  { displayName: '農林大学校', matchNames: ['農林大学校'] },
  { displayName: '土砂災害啓発センター', matchNames: ['土砂災害啓発センター'] },
  { displayName: 'わかやま森林と緑の公社', matchNames: ['わかやま森林と緑の公社'] },
  { displayName: 'クビアカツヤカミキリ対策室', matchNames: ['クビアカツヤカミキリ対策室'] }
];

const HEADER_BLUE_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { theme: 8, tint: 0.5999938962981048 },
  bgColor: { indexed: 64 }
};

const HEADER_ORANGE_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { theme: 9, tint: 0.5999938962981048 },
  bgColor: { indexed: 64 }
};

const SUBTOTAL_GRAY_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { theme: 0, tint: -0.1499984740745262 },
  bgColor: { indexed: 64 }
};

const NUM_FMT_STANDARD = '#,##0;"▲ "#,##0';
const NUM_FMT_TEMP = '"【"#,##0"】";"▲ "#,##0';

const FONT_TITLE = { name: 'ＭＳ ゴシック', size: 13, family: 3, charset: 128, color: { theme: 1 } };
const FONT_HEADER_GOTHIC_12 = { name: 'ＭＳ ゴシック', size: 12, family: 3, charset: 128, color: { theme: 1 } };
const FONT_HEADER_PGOTHIC_12 = { name: 'ＭＳ Ｐゴシック', size: 12, family: 2, charset: 128, scheme: 'minor', color: { theme: 1 } };
const FONT_HEADER_PGOTHIC_11 = { name: 'ＭＳ Ｐゴシック', size: 11, family: 2, charset: 128, scheme: 'minor', color: { theme: 1 } };
const FONT_DEPT_NAME = { name: 'ＭＳ ゴシック', size: 11, family: 3, charset: 128, color: { theme: 1 } };
const FONT_DATA_NUM = { name: 'ＭＳ ゴシック', size: 14, family: 3, charset: 128, color: { theme: 1 } };
const FONT_TOTAL_NUM = { name: 'ＭＳ ゴシック', size: 14, bold: true, family: 3, charset: 128, color: { theme: 1 } };
const FONT_REASON = { name: 'ＭＳ ゴシック', size: 12, family: 3, charset: 128, color: { theme: 1 } };

export const addNextYearAllocationSheet = (workbook, sheetName, targetYear, departments, employees) => {
  const designatedMinLevel = GRADE_LEVELS['補佐級II(班長)'] || 5; // 補佐級II(班長)以上が「指定職」
  const regularDepts = (departments || []).filter(d => d.type === 'regular');
  const activeEmps = (employees || []).filter(e => !e.isArchived);

  // 標準所属リストへのマッピング + 未掲載の新規部署があれば予備行の前に追加
  const matchedDeptIds = new Set();
  const deptRowsData = [];

  STANDARD_DEPT_ROWS.forEach(stdRow => {
    const matched = regularDepts.filter(d => {
      const nameClean = (d.name || '').trim();
      const nextNameClean = (d.nextName || '').trim();
      return stdRow.matchNames.includes(nameClean) || (nextNameClean && stdRow.matchNames.includes(nextNameClean));
    });
    const ids = matched.map(d => d.id);
    ids.forEach(id => matchedDeptIds.add(id));
    deptRowsData.push({
      displayName: stdRow.displayName,
      deptIds: ids,
      isSpare: false
    });
  });

  regularDepts.forEach(d => {
    if (!matchedDeptIds.has(d.id)) {
      const dispName = d.nextName && d.nextName !== d.name ? d.nextName : d.name;
      deptRowsData.push({
        displayName: dispName,
        deptIds: [d.id],
        isSpare: false
      });
    }
  });

  // 予備の空行を1行追加（元エクセルの29行目相当）
  deptRowsData.push({
    displayName: null,
    deptIds: [],
    isSpare: true
  });

  const firstDataRow = 5;
  const lastDataRow = firstDataRow + deptRowsData.length - 1;
  const totalRowIdx = lastDataRow + 1;
  const noteRowIdx = totalRowIdx + 1;

  const ws = workbook.addWorksheet(sheetName, {
    views: [{
      workbookViewId: 0,
      rightToLeft: false,
      state: 'normal',
      showRuler: true,
      showRowColHeaders: true,
      showGridLines: false,
      zoomScale: 120,
      zoomScaleNormal: 70,
      activeCell: `M${totalRowIdx}`,
      style: 'pageBreakPreview'
    }],
    properties: {
      defaultRowHeight: 13,
      dyDescent: 0,
      outlineLevelRow: 0,
      outlineLevelCol: 0
    },
    pageSetup: {
      fitToPage: false,
      margins: {
        left: 0.7086614173228347,
        right: 0,
        top: 0,
        bottom: 0.15748031496062992,
        header: 0.31496062992125984,
        footer: 0.31496062992125984
      },
      paperSize: 9,
      orientation: 'landscape',
      horizontalDpi: 300,
      verticalDpi: 300,
      pageOrder: 'downThenOver',
      blackAndWhite: false,
      draft: false,
      cellComments: 'None',
      errors: 'displayed',
      scale: 53,
      fitToWidth: 1,
      fitToHeight: 1,
      firstPageNumber: 1,
      useFirstPageNumber: false,
      usePrinterDefaults: false,
      copies: 1,
      printArea: `A1:AB${noteRowIdx}`,
      printTitlesRow: '2:4'
    }
  });

  // 列幅の設定 (A〜AB: 1〜28)
  const colWidths = {
    1: 36.36328125,
    2: 8,
    3: 7.36328125,
    4: 7.90625,
    5: 7.90625,
    6: 7.90625,
    7: 7.90625,
    8: 7.90625,
    9: 7.90625,
    10: 7.36328125,
    11: 7.36328125,
    12: 7.36328125,
    13: 7.36328125,
    14: 7.453125,
    15: 8.7265625,
    16: 7.453125,
    17: 7.453125,
    18: 7.453125,
    19: 7.453125,
    20: 7.453125,
    21: 7.453125,
    22: 7.453125,
    23: 8.7265625,
    24: 8.7265625
  };
  for (let c = 1; c <= 28; c++) {
    if (colWidths[c]) {
      ws.getColumn(c).width = colWidths[c];
    }
  }

  // --- 行1: タイトル ---
  const r1 = ws.getRow(1);
  r1.height = 29.25;
  const cellA1 = r1.getCell(1);
  cellA1.value = '３．次年度配置案';
  cellA1.font = FONT_TITLE;
  cellA1.alignment = { horizontal: 'left' };

  // --- 行2〜4: ヘッダー ---
  ws.getRow(2).height = 22.5;
  ws.getRow(3).height = 22.5;
  ws.getRow(4).height = 30.0;

  const currEraNum = String(targetYear - 2019);
  const nextEraNum = String(targetYear - 2018);

  ws.getCell('A2').value = '所属名';
  ws.getCell('B2').value = {
    richText: [
      { text: 'R' },
      { font: { size: 12, color: { argb: 'FFFF0000' }, name: 'ＭＳ ゴシック', family: 3, charset: 128 }, text: currEraNum },
      { font: { size: 12, name: 'ＭＳ ゴシック', family: 3, charset: 128 }, text: '.4.1人数' }
    ]
  };
  ws.getCell('E2').value = '臨時的\n任用\n職員\n【外数】';
  ws.getCell('E2').note = {
    texts: [
      {
        font: { size: 12, color: { indexed: 81 }, name: 'MS P ゴシック', family: 3, charset: 128 },
        text: '臨時的任用職員を配置している場合はその人数を入力してください。'
      }
    ]
  };
  ws.getCell('F2').value = '技術職職種担当 配置案';
  ws.getCell('K2').value = {
    richText: [
      { text: 'R' },
      { font: { size: 12, color: { argb: 'FFFF0000' }, name: 'ＭＳ ゴシック', family: 3, charset: 128 }, text: nextEraNum },
      { font: { size: 12, color: { theme: 1 }, name: 'ＭＳ ゴシック', family: 3, charset: 128 }, text: '.4.1人数' }
    ]
  };
  ws.getCell('N2').value = '理由（増減がある場合に記入）';
  ws.getCell('V2').value = '原課要望と異なる配置案となる場合は✓を選択のうえ、\n原課との調整状況や配置の考え方等を記入してください。';

  ws.getCell('B3').value = '指定職';
  ws.getCell('C3').value = '担当';
  ws.getCell('D3').value = '小計';
  ws.getCell('F3').value = '指定職';
  ws.getCell('H3').value = '担当';
  ws.getCell('J3').value = '小計';
  ws.getCell('K3').value = '指定職';
  ws.getCell('L3').value = '担当';
  ws.getCell('M3').value = '小計';

  ws.getCell('F4').value = '増';
  ws.getCell('G4').value = '減';
  ws.getCell('H4').value = '増';
  ws.getCell('I4').value = '減';

  // ヘッダー結合
  ws.mergeCells('A2:A4');
  ws.mergeCells('B2:D2');
  ws.mergeCells('E2:E4');
  ws.mergeCells('F2:J2');
  ws.mergeCells('K2:M2');
  ws.mergeCells('N2:U4');
  ws.mergeCells('V2:AB4');
  ws.mergeCells('B3:B4');
  ws.mergeCells('C3:C4');
  ws.mergeCells('D3:D4');
  ws.mergeCells('F3:G3');
  ws.mergeCells('H3:I3');
  ws.mergeCells('J3:J4');
  ws.mergeCells('K3:K4');
  ws.mergeCells('L3:L4');
  ws.mergeCells('M3:M4');

  // ヘッダー書式・塗りつぶし・罫線
  for (let r = 2; r <= 4; r++) {
    for (let c = 1; c <= 28; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = c >= 22 ? HEADER_ORANGE_FILL : HEADER_BLUE_FILL;

      if (c === 5) {
        cell.font = FONT_HEADER_PGOTHIC_11;
      } else if (r === 2 && (c === 1 || c <= 4 || (c >= 6 && c <= 9) || c === 11 || c >= 14)) {
        cell.font = FONT_HEADER_GOTHIC_12;
      } else if (c >= 14) {
        cell.font = FONT_HEADER_GOTHIC_12;
      } else {
        cell.font = FONT_HEADER_PGOTHIC_12;
      }

      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: !(r === 2 && c >= 6 && c <= 10) && !(r === 2 && c >= 14 && c <= 21) && !(c === 1)
      };

      const border = {};
      // Top border
      if (r === 2) border.top = { style: 'thin' };
      else if (r === 3 && c >= 2 && c <= 13 && c !== 5) border.top = { style: 'thin' };
      else if (r === 4 && c >= 6 && c <= 9) border.top = { style: 'thin' };

      // Bottom border
      if (r === 2 && ((c >= 2 && c <= 4) || (c >= 6 && c <= 13))) border.bottom = { style: 'thin' };
      else if (r === 3 && c >= 6 && c <= 9) border.bottom = { style: 'thin' };
      else if (r === 4) border.bottom = { style: 'thin' };

      // Left border
      if (c === 1) border.left = { style: 'thin' };
      else if (c === 2 || c === 6 || c === 11 || c === 14) border.left = { style: 'medium' };
      else if (c === 22) border.left = { style: 'double', color: { indexed: 64 } };
      else if (r >= 3 && (c === 3 || c === 4 || c === 8 || c === 10 || c === 12 || c === 13)) border.left = { style: 'thin' };
      else if (r === 4 && c === 9) border.left = { style: 'thin' };

      // Right border
      if (c === 1 || c === 4 || c === 5 || c === 10 || c === 13) border.right = { style: 'medium' };
      else if (c === 21) border.right = { style: 'double', color: { indexed: 64 } };
      else if (c === 28) border.right = { style: 'thin' };
      else if (r >= 3 && (c === 2 || c === 3 || c === 7 || c === 9 || c === 11 || c === 12)) border.right = { style: 'thin' };
      else if (r === 4 && (c === 6 || c === 8)) border.right = { style: 'thin' };

      cell.border = border;
    }
  }

  // --- データ行 (行5 〜 lastDataRow) ---
  let totalCurrShitei = 0;
  let totalCurrTantou = 0;
  let totalCurrTemp = 0;
  let totalIncShitei = 0;
  let totalDecShitei = 0;
  let totalIncTantou = 0;
  let totalDecTantou = 0;
  let totalNextShitei = 0;
  let totalNextTantou = 0;

  deptRowsData.forEach((rowInfo, idx) => {
    const r = firstDataRow + idx;
    const row = ws.getRow(r);
    row.height = 34.5;

    let currShitei = 0;
    let currTantou = 0;
    let currTemp = 0;
    let nextShitei = 0;
    let nextTantou = 0;

    if (!rowInfo.isSpare && rowInfo.deptIds.length > 0) {
      const idSet = new Set(rowInfo.deptIds);

      // 今年度人数集計
      activeEmps.forEach(emp => {
        if (!idSet.has(emp.currentDeptId)) return;
        if (emp.currentExclude && emp.currentExclude.trim() !== '') return;
        if (isTempRemark(emp.currentEmploymentType)) {
          currTemp++;
          return;
        }
        if (getGradeLevel(emp.currentGrade) >= designatedMinLevel) {
          currShitei++;
        } else {
          currTantou++;
        }
      });

      // 来年度人数集計
      activeEmps.forEach(emp => {
        if (!idSet.has(emp.departmentId)) return;
        if (emp.nextExclude && emp.nextExclude.trim() !== '') return;
        if (isTempRemark(emp.nextEmploymentType)) {
          return;
        }
        if (getGradeLevel(emp.nextGrade) >= designatedMinLevel) {
          nextShitei++;
        } else {
          nextTantou++;
        }
      });
    }

    const diffShitei = nextShitei - currShitei;
    const diffTantou = nextTantou - currTantou;
    const incShitei = !rowInfo.isSpare && diffShitei > 0 ? diffShitei : null;
    const decShitei = !rowInfo.isSpare && diffShitei < 0 ? diffShitei : null;
    const incTantou = !rowInfo.isSpare && diffTantou > 0 ? diffTantou : null;
    const decTantou = !rowInfo.isSpare && diffTantou < 0 ? diffTantou : null;

    if (!rowInfo.isSpare) {
      totalCurrShitei += currShitei;
      totalCurrTantou += currTantou;
      totalCurrTemp += currTemp;
      if (incShitei) totalIncShitei += incShitei;
      if (decShitei) totalDecShitei += decShitei;
      if (incTantou) totalIncTantou += incTantou;
      if (decTantou) totalDecTantou += decTantou;
      totalNextShitei += nextShitei;
      totalNextTantou += nextTantou;
    }

    row.getCell(1).value = rowInfo.displayName;
    row.getCell(2).value = rowInfo.isSpare ? null : currShitei;
    row.getCell(3).value = rowInfo.isSpare ? null : currTantou;
    row.getCell(4).value = {
      formula: `SUM(B${r}:C${r})`,
      result: rowInfo.isSpare ? 0 : currShitei + currTantou
    };
    row.getCell(5).value = !rowInfo.isSpare && currTemp > 0 ? currTemp : null;
    row.getCell(6).value = incShitei;
    row.getCell(7).value = decShitei;
    row.getCell(8).value = incTantou;
    row.getCell(9).value = decTantou;
    row.getCell(10).value = {
      formula: `SUM(F${r}:I${r})`,
      result: rowInfo.isSpare ? 0 : diffShitei + diffTantou
    };
    row.getCell(11).value = {
      formula: `SUM(B${r},F${r}:G${r})`,
      result: rowInfo.isSpare ? 0 : nextShitei
    };
    row.getCell(12).value = {
      formula: `SUM(C${r},H${r}:I${r})`,
      result: rowInfo.isSpare ? 0 : nextTantou
    };
    row.getCell(13).value = {
      formula: `SUM(K${r}:L${r})`,
      result: rowInfo.isSpare ? 0 : nextShitei + nextTantou
    };

    // 理由欄（N〜U）と調整状況欄（W〜AB）のセル結合
    ws.mergeCells(r, 14, r, 21);
    ws.mergeCells(r, 23, r, 28);

    // 減欄（G列・I列）の入力規則（マイナスの値）
    const minusValidation = {
      type: 'whole',
      operator: 'lessThan',
      allowBlank: true,
      showInputMessage: true,
      showErrorMessage: true,
      formulae: [0],
      error: 'マイナスの値を入力してください'
    };
    row.getCell(7).dataValidation = minusValidation;
    row.getCell(9).dataValidation = minusValidation;

    const topBorderStyle = r === firstDataRow ? 'thin' : 'hair';
    const bottomBorderStyle = r === lastDataRow ? 'thin' : 'hair';

    for (let c = 1; c <= 28; c++) {
      const cell = row.getCell(c);

      if (c === 1) {
        cell.font = FONT_DEPT_NAME;
        cell.alignment = { vertical: 'middle' };
      } else if (c >= 2 && c <= 13) {
        cell.font = FONT_DATA_NUM;
        cell.alignment = { vertical: 'middle' };
        cell.numFmt = c === 5 ? NUM_FMT_TEMP : NUM_FMT_STANDARD;
        if (c === 4 || c === 5 || (c >= 10 && c <= 13)) {
          cell.fill = SUBTOTAL_GRAY_FILL;
        }
      } else if (c === 22) {
        cell.font = FONT_REASON;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      } else {
        cell.font = FONT_REASON;
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      }

      const border = {
        top: { style: topBorderStyle },
        bottom: { style: bottomBorderStyle }
      };
      if (c === 1) {
        border.left = { style: 'thin' };
        border.right = { style: 'medium' };
      } else if (c === 2 || c === 6 || c === 11) {
        border.left = { style: 'medium' };
        border.right = { style: 'thin' };
      } else if (c === 3 || c === 8 || c === 9 || c === 12) {
        border.left = { style: 'thin' };
        if (c === 8) border.right = { style: 'thin' };
      } else if (c === 7) {
        border.right = { style: 'thin' };
      } else if (c === 4 || c === 10 || c === 13) {
        border.left = { style: 'thin' };
        border.right = { style: 'medium' };
      } else if (c === 5) {
        border.left = { style: 'medium' };
        border.right = { style: 'medium' };
      } else if (c === 14) {
        border.left = { style: 'medium' };
      } else if (c === 21) {
        border.right = { style: 'double', color: { indexed: 64 } };
      } else if (c === 22) {
        border.left = { style: 'double', color: { indexed: 64 } };
        border.right = { style: 'hair', color: { indexed: 64 } };
      } else if (c === 28) {
        border.right = { style: 'thin' };
      }

      cell.border = border;
    }
  });

  // --- 合計行 (totalRowIdx) ---
  const totalRow = ws.getRow(totalRowIdx);
  totalRow.height = 34.5;
  totalRow.getCell(1).value = '合計';
  totalRow.getCell(1).font = FONT_DEPT_NAME;
  totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  totalRow.getCell(1).border = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'medium' }
  };

  const sumCols = [
    { col: 2, letter: 'B', result: totalCurrShitei },
    { col: 3, letter: 'C', result: totalCurrTantou },
    { col: 4, letter: 'D', result: totalCurrShitei + totalCurrTantou },
    { col: 5, letter: 'E', result: totalCurrTemp },
    { col: 6, letter: 'F', result: totalIncShitei },
    { col: 7, letter: 'G', result: totalDecShitei },
    { col: 8, letter: 'H', result: totalIncTantou },
    { col: 9, letter: 'I', result: totalDecTantou },
    { col: 10, letter: 'J', result: (totalIncShitei + totalDecShitei) + (totalIncTantou + totalDecTantou) },
    { col: 11, letter: 'K', result: totalNextShitei },
    { col: 12, letter: 'L', result: totalNextTantou },
    { col: 13, letter: 'M', result: totalNextShitei + totalNextTantou }
  ];

  sumCols.forEach(({ col, letter, result }) => {
    const cell = totalRow.getCell(col);
    cell.value = {
      formula: `SUM(${letter}${firstDataRow}:${letter}${lastDataRow})`,
      result
    };
    cell.font = FONT_TOTAL_NUM;
    cell.fill = SUBTOTAL_GRAY_FILL;
    cell.alignment = { vertical: 'middle', shrinkToFit: true };
    cell.numFmt = col === 5 ? NUM_FMT_TEMP : NUM_FMT_STANDARD;

    const border = {
      top: { style: 'thin' },
      bottom: { style: 'medium' }
    };
    if (col === 2 || col === 6 || col === 11) {
      border.left = { style: 'medium' };
      border.right = { style: 'thin' };
    } else if (col === 3 || col === 9) {
      border.left = { style: 'thin' };
    } else if (col === 7) {
      border.right = { style: 'thin' };
    } else if (col === 8 || col === 12) {
      border.left = { style: 'thin' };
      border.right = { style: 'thin' };
    } else if (col === 4 || col === 10 || col === 13) {
      border.left = { style: 'thin' };
      border.right = { style: 'medium' };
    }
    cell.border = border;
  });

  for (let c = 14; c <= 22; c++) {
    const cell = totalRow.getCell(c);
    cell.font = FONT_DEPT_NAME;
    cell.alignment = { vertical: 'middle' };
    cell.border = c === 14 ? { top: { style: 'thin' }, left: { style: 'medium' } } : { top: { style: 'thin' } };
  }

  // --- 注記行 (noteRowIdx) ---
  const noteRow = ws.getRow(noteRowIdx);
  noteRow.height = 15.0;
  noteRow.getCell(1).value = '※行が不足する場合は、適宜追加してください。';
  noteRow.getCell(1).font = FONT_DEPT_NAME;
  noteRow.getCell(1).alignment = { vertical: 'middle' };
  for (let c = 2; c <= 13; c++) {
    const cell = noteRow.getCell(c);
    cell.font = FONT_DEPT_NAME;
    cell.alignment = { vertical: 'middle' };
    cell.numFmt = NUM_FMT_STANDARD;
  }

  return ws;
};
