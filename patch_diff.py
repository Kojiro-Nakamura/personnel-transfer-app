import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target1 = '''      const renderFinalDiff = () => {
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        let prevY = NaN;
        for (let i = pKeys.length - 1; i >= 0; i--) {
          const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
          if (!isNaN(y)) { prevY = y; break; }
        }
        const diff = (!isNaN(prevY)) ? targetYear - prevY + 1 : null;
        let cellHtml = '';
        if (diff !== null) {
          cellHtml += `<span class="arrow">&gt;</span><span class="diff-span diff-blue">${diff >= 0 ? diff : 0}年</span>`;
        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        return `<td class="bg-fuchsia" data-val="${diff !== null ? (diff >= 0 ? diff : 0) : ''}"><div style="display:flex;align-items:center;justify-content:flex-start;">${cellHtml}</div></td>`;
      };'''

repl1 = '''      const renderFinalDiff = () => {
        let diff = null;
        if (getGradeLevelLocal(emp.nextGrade) > getGradeLevelLocal(emp.currentGrade)) {
          diff = 1;
        } else {
          const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
          let prevY = NaN;
          for (let i = pKeys.length - 1; i >= 0; i--) {
            const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
            if (!isNaN(y)) { prevY = y; break; }
          }
          diff = (!isNaN(prevY)) ? targetYear - prevY + 1 : null;
        }
        
        let cellHtml = '';
        if (diff !== null) {
          cellHtml += `<span class="arrow">&gt;</span><span class="diff-span diff-blue">${diff >= 0 ? diff : 0}年</span>`;
        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        return `<td class="bg-fuchsia" data-val="${diff !== null ? (diff >= 0 ? diff : 0) : ''}"><div style="display:flex;align-items:center;justify-content:flex-start;">${cellHtml}</div></td>`;
      };'''

text = text.replace(target1, repl1)

target2 = '<th onclick="sortTable(30)" class="bg-fuchsia" style="width: 56px; color: #dc2626; font-weight: bold;">来年度</th>'
repl2 = '<th onclick="sortTable(30)" class="bg-fuchsia" style="width: 56px;">来年度</th>'
text = text.replace(target2, repl2)

target3 = '${historyYears.map((y, idx) => `<th onclick="sortTable(${31 + idx})" class="bg-emerald" style="width: 60px;">${getEraFormattedYear(y)}</th>`).join(\'\')}'
repl3 = '''      ${historyYears.map((y, idx) => {
        const hStyle = y === targetYear ? "width: 60px; color: #dc2626; font-weight: bold;" : "width: 60px;";
        return `<th onclick="sortTable(${31 + idx})" class="bg-emerald" style="${hStyle}">${getEraFormattedYear(y)}</th>`;
      }).join('')}'''

text = text.replace(target3, repl3)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("done")
