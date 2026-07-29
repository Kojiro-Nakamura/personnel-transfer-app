const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /for \(let i = 1; i < lines\.length; i\+\+\) \{[\s\S]*?if \(targetEmp\) \{\s*updates\.push\(\{ \.\.\.targetEmp, \.\.\.newEmpData \}\);\s*\} else \{\s*adds\.push\(\{ \s*\.\.\.newEmpData,\s*id: genId\('new-emp'\), \s*orderCurrent: Date\.now\(\)\+i, \s*orderNext: Date\.now\(\)\+i, \s*isNew: true \s*\}\);\s*\}\s*\}/m;

const replacement = `const isVerticalFormat = colMap.has('年度') && colMap.has('配属先');

      if (isVerticalFormat) {
        // --- 縦持ち（構造）形式のパース ---
        const empGroups = new Map(); // empNum (or name) -> { empNum, empName, birth, hire, history: [] }

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVRow(lines[i]);
          if (cols.length < 2) continue;
          
          const getVal = (key) => {
            const idx = colMap.get(key);
            return idx !== undefined && idx < cols.length ? cols[idx] : undefined;
          };

          const empNum = getVal('職員番号');
          const empName = getVal('氏名');
          if (!empNum && !empName) continue;
          
          const key = empNum || empName;
          if (!empGroups.has(key)) {
            empGroups.set(key, {
              employeeNumber: empNum,
              name: empName,
              birthDate: getVal('生年月日'),
              hireDate: getVal('採用年月日'),
              history: []
            });
          }
          
          const yearStr = getVal('年度');
          const deptName = getVal('配属先');
          if (yearStr && deptName) {
            const y = parseInt(yearStr, 10);
            if (!isNaN(y)) {
              empGroups.get(key).history.push({
                year: y,
                department: deptName
              });
            }
          }
        }

        // empGroupsを回して、既存データとマージ
        let i = 0;
        for (const [key, g] of empGroups.entries()) {
          i++;
          let targetEmp = existingEmpMap.get(g.employeeNumber);
          if (!targetEmp && g.name) targetEmp = existingEmpNameMap.get(g.name);

          const bDate = g.birthDate ? parseJapaneseDate(g.birthDate) : (targetEmp ? targetEmp.birthDate : '');
          const hDate = g.hireDate ? parseJapaneseDate(g.hireDate) : (targetEmp ? targetEmp.hireDate : '');

          g.history.forEach(h => {
            h.age = calculateAge(bDate, h.year);
            h.japaneseYear = getEraFormattedYear(h.year);
          });
          g.history.sort((a, b) => a.year - b.year);

          let newHistory = targetEmp && targetEmp.history ? [...targetEmp.history] : [];
          g.history.forEach(h => {
            const existingIdx = newHistory.findIndex(eh => eh.year === h.year);
            if (existingIdx >= 0) {
              newHistory[existingIdx] = h;
            } else {
              newHistory.push(h);
            }
          });
          newHistory.sort((a, b) => a.year - b.year);

          const newEmpData = {
            employeeNumber: g.employeeNumber !== undefined ? g.employeeNumber : (targetEmp ? targetEmp.employeeNumber : ''), 
            name: g.name !== undefined ? g.name : (targetEmp ? targetEmp.name : ''), 
            birthDate: bDate,
            hireDate: hDate,
            history: newHistory
          };

          if (targetEmp) {
            updates.push({ ...targetEmp, ...newEmpData });
          } else {
            adds.push({ 
              ...newEmpData,
              id: genId('new-emp'), 
              orderCurrent: Date.now()+i, 
              orderNext: Date.now()+i, 
              isNew: true 
            });
          }
        }
      } else {
        // --- 従来の横持ち（一覧）形式のパース ---
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVRow(lines[i]);
          if (cols.length < 2) continue;
          
          const getVal = (key) => {
            const idx = colMap.get(key);
            return idx !== undefined && idx < cols.length ? cols[idx] : undefined;
          };

          const empNum = getVal('職員番号');
          const empName = getVal('氏名');
          if (!empNum && !empName) continue;

          let targetEmp = existingEmpMap.get(empNum);
          if (!targetEmp) targetEmp = existingEmpNameMap.get(empName);

          // 基本情報の取得
          const bStr = getVal('生年月日');
          const hStr = getVal('採用年月日');
          const edu = getVal('最終学歴');
          const note = getVal('特記事項');

          // 今年度情報
          const cDName = getVal('【今年度】部署名');
          const cPName = getVal('【今年度】ポスト・役職名');
          const cGPName = getVal('【今年度】内部ポスト名');
          const cTitle = getVal('【今年度】職名');
          const cGrade = getVal('【今年度】級');
          const cYsStr = getVal('【今年度】年数');
          const cSkStr = getVal('【今年度】詳細');
          const cNote = getVal('【今年度】人');
          const cExclude = getVal('【今年度】カウント外');

          let currP = { dId: 'unassigned', pId: null, gId: null, gpId: null };
          if (cDName !== undefined || cPName !== undefined || cGPName !== undefined) {
            currP = parsePlacement(cDName, cPName, cGPName);
          } else if (targetEmp) {
            currP = { dId: targetEmp.currentDeptId, pId: targetEmp.currentPostId, gId: targetEmp.currentGroupId, gpId: targetEmp.currentGroupPostId };
          }

          // 来年度情報
          const nDName = getVal('【来年度】部署名');
          const nPName = getVal('【来年度】ポスト・役職名');
          const nGPName = getVal('【来年度】内部ポスト名');
          const nTitle = getVal('【来年度】職名');
          const nGrade = getVal('【来年度】級');
          const nYsStr = getVal('【来年度】年数');
          const nSkStr = getVal('【来年度】詳細');
          const nNote = getVal('【来年度】人');
          const nExclude = getVal('【来年度】カウント外');

          let nextP = { dId: 'unassigned', pId: null, gId: null, gpId: null };
          if (nDName !== undefined || nPName !== undefined || nGPName !== undefined) {
            nextP = parsePlacement(nDName, nPName, nGPName);
          } else if (targetEmp) {
            nextP = { dId: targetEmp.departmentId, pId: targetEmp.postId, gId: targetEmp.groupId, gpId: targetEmp.groupPostId };
          }

          // 昇進年度
          const pChief = getVal('【昇進年度】係長級(主査)');
          const pAss1 = getVal('【昇進年度】補佐級I(主任)');
          const pAss2 = getVal('【昇進年度】補佐級II(班長)');
          const pAss3 = getVal('【昇進年度】補佐級III');
          const pSec = getVal('【昇進年度】課長級');
          const pDiv = getVal('【昇進年度】所属長級');
          const pDep = getVal('【昇進年度】次長級');
          const pDept = getVal('【昇進年度】部長級');

          const newEmpData = {
            employeeNumber: empNum !== undefined ? empNum : (targetEmp ? targetEmp.employeeNumber : ''), 
            name: empName !== undefined ? empName : (targetEmp ? targetEmp.name : ''), 
            birthDate: bStr !== undefined ? parseJapaneseDate(bStr) : (targetEmp ? targetEmp.birthDate : ''), 
            education: edu !== undefined ? edu : (targetEmp ? targetEmp.education : ''), 
            hireDate: hStr !== undefined ? parseJapaneseDate(hStr) : (targetEmp ? targetEmp.hireDate : ''), 
            note: note !== undefined ? note : (targetEmp ? targetEmp.note : ''), 
            currentDeptId: currP.dId, 
            currentPostId: currP.pId, 
            currentGroupId: currP.gId, 
            currentGroupPostId: currP.gpId, 
            currentTitle: cTitle !== undefined ? cTitle : (targetEmp ? targetEmp.currentTitle : ''), 
            currentGrade: cGrade !== undefined ? cGrade : (targetEmp ? targetEmp.currentGrade : ''), 
            currentYears: cYsStr !== undefined ? (parseInt(cYsStr, 10) || 0) : (targetEmp ? targetEmp.currentYears : 0), 
            currentSkillsStr: cSkStr !== undefined ? cSkStr : (targetEmp ? targetEmp.currentSkillsStr : ''), 
            currentEmploymentType: cNote !== undefined ? cNote : (targetEmp ? targetEmp.currentEmploymentType : ''), 
            currentExclude: cExclude !== undefined ? cExclude : (targetEmp ? targetEmp.currentExclude : ''), 
            departmentId: nextP.dId, 
            postId: nextP.pId, 
            groupId: nextP.gId, 
            groupPostId: nextP.gpId, 
            nextTitle: nTitle !== undefined ? nTitle : (targetEmp ? targetEmp.nextTitle : ''), 
            nextGrade: nGrade !== undefined ? nGrade : (targetEmp ? targetEmp.nextGrade : ''), 
            nextYears: nYsStr !== undefined ? (parseInt(nYsStr, 10) || 1) : (targetEmp ? targetEmp.nextYears : 1), 
            nextSkillsStr: nSkStr !== undefined ? nSkStr : (targetEmp ? targetEmp.nextSkillsStr : ''), 
            nextEmploymentType: nNote !== undefined ? nNote : (targetEmp ? targetEmp.nextEmploymentType : ''), 
            nextExclude: nExclude !== undefined ? nExclude : (targetEmp ? targetEmp.nextExclude : ''), 
            promoYearChief: pChief !== undefined ? pChief : (targetEmp ? targetEmp.promoYearChief : ''),
            promoYearAssistant1: pAss1 !== undefined ? pAss1 : (targetEmp ? targetEmp.promoYearAssistant1 : ''),
            promoYearAssistant2: pAss2 !== undefined ? pAss2 : (targetEmp ? targetEmp.promoYearAssistant2 : ''),
            promoYearAssistant3: pAss3 !== undefined ? pAss3 : (targetEmp ? targetEmp.promoYearAssistant3 : ''),
            promoYearSecHead: pSec !== undefined ? pSec : (targetEmp ? targetEmp.promoYearSecHead : ''),
            promoYearDivHead: pDiv !== undefined ? pDiv : (targetEmp ? targetEmp.promoYearDivHead : ''),
            promoYearDeputyHead: pDep !== undefined ? pDep : (targetEmp ? targetEmp.promoYearDeputyHead : ''),
            promoYearDeptHead: pDept !== undefined ? pDept : (targetEmp ? targetEmp.promoYearDeptHead : ''),
          };

          if (csvYearsMap.size > 0) {
            let newHistory = targetEmp && targetEmp.history ? [...targetEmp.history] : [];
            for (let [k, year] of csvYearsMap.entries()) {
              if (k < cols.length) {
                const deptName = cols[k] || '';
                const age = calculateAge(newEmpData.birthDate, year);
                
                const existingIdx = newHistory.findIndex(h => h.year === year);
                if (deptName) {
                  if (existingIdx >= 0) {
                    newHistory[existingIdx] = { year, japaneseYear: getEraFormattedYear(year), age, department: deptName };
                  } else {
                    newHistory.push({ year, japaneseYear: getEraFormattedYear(year), age, department: deptName });
                  }
                }
              }
            }
            newHistory.sort((a, b) => a.year - b.year);
            newEmpData.history = newHistory;
          } else if (targetEmp && targetEmp.history) {
            newEmpData.history = targetEmp.history;
          } else {
            newEmpData.history = [];
          }

          if (targetEmp) {
            updates.push({ ...targetEmp, ...newEmpData });
          } else {
            adds.push({ 
              ...newEmpData,
              id: genId('new-emp'), 
              orderCurrent: Date.now()+i, 
              orderNext: Date.now()+i, 
              isNew: true 
            });
          }
        }
      }`;

if (!targetRegex.test(content)) {
  console.log("Regex did not match!");
} else {
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Patched successfully!");
}
