const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /const headerCols = parseCSVRow\(lines\[0\]\);[\s\S]*?if \(targetEmp\) \{/m;

const replacement = `const headerCols = parseCSVRow(lines[0]);
      
      const colMap = new Map();
      headerCols.forEach((col, i) => {
        colMap.set(col.trim(), i);
      });

      const csvYearsMap = new Map();
      for (let k = 0; k < headerCols.length; k++) {
        const year = extractYearFromHeader(headerCols[k]);
        if (year && year >= 1900 && year <= 2100) {
          csvYearsMap.set(k, year);
        }
      }
      
      const nDepts = [...localDepts]; 
      const dMap = new Map(nDepts.map(d => [d.name, d])); 
      const adds = []; 
      const updates = [];
      const existingEmpMap = new Map(localEmps.filter(e => e.employeeNumber).map(e => [e.employeeNumber, e]));
      const existingEmpNameMap = new Map(localEmps.map(e => [e.name, e]));
      const genId = (p) => \`\${p}-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
      
      const parsePlacement = (dName, pName, gPName) => {
        let dId = 'unassigned', pId = null, gId = null, gpId = null;
        if (dName) {
          let dept = dMap.get(dName); 
          if (!dept) { 
            dept = { id: genId('dept'), name: dName, type: 'regular', posts: [], groups: [] }; 
            dMap.set(dName, dept); 
            nDepts.push(dept); 
          }
          dId = dept.id;
          if (pName) {
            const isG = gPName || /(課|室|G|グループ|班|係|チーム|センター|チーム長|学生)$/.test(pName);
            if (isG) {
              let grp = dept.groups.find(g => g.name === pName);
              if (!grp) { grp = { id: genId('grp'), name: pName, posts: [] }; dept.groups.push(grp); }
              gId = grp.id;
              if (gPName) {
                let gp = grp.posts.find(p => p.name === gPName);
                if (!gp) { gp = { id: genId('gp'), name: gPName }; grp.posts.push(gp); }
                gpId = gp.id;
              }
            } else {
              let post = dept.posts.find(p => p.name === pName);
              if (!post) { post = { id: genId('post'), name: pName }; dept.posts.push(post); }
              pId = post.id;
            }
          }
        }
        return { dId, pId, gId, gpId };
      };

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
              } else if (existingIdx >= 0) {
                // If it's empty in CSV, maybe don't delete? Actually, usually CSV overwrite means we should remove it, or keep it?
                // For safety, let's just ignore empty cells and not delete existing history, UNLESS they explicitly want to clear it.
                // Normally an empty cell in a CSV means "no data", but if we merge, we should probably keep existing if empty.
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

        if (targetEmp) {`;

content = content.replace(targetRegex, replacement);
fs.writeFileSync(file, content, 'utf8');
