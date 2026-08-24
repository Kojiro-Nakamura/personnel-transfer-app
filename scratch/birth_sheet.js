const getBirthFiscalYear = (dateStr) => {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (!match) return null;
  let year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 4 || (month === 4 && day === 1)) {
    year -= 1;
  }
  return year;
};

const getHireFiscalYearShort = (dateStr) => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (!match) return '';
  let year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 4 || (month === 4 && day === 1)) year -= 1;
  if (year >= 2019) return 'R' + (year - 2018);
  if (year >= 1989) return 'H' + (year - 1988);
  if (year >= 1926) return 'S' + (year - 1925);
  if (year >= 1912) return 'T' + (year - 1911);
  return year.toString();
};

const getEraYearOnly = (year) => {
  if (year >= 2019) return 'R' + (year - 2018);
  if (year >= 1989) return 'H' + (year - 1988);
  if (year >= 1926) return 'S' + (year - 1925);
  if (year >= 1912) return 'T' + (year - 1911);
  return year.toString();
};

export const addBirthYearSheet = (workbook, sheetName, targetYear, employees, departments) => {
  const ws = workbook.addWorksheet(sheetName, {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.2, right: 0.2, top: 0.3, bottom: 0.3, header: 0.1, footer: 0.1 } }
  });

  const deptMap = new Map();
  if (departments) {
    departments.forEach(d => deptMap.set(d.id, d));
  }

  // Filter employees
  const activeEmps = employees.filter(emp => {
    if (emp.isArchived) return false;
    if (!emp.currentDeptId) return false;
    const isTemp = /臨任|臨時/.test(emp.currentEmploymentType || '') || /臨任|臨時/.test(emp.note || '');
    if (isTemp) return false;
    return true;
  });

  const parsedEmps = activeEmps.map(emp => {
    const bYear = getBirthFiscalYear(emp.birthDate);
    const hYearShort = getHireFiscalYearShort(emp.hireDate);
    const dept = deptMap.get(emp.currentDeptId);
    const isShinkokyoku = dept ? (dept.name || '').includes('振興局') : false;
    return { ...emp, bYear, hYearShort, isShinkokyoku };
  }).filter(emp => emp.bYear !== null);

  // Group by bYear
  const grouped = {};
  let minYear = 9999;
  let maxYear = 0;
  parsedEmps.forEach(emp => {
    if (!grouped[emp.bYear]) grouped[emp.bYear] = [];
    grouped[emp.bYear].push(emp);
    if (emp.bYear < minYear) minYear = emp.bYear;
    if (emp.bYear > maxYear) maxYear = emp.bYear;
  });

  if (minYear === 9999) return; // No data

  // Sort each group
  Object.values(grouped).forEach(arr => {
    arr.sort((a, b) => {
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

  const yearsPerBlock = 20;
  let currentRowIndex = 1;

  ws.getCell(currentRowIndex, 1).value = '令和' + (targetYear - 2018) + '年度林学職生年別一覧';
  ws.getCell(currentRowIndex, 1).font = titleFont;
  currentRowIndex += 2;

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
    
    ws.getColumn(1).width = 4;
    
    let cIdx = 2;
    yearsInBlock.forEach(y => {
      ws.getColumn(cIdx).width = 4;
      ws.getColumn(cIdx + 1).width = 8;
      
      const age = targetYear - y;
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
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
      }
    }
    
    currentRowIndex += 2;

    for (let r = 0; r < maxEmpCount; r++) {
      const row = ws.getRow(currentRowIndex + r);
      row.getCell(1).value = r + 1;
      row.getCell(1).font = defaultFont;
      row.getCell(1).border = { top: {style:'hair'}, bottom: {style:'hair'}, left: {style:'thin'}, right: {style:'thin'} };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      
      let cIdx = 2;
      yearsInBlock.forEach(y => {
        const emps = grouped[y] || [];
        const emp = emps[r];
        
        const cell1 = row.getCell(cIdx);
        const cell2 = row.getCell(cIdx + 1);
        
        cell1.font = { name: 'BIZ UDPゴシック', size: 8 };
        cell2.font = defaultFont;
        
        cell1.alignment = { horizontal: 'center', vertical: 'middle' };
        cell2.alignment = { horizontal: 'left', vertical: 'middle' };
        
        cell1.border = { top: {style:'hair'}, bottom: {style:'hair'}, left: {style:'thin'} };
        cell2.border = { top: {style:'hair'}, bottom: {style:'hair'}, right: {style:'thin'} };
        
        if (emp) {
          cell1.value = emp.hYearShort;
          cell2.value = emp.name;
          
          if (emp.hYearShort && emp.hYearShort.includes('H')) {
             cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FC' } };
             cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FC' } };
          }
        } else {
          // background colors for empty cells like the image
          if (y >= 1989) { // H era
             cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FC' } };
             cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF3FC' } };
          }
        }
        cIdx += 2;
      });
    }
    
    currentRowIndex += maxEmpCount;
    
    const summaryRows = [
      { label: '振興局外', valFn: (y) => (grouped[y] || []).filter(e => !e.isShinkokyoku).length },
      { label: '振興局', valFn: (y) => (grouped[y] || []).filter(e => e.isShinkokyoku).length },
      { label: '計', valFn: (y) => (grouped[y] || []).length },
      { label: '累計', valFn: (y) => cumulativeMap[y] }
    ];
    
    summaryRows.forEach(sr => {
      const row = ws.getRow(currentRowIndex);
      row.getCell(1).value = sr.label;
      row.getCell(1).font = defaultFont;
      row.getCell(1).border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      
      let cIdx = 2;
      yearsInBlock.forEach(y => {
        row.getCell(cIdx).value = sr.valFn(y) || 0;
        ws.mergeCells(currentRowIndex, cIdx, currentRowIndex, cIdx + 1);
        const mergedCell = row.getCell(cIdx);
        mergedCell.font = defaultFont;
        mergedCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
        mergedCell.alignment = { horizontal: 'right', vertical: 'middle' };
        cIdx += 2;
      });
      currentRowIndex++;
    });
    
    currentRowIndex += 2; 
    currentBlockStartYear += yearsPerBlock;
  }
};