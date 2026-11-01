import { getGradeLevel, getEraFormattedYear, calculateAge, getPromotedBgColorCode, traverseOrgTree, getCounts, formatCountText, generateGradeSummary, isPromotedGrade, getEmpCurrentYears, calculateServiceYears, formatPromoDateWithEra, getEraSuffix, getEraSuffixForDate, formatServiceYearsText, formatDateForDisplay, getFormattedNameForPlan, shouldOmitEmployeeNumber, sortEmployeeList } from '../helpers.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../../constants/config.js';
import { defaultFont, headerFont, borderStyle, thickBorderStyle, grayBorderStyle, grayThickBorderStyle, getCellBorders, getBirthFiscalYear, getHireFiscalYearShort, getEraYearOnly } from './excelHelpers.js';

export const addBirthYearSheet = (workbook, sheetName, targetYear, employees, departments, isNextYear = false) => {
  const ws = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'landscape', horizontalCentered: true, fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.2, right: 0.2, top: 0.8, bottom: 0.3, header: 0.1, footer: 0.1 } },
    views: [{ showGridLines: false }],
    views: [{ showGridLines: false }]
  });

  const deptMap = new Map();
  if (departments) {
    departments.forEach(d => deptMap.set(d.id, d));
  }

  // Filter employees
  const activeEmps = employees.filter(emp => {
    if (emp.isArchived) return false;
    if (isNextYear) {
      const isRetired = emp.departmentId === 'retired' || (deptMap.get(emp.departmentId)?.name || '').includes('退職');
      if (isRetired) {
        if (emp.currentDeptId === 'retired') return false;
      } else {
        if (!emp.departmentId || emp.departmentId === 'unassigned') return false;
      }
    } else {
      const dId = emp.currentDeptId;
      if (!dId || dId === 'unassigned' || dId === 'retired') return false;
    }
    const isTemp = /臨任|臨時/.test(emp.currentEmploymentType || '') || /臨任|臨時/.test(emp.note || '');
    if (isTemp) return false;
    return true;
  });

  const ageOffset = isNextYear ? 1 : 2;
  const parsedEmps = activeEmps.map(emp => {
    const bYear = getBirthFiscalYear(emp.birthDate);
    const hYearShort = getHireFiscalYearShort(emp.hireDate);
    const dId = isNextYear ? emp.departmentId : emp.currentDeptId;
    const dept = deptMap.get(dId);
    const isShinkokyoku = dept ? (dept.name || '').includes('振興局') : false;
    return { ...emp, bYear, hYearShort, isShinkokyoku };
  }).filter(emp => {
    if (emp.bYear === null) return false;
    const age = (targetYear - ageOffset) - emp.bYear;
    if (age > 64) return false;
    return true;
  });

  // Group by bYear (筆頭を64歳にする: 64歳相当年度または最年長者の年度)
  const grouped = {};
  const minYear64 = (targetYear - ageOffset) - 64;
  let minYear = minYear64;
  let maxYear = 0;
  parsedEmps.forEach(emp => {
    if (!grouped[emp.bYear]) grouped[emp.bYear] = [];
    grouped[emp.bYear].push(emp);
    if (emp.bYear < minYear) minYear = emp.bYear;
    if (emp.bYear > maxYear) maxYear = emp.bYear;
  });

  if (maxYear === 0) return; // No data

  // Sort each group (退職者は同一生年グループの下部に配置)
  Object.values(grouped).forEach(arr => {
    arr.sort((a, b) => {
      const isRetA = isNextYear && (a.departmentId === 'retired' || (deptMap.get(a.departmentId)?.name || '').includes('退職'));
      const isRetB = isNextYear && (b.departmentId === 'retired' || (deptMap.get(b.departmentId)?.name || '').includes('退職'));
      // Keep natural hireDate / birthDate sort order
      if (a.hireDate !== b.hireDate) return (a.hireDate || '') > (b.hireDate || '') ? 1 : -1;
      return (a.birthDate || '') > (b.birthDate || '') ? 1 : -1;
    });
  });

  const totalEmps = parsedEmps.length;
  let currentCumulative = totalEmps;
  const cumulativeMap = {};
  for (let y = minYear; y <= maxYear; y++) {
    cumulativeMap[y] = currentCumulative;
    if (grouped[y]) {
      currentCumulative -= grouped[y].length;
    }
  }

  const defaultFont = { name: 'BIZ UDPゴシック', size: 9 };
  const boldFont = { name: 'BIZ UDPゴシック', size: 9, bold: true };
  const titleFont = { name: 'BIZ UDPゴシック', size: 14, bold: true };

  const yearsPerBlock = 15;
  let currentRowIndex = 1;

  
  const yearOffset = isNextYear ? 2018 : 2019;
    ws.getCell(currentRowIndex, 1).value = '令和' + (targetYear - yearOffset) + '年度林学職生年別一覧';
  ws.getCell(currentRowIndex, 1).font = titleFont;
  
  // Legend
  const legendLabels = [
    '部長級', '次長級', '所属長級', '課長級', '補佐級III(補佐兼班長)', '補佐級II(班長)', '補佐級I(主任)', '係長級(主査)'
  ];
  if (isNextYear) {
    // 凡例位置を今年度・来年度ともCol 14〜31（58歳〜50歳の上）に統一
  }
  let legendCol = (2 + yearsPerBlock * 2) - (legendLabels.length * 2);
  
  // "凡例" text
  const hanreiCol = legendCol - 2;
  for (let c = 0; c < 2; c++) {
    ws.getCell(2, hanreiCol + c).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
  }
  const hanreiCell = ws.getCell(2, hanreiCol);
  hanreiCell.value = '凡例';
  hanreiCell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
  hanreiCell.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
  ws.mergeCells(2, hanreiCol, 2, hanreiCol + 1);

  for (let i = 0; i < legendLabels.length; i++) {
    for (let c = 0; c < 2; c++) {
      const cCell = ws.getCell(2, legendCol + c);
      cCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
    }
    const cell = ws.getCell(2, legendCol);
    cell.value = legendLabels[i];
    cell.font = { name: 'BIZ UDPゴシック', size: 8, bold: true, color: { argb: 'FF000000' } };
    const colorHex = legendLabels[i] === '退職'
      ? 'D9D9D9'
      : (getPromotedBgColorCode(legendLabels[i])?.replace('#', '')?.toUpperCase() || 'FFFFFF');
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorHex } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
    ws.mergeCells(2, legendCol, 2, legendCol + 1);
    legendCol += 2;
  }

  currentRowIndex += 3;

  let currentBlockStartYear = minYear;

  while (currentBlockStartYear <= maxYear) {
    const blockEndYear = Math.min(currentBlockStartYear + yearsPerBlock - 1, maxYear);
    const yearsInBlock = [];
    for (let y = currentBlockStartYear; y <= blockEndYear; y++) {
      yearsInBlock.push(y);
    }
    
    let maxEmpCount = 10;
    yearsInBlock.forEach(y => {
      if (grouped[y] && grouped[y].length > maxEmpCount) maxEmpCount = grouped[y].length;
    });

    const ageRow = ws.getRow(currentRowIndex);
    const birthYearRow = ws.getRow(currentRowIndex + 1);
    
    ageRow.getCell(1).value = '年齢';
    birthYearRow.getCell(1).value = '生年';
    
    ws.getColumn(1).width = 9.51;
    
    let cIdx = 2;
    yearsInBlock.forEach(y => {
      ws.getColumn(cIdx).width = 4;
      ws.getColumn(cIdx + 1).width = 8;
      
      const ageOffset = isNextYear ? 1 : 2;
          const age = (targetYear - ageOffset) - y;
      ageRow.getCell(cIdx).value = age;
      ws.mergeCells(currentRowIndex, cIdx, currentRowIndex, cIdx + 1);
      
      const eraYearStr = getEraYearOnly(y) + '組';
      birthYearRow.getCell(cIdx).value = eraYearStr;
      ws.mergeCells(currentRowIndex + 1, cIdx, currentRowIndex + 1, cIdx + 1);
      
      cIdx += 2;
    });

    for(let r = currentRowIndex; r <= currentRowIndex + 1; r++) {
      const row = ws.getRow(r);
      for(let c = 1; c < cIdx; c++) {
        const cell = row.getCell(c);
        cell.font = boldFont;
        cell.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
        cell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
      }
    }
    
    currentRowIndex += 2;

    for (let r = 0; r < maxEmpCount; r++) {
      const row = ws.getRow(currentRowIndex + r);
      row.height = 13.20;
      row.getCell(1).value = r + 1;
      row.getCell(1).font = defaultFont;
      row.getCell(1).border = { top: {style:'hair'}, bottom: {style:'hair'}, left: {style:'thin'}, right: {style:'thin'} };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
      
      let cIdx = 2;
      yearsInBlock.forEach(y => {
        const emps = grouped[y] || [];
        const emp = emps[r];
        
        const cell1 = row.getCell(cIdx);
        const cell2 = row.getCell(cIdx + 1);
        
        cell1.font = { name: 'BIZ UDPゴシック', size: 8 };
        cell2.font = defaultFont;
        
        cell1.alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
        cell2.alignment = { horizontal: 'left', vertical: 'middle', shrinkToFit: true };
        
        cell1.border = { top: {style:'hair'}, bottom: {style:'hair'}, left: {style:'thin'} };
        cell2.border = { top: {style:'hair'}, bottom: {style:'hair'}, right: {style:'thin'} };
        
        if (emp) {
          cell1.value = emp.hYearShort;
          cell2.value = emp.name;
          
          const ageOffset = isNextYear ? 1 : 2;
          const age = (targetYear - ageOffset) - y;
          let bgRaw = null;
          const isEmpRetired = isNextYear && (emp.departmentId === 'retired' || (deptMap.get(emp.departmentId)?.name || '').includes('退職'));
          if (isEmpRetired) {
            bgRaw = '#D9D9D9';
          } else if (isNextYear && age >= 60) {
            // 来年度60歳以上になる人は役職定年などで級が外れるため色なし
            bgRaw = ''; 
          } else {
            const grade = isNextYear ? (emp.nextGrade !== undefined && emp.nextGrade !== null ? emp.nextGrade : emp.currentGrade) : emp.currentGrade;
            bgRaw = getPromotedBgColorCode(grade);
          }
          if (bgRaw) {
             const bgArgb = 'FF' + bgRaw.replace('#', '').toUpperCase();
             cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
             cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
          }
        }
        cIdx += 2;
      });
    }
    
    currentRowIndex += maxEmpCount;
    
    const summaryRows = [
      { label: '計', valFn: (y) => (grouped[y] || []).length },
      { label: '累計', valFn: (y) => cumulativeMap[y] }
    ];
    
    summaryRows.forEach(sr => {
      const row = ws.getRow(currentRowIndex);
      row.height = 13.20;
      row.getCell(1).value = sr.label;
      row.getCell(1).font = defaultFont;
      row.getCell(1).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', shrinkToFit: true };
      
      let cIdx = 2;
      yearsInBlock.forEach(y => {
        row.getCell(cIdx).value = sr.valFn(y) || 0;
        ws.mergeCells(currentRowIndex, cIdx, currentRowIndex, cIdx + 1);
        const mergedCell = row.getCell(cIdx);
        mergedCell.font = defaultFont;
        mergedCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
        mergedCell.alignment = { horizontal: 'right', vertical: 'middle', shrinkToFit: true };
        cIdx += 2;
      });
      currentRowIndex++;
    });
    
    currentRowIndex += 2; 
    currentBlockStartYear += yearsPerBlock;
  }
};
