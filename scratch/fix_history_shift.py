import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# First loop
t1 = """          vals[39] = ny;

          const changeIndexes = [];
          const promoYearMap = {};
          if (emp.promoYearChief) promoYearMap[parseInt(String(emp.promoYearChief).split('-')[0])] = "係長級(主査)";
          if (emp.promoYearAssistant1) promoYearMap[parseInt(String(emp.promoYearAssistant1).split('-')[0])] = "補佐級I(主任)";
          if (emp.promoYearAssistant2) promoYearMap[parseInt(String(emp.promoYearAssistant2).split('-')[0])] = "補佐級II(班長)";
          if (emp.promoYearAssistant3) promoYearMap[parseInt(String(emp.promoYearAssistant3).split('-')[0])] = "補佐級III(補佐兼班長)";
          if (emp.promoYearSecHead) promoYearMap[parseInt(String(emp.promoYearSecHead).split('-')[0])] = "課長級";
          if (emp.promoYearDivHead) promoYearMap[parseInt(String(emp.promoYearDivHead).split('-')[0])] = "所属長級";
          if (emp.promoYearDeputyHead) promoYearMap[parseInt(String(emp.promoYearDeputyHead).split('-')[0])] = "次長級";
          if (emp.promoYearDeptHead) promoYearMap[parseInt(String(emp.promoYearDeptHead).split('-')[0])] = "部長級";
          row.promoYearMap = promoYearMap;

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
                else if (d === 'システム用') hStr = '未配置';
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
          });"""

r1 = """          vals[38] = ny;

          const changeIndexes = [];
          const promoYearMap = {};
          if (emp.promoYearChief) promoYearMap[parseInt(String(emp.promoYearChief).split('-')[0])] = "係長級(主査)";
          if (emp.promoYearAssistant1) promoYearMap[parseInt(String(emp.promoYearAssistant1).split('-')[0])] = "補佐級I(主任)";
          if (emp.promoYearAssistant2) promoYearMap[parseInt(String(emp.promoYearAssistant2).split('-')[0])] = "補佐級II(班長)";
          if (emp.promoYearAssistant3) promoYearMap[parseInt(String(emp.promoYearAssistant3).split('-')[0])] = "補佐級III(補佐兼班長)";
          if (emp.promoYearSecHead) promoYearMap[parseInt(String(emp.promoYearSecHead).split('-')[0])] = "課長級";
          if (emp.promoYearDivHead) promoYearMap[parseInt(String(emp.promoYearDivHead).split('-')[0])] = "所属長級";
          if (emp.promoYearDeputyHead) promoYearMap[parseInt(String(emp.promoYearDeputyHead).split('-')[0])] = "次長級";
          if (emp.promoYearDeptHead) promoYearMap[parseInt(String(emp.promoYearDeptHead).split('-')[0])] = "部長級";
          row.promoYearMap = promoYearMap;

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
                else if (d === 'システム用') hStr = '未配置';
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

             vals[39 + idx] = displayStr;
             if (isChange) {
                changeIndexes.push(39 + idx);
             }
          });"""

if t1 in code:
    code = code.replace(t1, r1)
    print("Fixed first loop")
else:
    print("t1 not found")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)