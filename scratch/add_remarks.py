import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Update columns
old_cols = """    { width: 12 }, // H [今年] 在籍
    { width: 4 },  // I 矢印
    { width: 14 }, // J [来年] 部署名
    { width: 14 }, // K [来年] 班・グループ
    { width: 12 }, // L [来年] 職名
    { width: 16 }, // M [来年] 級
    { width: 6 },  // N [来年] 年齢
    { width: 12 }, // O [来年] 在籍
    { width: 12 }, // P [来年] 備考"""

new_cols = """    { width: 12 }, // H [今年] 在籍
    { width: 12 }, // I [今年] 備考
    { width: 4 },  // J 矢印
    { width: 14 }, // K [来年] 部署名
    { width: 14 }, // L [来年] 班・グループ
    { width: 12 }, // M [来年] 職名
    { width: 16 }, // N [来年] 級
    { width: 6 },  // O [来年] 年齢
    { width: 12 }, // P [来年] 在籍
    { width: 12 }, // Q [来年] 備考"""
code = code.replace(old_cols, new_cols)

# 2. Update r4, r5, merges
old_merges = """  ws.mergeCells('A2:P2');
  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };
  ws.mergeCells('A3:P3');
  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };

  const r4 = ws.getRow(4);
  const r4Vals = ['部署名', '班・グループ', 'ポスト', `今年度（${targetYear - 1}(R${targetYear - 2019})）`, '', '', '', '', '', `来年度（${targetYear}(R${targetYear - 2018})）`];
  r4.values = r4Vals;
  r4.height = 20;

  const r5 = ws.getRow(5);
  const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];
  r5.values = r5Vals;
  r5.height = 20;

  ws.mergeCells('A4:A5');
  ws.mergeCells('B4:B5');
  ws.mergeCells('C4:C5');
  ws.mergeCells('D4:H4');
  ws.mergeCells('I4:I5');
  ws.mergeCells('J4:P4');"""

new_merges = """  ws.mergeCells('A2:Q2');
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
  ws.mergeCells('K4:Q4');"""
code = code.replace(old_merges, new_merges)

# 3. Update loops and colors
old_header_loops = """  for (let c = 1; c <= 16; c++) {
    const c4 = ws.getCell(4, c);
    const c5 = ws.getCell(5, c);
    c4.border = borderStyle;
    c5.border = borderStyle;
    c4.alignment = { horizontal: 'center', vertical: 'middle' };
    c5.alignment = { horizontal: 'center', vertical: 'middle' };
    c4.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };
    c5.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };

    if (c >= 4 && c <= 8) {
      c4.fill = currFill;
      c5.fill = currFill;
    } else if (c >= 10 && c <= 16) {
      c4.fill = nextFill;
      c5.fill = nextFill;
    } else if (c !== 9) {
      c4.fill = headerFill;
      c5.fill = headerFill;
    }
  }"""

new_header_loops = """  for (let c = 1; c <= 17; c++) {
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
    } else if (c !== 10) {
      c4.fill = headerFill;
      c5.fill = headerFill;
    }
  }"""
code = code.replace(old_header_loops, new_header_loops)

# 4. Update the 4 loops to 17
code = code.replace("for (let c = 1; c <= 16; c++) {", "for (let c = 1; c <= 17; c++) {")
code = code.replace("new Array(16).fill('');", "new Array(17).fill('');")
code = code.replace("if (c >= 10 && c <= 16 && !isRetired && !isUnassigned) {", "if (c >= 11 && c <= 17 && !isRetired && !isUnassigned) {")

# 5. Fix vals assignments inside `processEmps`
old_vals_process = """        vals[7] = cs ? `${cy}(${cs})` : `${cy}`;


        vals[8] = '→';

        const getDeptNameStr = (dId) => {
           if (dId === 'unassigned') return '未配置';
           if (dId === 'retired') return '退職';
           const d = departments.find(x => x.id === dId);
           return d ? (d.nextName || d.name) : '';
        };
        const getGroupNameStr = (dId, gId) => {
           const d = departments.find(x => x.id === dId);
           if (!d) return '';
           const g = (d.groups || []).find(x => x.id === gId);
           return g ? (g.nextName || g.name) : '';
        };

        const isUnassigned = emp.departmentId === 'unassigned';
        const isRetired = emp.departmentId === 'retired';

        if (isRetired) {
          vals[9] = '退職';
          vals[13] = calculateAge(emp.birthDate, targetYear);
        } else if (isUnassigned) {
          vals[9] = '配置待ち';
          vals[13] = calculateAge(emp.birthDate, targetYear);
          vals[15] = emp.nextEmploymentType || '';
        } else {
          vals[9] = getDeptNameStr(emp.departmentId);
          vals[10] = getGroupNameStr(emp.departmentId, emp.groupId);
          vals[11] = emp.nextTitle || '';
          vals[12] = emp.nextGrade || '';
          vals[13] = calculateAge(emp.birthDate, targetYear);
          const ny = emp.nextYears || 0;
          const ns = (emp.nextSkills || []).join('＋');
          vals[14] = ns ? `${ny}(${ns})` : `${ny}`;
          vals[15] = emp.nextEmploymentType || '';
        }"""

new_vals_process = """        vals[7] = cs ? `${cy}(${cs})` : `${cy}`;
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
           const g = (d.groups || []).find(x => x.id === gId);
           return g ? (g.nextName || g.name) : '';
        };

        const isUnassigned = emp.departmentId === 'unassigned';
        const isRetired = emp.departmentId === 'retired';

        if (isRetired) {
          vals[10] = '退職';
          vals[14] = calculateAge(emp.birthDate, targetYear);
        } else if (isUnassigned) {
          vals[10] = '配置待ち';
          vals[14] = calculateAge(emp.birthDate, targetYear);
          vals[16] = emp.nextEmploymentType || '';
        } else {
          vals[10] = getDeptNameStr(emp.departmentId);
          vals[11] = getGroupNameStr(emp.departmentId, emp.groupId);
          vals[12] = emp.nextTitle || '';
          vals[13] = emp.nextGrade || '';
          vals[14] = calculateAge(emp.birthDate, targetYear);
          const ny = emp.nextYears || 0;
          const ns = (emp.nextSkills || []).join('＋');
          vals[15] = ns ? `${ny}(${ns})` : `${ny}`;
          vals[16] = emp.nextEmploymentType || '';
        }"""
code = code.replace(old_vals_process, new_vals_process)

# 6. Unassigned / Retired loops
old_unassigned = """      v[7] = cs ? `${cy}(${cs})` : `${cy}`;
      v[8] = '→';

      const getDeptNameStr = (dId) => {
         if (dId === 'unassigned') return '未配置';
         if (dId === 'retired') return '退職';
         const d = departments.find(x => x.id === dId);
         return d ? (d.nextName || d.name) : '';
      };
      const getGroupNameStr = (dId, gId) => {
         const d = departments.find(x => x.id === dId);
         if (!d) return '';
         const g = (d.groups || []).find(x => x.id === gId);
         return g ? (g.nextName || g.name) : '';
      };

      const isUnassigned = emp.departmentId === 'unassigned';
      const isRetired = emp.departmentId === 'retired';

      if (isRetired) {
        v[9] = '退職';
        v[13] = calculateAge(emp.birthDate, targetYear);
      } else if (isUnassigned) {
        v[9] = '配置待ち';
        v[13] = calculateAge(emp.birthDate, targetYear);
        v[15] = emp.nextEmploymentType || '';
      } else {
        v[9] = getDeptNameStr(emp.departmentId);
        v[10] = getGroupNameStr(emp.departmentId, emp.groupId);
        v[11] = emp.nextTitle || '';
        v[12] = emp.nextGrade || '';
        v[13] = calculateAge(emp.birthDate, targetYear);
        const ny = emp.nextYears || 0;
        const ns = (emp.nextSkills || []).join('＋');
        v[14] = ns ? `${ny}(${ns})` : `${ny}`;
        v[15] = emp.nextEmploymentType || '';
      }"""

new_unassigned = """      v[7] = cs ? `${cy}(${cs})` : `${cy}`;
      v[8] = emp.currentEmploymentType || '';
      v[9] = '→';

      const getDeptNameStr = (dId) => {
         if (dId === 'unassigned') return '未配置';
         if (dId === 'retired') return '退職';
         const d = departments.find(x => x.id === dId);
         return d ? (d.nextName || d.name) : '';
      };
      const getGroupNameStr = (dId, gId) => {
         const d = departments.find(x => x.id === dId);
         if (!d) return '';
         const g = (d.groups || []).find(x => x.id === gId);
         return g ? (g.nextName || g.name) : '';
      };

      const isUnassigned = emp.departmentId === 'unassigned';
      const isRetired = emp.departmentId === 'retired';

      if (isRetired) {
        v[10] = '退職';
        v[14] = calculateAge(emp.birthDate, targetYear);
      } else if (isUnassigned) {
        v[10] = '配置待ち';
        v[14] = calculateAge(emp.birthDate, targetYear);
        v[16] = emp.nextEmploymentType || '';
      } else {
        v[10] = getDeptNameStr(emp.departmentId);
        v[11] = getGroupNameStr(emp.departmentId, emp.groupId);
        v[12] = emp.nextTitle || '';
        v[13] = emp.nextGrade || '';
        v[14] = calculateAge(emp.birthDate, targetYear);
        const ny = emp.nextYears || 0;
        const ns = (emp.nextSkills || []).join('＋');
        v[15] = ns ? `${ny}(${ns})` : `${ny}`;
        v[16] = emp.nextEmploymentType || '';
      }"""

code = code.replace(old_unassigned, new_unassigned)

# 7. Alignment adjustments
code = code.replace("if (c === 7 || c === 8 || c === 9 || c === 14 || c === 15) cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };", "if (c === 7 || c === 8 || c === 10 || c === 15 || c === 16) cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: true, wrapText: false };")
code = code.replace("if (c === 9) cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };", "if (c === 10) cell.font = { name: 'BIZ UDPゴシック', size: 9, bold: true };")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)
