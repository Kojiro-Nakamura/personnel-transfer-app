import os

with open("scratch/addCurrentBasePlanSheet.js", "r", encoding="utf8") as f:
    lines = f.readlines()

vals_logic = """        const extEmp = emp;
        if (extEmp) {
          vals[18] = getFormattedNameForPlan(extEmp, true);
          vals[19] = getAgeStr(extEmp, false);
          vals[20] = extEmp.furigana || '';
          vals[21] = shouldOmitEmployeeNumber(extEmp, true) ? '' : (extEmp.employeeNumber || '');
          vals[22] = extEmp.gender || '';
          vals[23] = formatWithEra(extEmp.birthDate);
          vals[24] = extEmp.education || '';
          vals[25] = formatWithEra(extEmp.hireDate, extEmp.birthDate);
          vals[26] = extEmp.note || '';
          vals[27] = extEmp.desiredAssignment ? '〇' + extEmp.desiredAssignment : '';
          vals[28] = extEmp.specialCircumstances ? '●' + extEmp.specialCircumstances : '';
          
          let hireStr = '';
          if (extEmp.hireDate) {
            hireStr = formatDateForDisplay(extEmp.hireDate);
            const y = parseInt(String(extEmp.hireDate).split('-')[0], 10);
            if (extEmp.birthDate && !isNaN(y)) {
               const ag = calculateAge(extEmp.birthDate, y);
               if (ag) hireStr += `(${ag}歳)`;
            }
          }
          vals[29] = hireStr;
          
          const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
          const gradeList = ['', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級'];
          for (let pi = 1; pi < pKeys.length; pi++) {
            let pStr = '';
            const key = pKeys[pi];
            if (extEmp[key]) {
               pStr = formatDateForDisplay(extEmp[key]);
               const y = parseInt(String(extEmp[key]).split('-')[0], 10);
               if (extEmp.birthDate && !isNaN(y)) {
                 const ag = calculateAge(extEmp.birthDate, y);
                 if (ag) pStr += `(${ag}歳)`;
               }
            }
            vals[29 + pi] = pStr;
          }
          
          let ny = '';
          if (extEmp.nextGrade && extEmp.nextGrade !== '-' && extEmp.nextGrade !== '') {
            if (extEmp.nextGrade === '10' && extEmp.nextEmploymentType) {
              ny = extEmp.nextEmploymentType;
            } else {
              const gl = parseInt(extEmp.nextGrade, 10);
              if (!isNaN(gl) && gl >= 1 && gl <= 8) {
                ny = gradeList[gl];
              }
            }
          }
          vals[39] = ny;
          
          const changeIndexes = [];
          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {
             let hStr = '';
             if (hy === targetYear) {
                const nDept = departments.find(d => d.id === extEmp.departmentId);
                const nGroup = nDept && extEmp.groupId ? (nDept.groups || []).find(g => g.id === extEmp.groupId) : null;
                const p = extEmp.postId ? (nDept?.posts?.find(x => x.id === extEmp.postId) || nGroup?.posts?.find(x => x.id === extEmp.postId)) : null;
                const d = nDept ? (nDept.nextName || nDept.name) : '';
                const g = nGroup ? (nGroup.nextName || nGroup.name) : '';
                const pStr = p ? (p.nextName || p.name) : '';
                if (extEmp.departmentId === 'unassigned') hStr = '未配置';
                else if (extEmp.departmentId === 'retired') hStr = '退職';
                else if (d === 'システム用部署') hStr = '未配置';
                else hStr = `${d} ${g}${pStr}`;
             } else {
                const hist = (extEmp.history || []).find(h => h.year === hy);
                hStr = hist ? hist.department : '';
             }
             
             let isChange = false;
             if (hStr !== '' && hStr !== '-') {
                if (hStr !== lastValidHStr) {
                   isChange = true;
                }
                lastValidHStr = hStr;
             }
             
             let displayStr = hStr;
             if (hStr && hStr !== ' / 退職' && hStr !== '未配置' && hStr !== '-') {
               const histAge = (extEmp.birthDate && !isNaN(hy)) ? calculateAge(extEmp.birthDate, hy) : null;
               if (histAge) displayStr += ` (${histAge}歳)`;
             }
             
             vals[40 + idx] = displayStr;
             if (isChange) {
                changeIndexes.push(40 + idx);
             }
          });
          row.changeIndexes = changeIndexes;
        }
        row.values = vals;
"""

new_lines = []
for i, line in enumerate(lines):
    if "const r5Vals =" in line and "'備考'" in line and "氏名" not in line:
        new_lines.append("  const r5Vals = ['', '', '', '職名', '氏名', '級', '年齢', '在籍', '備考', '', '部署名', '班・グループ', '職名', '級', '年齢', '在籍', '備考'];\n")
        new_lines.append("  r5Vals.push('', '氏名', '年齢', 'フリガナ', '職員番号', '性別', '生年月日', '最終学歴', '採用年月日', '特記事項', '〇配属希望', '●特殊事情', '採用', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級', '来年度');\n")
        new_lines.append("  historyYears.forEach(y => r5Vals.push(getEraFormattedYear(y)));\n")
    elif "row.values = vals;" in line and "vals[16] = emp.nextEmploymentType || '';" in lines[i-2]:
        # Inside filteredEmps.forEach
        new_lines.append(vals_logic + "\n")
    elif "r.values = v;" in line and "v[16] = emp.nextEmploymentType || '';" in lines[i-2]:
        # Inside uObj loop
        uobj = vals_logic.replace("vals[", "v[").replace("vals =", "v =").replace("row.", "r.")
        new_lines.append(uobj + "\n")
    else:
        new_lines.append(line)

with open("scratch/addCurrentBasePlanSheet_fixed.js", "w", encoding="utf8") as f:
    f.writelines(new_lines)