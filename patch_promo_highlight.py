import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''      const renderPromo = (key) => {
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        const idx = pKeys.indexOf(key);
        let prevY = NaN;
        if (idx > 0) {
          for (let i = idx - 1; i >= 0; i--) {
            const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
            if (!isNaN(y)) { prevY = y; break; }
          }
        }
        const currentY = parseInt(emp[key] || 'NaN');
        const diff = (!isNaN(prevY) && !isNaN(currentY) && currentY >= prevY) ? currentY - prevY : null;
        
        let cellHtml = '';
        if (diff !== null) {
          cellHtml += `<span class="diff-span diff-emerald">${diff}年&gt;</span>`;
        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        cellHtml += (emp[key] || '');
        if (emp[key]) {
          const suffix = getEraSuffixLocal(emp[key]);
          if (suffix) cellHtml += `<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">(${suffix})</span>`;
          if (emp.birthDate && !isNaN(currentY)) {
             const promoAge = calculateAge(emp.birthDate, currentY);
             if (promoAge !== null && !isNaN(promoAge)) {
                cellHtml += `<span style="font-size: 10px; color: #334155; margin-left: 2px;">${promoAge}歳</span>`;
             }
          }
        }
        return `<td class="bg-fuchsia" data-val="${emp[key]||''}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;
      };'''

repl = '''      const getGradeLevelLocal = (grade) => {
        const levels = { "部長級": 10, "次長級": 9, "所属長級": 8, "課長級": 7, "補佐級III(補佐兼班長)": 6, "補佐級II(班長)": 5, "補佐級I(主任)": 4, "係長級(主査)": 3, "一般": 1 };
        return levels[grade] || 0;
      };
      
      const gradeToPromoKey = { "部長級": "promoYearDeptHead", "次長級": "promoYearDeputyHead", "所属長級": "promoYearDivHead", "課長級": "promoYearSecHead", "補佐級III(補佐兼班長)": "promoYearAssistant3", "補佐級II(班長)": "promoYearAssistant2", "補佐級I(主任)": "promoYearAssistant1", "係長級(主査)": "promoYearChief" };

      const renderPromo = (key) => {
        let isNextPromo = false;
        let cellVal = emp[key] || '';
        if (getGradeLevelLocal(emp.nextGrade) > getGradeLevelLocal(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === key) {
           isNextPromo = true;
           cellVal = String(targetYear);
        }

        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        const idx = pKeys.indexOf(key);
        let prevY = NaN;
        if (idx > 0) {
          for (let i = idx - 1; i >= 0; i--) {
            let pVal = pKeys[i] === 'hireDate' ? (emp.hireDate ? emp.hireDate.substring(0,4) : '') : (emp[pKeys[i]] || '');
            if (getGradeLevelLocal(emp.nextGrade) > getGradeLevelLocal(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === pKeys[i]) {
                pVal = String(targetYear);
            }
            const y = parseInt(pVal || 'NaN');
            if (!isNaN(y)) { prevY = y; break; }
          }
        }
        
        const currentY = parseInt(cellVal || 'NaN');
        const diff = (!isNaN(prevY) && !isNaN(currentY) && currentY >= prevY) ? currentY - prevY : null;
        
        let cellHtml = '';
        if (diff !== null) {
          cellHtml += `<span class="diff-span diff-emerald">${diff}年&gt;</span>`;
        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        cellHtml += cellVal;
        if (cellVal) {
          const suffix = getEraSuffixLocal(cellVal);
          if (suffix) cellHtml += `<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">(${suffix})</span>`;
          if (emp.birthDate && !isNaN(currentY)) {
             const promoAge = calculateAge(emp.birthDate, currentY);
             if (promoAge !== null && !isNaN(promoAge)) {
                cellHtml += `<span style="font-size: 10px; color: #334155; margin-left: 2px;">${promoAge}歳</span>`;
             }
          }
        }
        
        let styleStr = isNextPromo ? ' style="background-color: #fef08a;"' : '';
        return `<td class="bg-fuchsia"${styleStr} data-val="${cellVal||''}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;
      };'''

if target in text:
    text = text.replace(target, repl)
    print("renderPromo replaced")
else:
    print("renderPromo target not found")


target_hist = '''      let histHtml = '';
      historyYears.forEach(year => {
        let hStr = '';
        if (year === targetYear) {
          hStr = nDeptName;
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        histHtml += `<td class="bg-emerald" data-val="${hStr}">${hStr}</td>`;
      });'''

repl_hist = '''      let histHtml = '';
      historyYears.forEach(year => {
        let hStr = '';
        let histStyle = '';
        if (year === targetYear) {
          hStr = nDeptName;
          if (getGradeLevelLocal(emp.nextGrade) > getGradeLevelLocal(emp.currentGrade)) {
            histStyle = ' style="background-color: #fef08a;"';
          }
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        histHtml += `<td class="bg-emerald"${histStyle} data-val="${hStr}">${hStr}</td>`;
      });'''

if target_hist in text:
    text = text.replace(target_hist, repl_hist)
    print("histHtml replaced")
else:
    print("histHtml target not found")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
