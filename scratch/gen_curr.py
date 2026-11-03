import os

code = """
export const addCurrentBasePlanSheet = (workbook, sheetName, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const getEraSuffixLocal = (yearStr) => {
    const y = parseInt(yearStr);
    if (isNaN(y)) return '';
    return `(R${y - 2018})`;
  };

  const ws = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', xSplit: 9, ySplit: 5, showGridLines: false }],
    pageSetup: { paperSize: 8, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.1, footer: 0.1 } }
  });
  ws.pageSetup.printTitlesRow = '1:5';

  ws.columns = [
    { width: 14 }, // A 部署名
    { width: 14 }, // B 班・グループ
    { width: 10 }, // C ポスト
    { width: 12 }, // D [今年] 職名
    { width: 16 }, // E [今年] 氏名
    { width: 16 }, // F [今年] 級
    { width: 6 },  // G [今年] 年齢
    { width: 12 }, // H [今年] 在籍
    { width: 12 }, // I [今年] 備考
    { width: 4 },  // J →
    { width: 14 }, // K [来年] 部署名
    { width: 14 }, // L [来年] 班・グループ
    { width: 12 }, // M [来年] 職名
    { width: 16 }, // N [来年] 級
    { width: 6 },  // O [来年] 年齢
    { width: 12 }, // P [来年] 在籍
    { width: 12 }, // Q [来年] 備考
  ];

  ws.getRow(1).values = [fileName];
  ws.getRow(1).font = { name: 'BIZ UDPゴシック', bold: true, size: 12, color: { argb: 'FF1E293B' } };

  const curSummary = generateGradeSummary(employees, false);
  ws.getRow(2).values = [`【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】 ${curSummary}`];
  ws.getRow(2).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF0284C7' } };

  const nextSummary = generateGradeSummary(employees, true);
  ws.getRow(3).values = [`【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】 ${nextSummary}`];
  ws.getRow(3).font = { name: 'BIZ UDPゴシック', size: 9, color: { argb: 'FF0284C7' } };

  ws.mergeCells('A2:Q2');
  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells('A3:Q3');
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };

  const r4 = ws.getRow(4);
  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`];
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '備考', '', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];
  r5.values = r5Vals;
  r5.height = 20;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:I4');
  ws.mergeCells('J4:J5');
  ws.mergeCells('K4:Q4');

  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } };
  const currFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
  const nextFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
  const borderStyle = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

  for (let c = 1; c <= 17; c++) {
    const c4 = ws.getCell(4, c);
    const c5 = ws.getCell(5, c);
    c4.border = borderStyle;
    c5.border = borderStyle;
    c4.alignment = { horizontal: 'center', vertical: 'middle' };
    c5.alignment = { horizontal: 'center', vertical: 'middle' };
    c4.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };
    c5.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };

    if (c >= 4 && c <= 9) {
      c4.fill = currFill;
      c5.fill = currFill;
    } else if (c >= 11 && c <= 17) {
      c4.fill = nextFill;
      c5.fill = nextFill;
    } else {
      c4.fill = headerFill;
      c5.fill = headerFill;
    }
  }

  let currentRowIndex = 6;

  departments.forEach((dept) => {
    let dNamePrinted = false;
    const currD = deptMap.current[dept.id] || { groups: {} };

    const getEmpIdsForPost = (groupObj, postId) => {
      if (!groupObj || !groupObj.posts || !groupObj.posts[postId]) return [];
      return groupObj.posts[postId].current;
    };

    const getDirectEmpIds = (groupObj) => {
      if (!groupObj || !groupObj.direct) return [];
      return groupObj.direct.current;
    };

    const processEmps = (emps, groupName, postName, isPost, currentGroupId) => {
      let filteredEmps = emps;
      if (filterLevel > 0) {
        filteredEmps = emps.filter(eId => {
          const emp = employees.find(e => e.id === eId);
          if (!emp) return false;
          const cLvl = getGradeLevel(emp.currentGrade);
          const nLvl = getGradeLevel(emp.nextGrade);
          return cLvl >= filterLevel || nLvl >= filterLevel;
        });
      }

      if (filteredEmps.length === 0) {
        if (filterLevel > 0) return;
        const row = ws.getRow(currentRowIndex);
        row.height = 24;
        const vals = new Array(17).fill('');
        vals[0] = (!dNamePrinted) ? dept.name : ''; dNamePrinted = true;
        vals[1] = groupName || '';
        vals[2] = postName || '';
        row.values = vals;
        
        for (let c = 1; c <= 17; c++) {
          const cell = row.getCell(c);
          cell.border = borderStyle;
          cell.alignment = { vertical: 'middle', wrapText: true };
          cell.font = { name: 'BIZ UDPゴシック', size: 9 };
        }
        currentRowIndex++;
        return;
      }

      filteredEmps.forEach((eId, idx) => {
        const emp = employees.find(e => e.id === eId);
        if (!emp) return;

        const row = ws.getRow(currentRowIndex);
        row.height = 24;
        const vals = new Array(17).fill('');

        vals[0] = (!dNamePrinted) ? dept.name : ''; dNamePrinted = true;
        vals[1] = (idx === 0 && groupName) ? groupName : '';
        vals[2] = (idx === 0 && postName) ? postName : '';
        
        vals[3] = emp.currentTitle || '';
        vals[4] = emp.name || '';
        vals[5] = emp.currentGrade || '';
        vals[6] = calculateAge(emp.birthDate, targetYear - 1) !== '' ? calculateAge(emp.birthDate, targetYear - 1) + '歳' : '';
        const cy = emp.currentYears || 0;
        const cs = (emp.currentSkills || []).join('＋');
        vals[7] = cs ? `${cy}年(${cs})` : `${cy}年`;
        vals[8] = emp.currentEmploymentType || '';

        vals[9] = '→';

        const getDeptNameStr = (dId) => {
           if (dId === 'unassigned') return '未配置';
           if (dId === 'retired') return '退職';
           const d = departments.find(x => x.id === dId);
           return d ? (d.nextName || d.name) : '';
        };
        const getGroupNameStr = (dId, gId) => {
           const d = departments.find(x => x.id === dId);
           if (!d) return '';
           const g = d.groups.find(x => x.id === gId);
           return g ? (g.nextName || g.name) : '';
        };

        const isUnassigned = emp.departmentId === 'unassigned';
        const isRetired = emp.departmentId === 'retired';

        if (isRetired) {
          vals[10] = '退職';
          vals[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
        } else if (isUnassigned) {
          vals[10] = '未配置';
          vals[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
          vals[16] = emp.nextEmploymentType || '';
        } else {
          vals[10] = getDeptNameStr(emp.departmentId);
          vals[11] = getGroupNameStr(emp.departmentId, emp.groupId);
          vals[12] = emp.nextTitle || '';
          vals[13] = emp.nextGrade || '';
          vals[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
          const ny = emp.nextYears || 0;
          const ns = (emp.nextSkills || []).join('＋');
          vals[15] = ns ? `${ny}年(${ns})` : `${ny}年`;
          vals[16] = emp.nextEmploymentType || '';
        }

        row.values = vals;

        for (let c = 1; c <= 17; c++) {
          const cell = row.getCell(c);
          cell.border = borderStyle;
          cell.alignment = { vertical: 'middle', wrapText: true };
          cell.font = { name: 'BIZ UDPゴシック', size: 9 };
          
          if (c === 5) {
             cell.font = { name: 'BIZ UDPゴシック', size: 10, bold: true };
          }
          if (c === 7 || c === 8 || c === 15 || c === 16) {
             cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
          if (c === 10) {
             cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }

          if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {
             if (emp.departmentId !== dept.id) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDBA74' } }; // orange-300
             } else if (emp.groupId !== currentGroupId) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE047' } }; // yellow-300
             }
          }
        }
        
        currentRowIndex++;
      });
    };

    dept.posts.forEach(p => {
      const emps = getEmpIdsForPost(currD, p.id);
      processEmps(emps, null, p.name, true, null);
    });

    const directEmps = getDirectEmpIds(currD);
    processEmps(directEmps, null, null, false, null);

    dept.groups.forEach(grp => {
      const gObj = currD.groups[grp.id] || { posts: {}, direct: { current: [] } };
      
      grp.posts.forEach(p => {
        const emps = getEmpIdsForPost(gObj, p.id);
        processEmps(emps, grp.name, p.name, true, grp.id);
      });
      
      const gDirect = getDirectEmpIds(gObj);
      processEmps(gDirect, grp.name, null, false, grp.id);
    });
  });
};
"""

with open("scratch/addCurrentBasePlanSheet.js", "w", encoding="utf8") as f:
    f.write(code)