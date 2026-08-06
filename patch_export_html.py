import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add FileCode to imports
if 'FileCode' not in content:
    content = content.replace("List, FileText, DownloadCloud,", "List, FileText, DownloadCloud, FileCode,")

# Find handleExportCSV and insert handleExportHTML right below it
target_func = '  const handleExportCSV = () => {'
end_func_idx = content.find('  const handleDownloadTemplate = () => {')

if end_func_idx == -1:
    print("Error: Could not find handleDownloadTemplate")
    sys.exit(1)

html_export_func = '''
  const handleExportHTML = () => {
    const scriptStr = `
      function sortTable(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("empTable");
        switching = true;
        dir = "asc";
        while (switching) {
          switching = false;
          rows = table.rows;
          for (i = 2; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            var valX = x ? (x.getAttribute("data-val") || x.innerText).toLowerCase() : "";
            var valY = y ? (y.getAttribute("data-val") || y.innerText).toLowerCase() : "";
            var numX = Number(valX);
            var numY = Number(valY);
            if (!isNaN(numX) && !isNaN(numY) && valX !== "" && valY !== "") {
               valX = numX; valY = numY;
            }
            if (dir == "asc") {
              if (valX > valY) { shouldSwitch = true; break; }
            } else if (dir == "desc") {
              if (valX < valY) { shouldSwitch = true; break; }
            }
          }
          if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
          } else {
            if (switchcount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
            }
          }
        }
      }
    `;

    let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>職員一括編集 HTML保存</title>
<style>
  body { font-family: sans-serif; font-size: 11px; margin: 20px; color: #334155; }
  table { border-collapse: collapse; width: max-content; }
  th, td { border: 1px solid #cbd5e1; padding: 4px; text-align: center; vertical-align: middle; white-space: nowrap; }
  th { cursor: pointer; user-select: none; }
  th:hover { opacity: 0.8; }
  .sticky-col { position: sticky; left: 0; z-index: 10; background-color: #f1f5f9; box-shadow: 2px 0 5px -2px rgba(0,0,0,0.2); }
  .bg-slate { background-color: #f1f5f9; }
  .bg-blue { background-color: #eff6ff; }
  .bg-fuchsia { background-color: #fdf4ff; }
  .bg-emerald { background-color: #ecfdf5; }
  .text-left { text-align: left; }
  .arrow { color: #64748b; font-size: 10px; margin: 0 2px; }
  .diff-span { font-size: 10px; font-weight: bold; border-radius: 2px; padding: 1px 3px; margin-right: 2px; border: 1px solid; }
  .diff-emerald { color: #059669; background-color: #ecfdf5; border-color: #d1fae5; }
  .diff-blue { color: #2563eb; background-color: #eff6ff; border-color: #bfdbfe; }
</style>
<script>
${scriptStr}
</script>
</head>
<body>
<table id="empTable">
  <thead>
    <tr>
      <th colspan="6" class="bg-slate">基本情報</th>
      <th colspan="7" class="bg-slate">今年度</th>
      <th colspan="7" class="bg-blue">来年度</th>
      <th colspan="10" class="bg-fuchsia">昇進年度 (西暦)</th>
      ${historyYears.length > 0 ? `<th colspan="${historyYears.length}" class="bg-emerald">履歴</th>` : ''}
    </tr>
    <tr>
      <th onclick="sortTable(0)" class="sticky-col text-left" style="min-width: 100px;">氏名</th>
      <th onclick="sortTable(1)" class="bg-slate">職員番号</th>
      <th onclick="sortTable(2)" class="bg-slate">生年月日</th>
      <th onclick="sortTable(3)" class="bg-slate">最終学歴</th>
      <th onclick="sortTable(4)" class="bg-slate">採用年月日</th>
      <th onclick="sortTable(5)" class="bg-slate">特記事項</th>
      <th onclick="sortTable(6)" class="bg-slate">配置先</th>
      <th onclick="sortTable(7)" class="bg-slate">職名</th>
      <th onclick="sortTable(8)" class="bg-slate">級</th>
      <th onclick="sortTable(9)" class="bg-slate">年数</th>
      <th onclick="sortTable(10)" class="bg-slate">詳細</th>
      <th onclick="sortTable(11)" class="bg-slate">備考</th>
      <th onclick="sortTable(12)" class="bg-slate">カウント除外</th>
      <th onclick="sortTable(13)" class="bg-blue">配置先</th>
      <th onclick="sortTable(14)" class="bg-blue">職名</th>
      <th onclick="sortTable(15)" class="bg-blue">級</th>
      <th onclick="sortTable(16)" class="bg-blue">年数</th>
      <th onclick="sortTable(17)" class="bg-blue">詳細</th>
      <th onclick="sortTable(18)" class="bg-blue">備考</th>
      <th onclick="sortTable(19)" class="bg-blue">カウント除外</th>
      <th onclick="sortTable(20)" class="bg-fuchsia" style="width: 56px;">採用</th>
      <th onclick="sortTable(21)" class="bg-fuchsia" style="width: 72px;">係長級(主査)</th>
      <th onclick="sortTable(22)" class="bg-fuchsia" style="width: 72px;">補佐級I(主任)</th>
      <th onclick="sortTable(23)" class="bg-fuchsia" style="width: 72px;">補佐級II(班長)</th>
      <th onclick="sortTable(24)" class="bg-fuchsia" style="width: 72px;">補佐級III</th>
      <th onclick="sortTable(25)" class="bg-fuchsia" style="width: 72px;">課長級</th>
      <th onclick="sortTable(26)" class="bg-fuchsia" style="width: 72px;">所属長級</th>
      <th onclick="sortTable(27)" class="bg-fuchsia" style="width: 72px;">次長級</th>
      <th onclick="sortTable(28)" class="bg-fuchsia" style="width: 72px;">部長級</th>
      <th onclick="sortTable(29)" class="bg-fuchsia" style="width: 56px;">来年度まで</th>
      ${historyYears.map((y, idx) => `<th onclick="sortTable(${30 + idx})" class="bg-emerald" style="width: 60px;">${getEraFormattedYear(y)}</th>`).join('')}
    </tr>
  </thead>
  <tbody>
`;

    const dMap = new Map(localDepts.map(d => [d.id, d]));
    
    sortedEmps.forEach(emp => {
      const getDeptName = (deptId, postId, groupId, groupPostId) => {
        if (!deptId || deptId === 'unassigned' || deptId === 'retired') return '';
        const dept = dMap.get(deptId);
        if (!dept) return '';
        let str = dept.name;
        if (postId) {
          const p = (dept.posts || []).find(p => p.id === postId);
          if (p) str += '（' + p.name + '）';
        } else if (groupId) {
          const g = (dept.groups || []).find(g => g.id === groupId);
          if (g) {
            str += ' ' + g.name;
            if (groupPostId) {
              const gp = (g.posts || []).find(p => p.id === groupPostId);
              if (gp) str += '（' + gp.name + '）';
            }
          }
        }
        return str;
      };

      const cDeptName = getDeptName(emp.currentDeptId, emp.currentPostId, emp.currentGroupId, emp.currentGroupPostId);
      const nDeptName = getDeptName(emp.departmentId, emp.postId, emp.groupId, emp.groupPostId);

      const renderPromo = (key) => {
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
        cellHtml += emp[key] || '';
        return `<td class="bg-fuchsia" data-val="${emp[key]||''}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;
      };

      const renderFinalDiff = () => {
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        let prevY = NaN;
        for (let i = pKeys.length - 1; i >= 0; i--) {
          const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
          if (!isNaN(y)) { prevY = y; break; }
        }
        const diff = (!isNaN(prevY)) ? targetYear - prevY : null;
        let cellHtml = '';
        if (diff !== null) {
          cellHtml += `<span class="arrow">&gt;</span><span class="diff-span diff-blue">${diff >= 0 ? diff : 0}年</span>`;
        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        return `<td class="bg-fuchsia" data-val="${diff !== null ? (diff >= 0 ? diff : 0) : ''}"><div style="display:flex;align-items:center;justify-content:flex-start;">${cellHtml}</div></td>`;
      };

      let histHtml = '';
      historyYears.forEach(year => {
        let hStr = '';
        if (year === targetYear) {
          hStr = nDeptName;
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        histHtml += `<td class="bg-emerald" data-val="${hStr}">${hStr}</td>`;
      });

      html += `
    <tr>
      <td class="sticky-col text-left" data-val="${emp.name||''}">${emp.name||''}</td>
      <td class="bg-slate" data-val="${emp.employeeNumber||''}">${emp.employeeNumber||''}</td>
      <td class="bg-slate" data-val="${emp.birthDate||''}">${emp.birthDate||''}</td>
      <td class="bg-slate" data-val="${emp.education||''}">${emp.education||''}</td>
      <td class="bg-slate" data-val="${emp.hireDate||''}">${emp.hireDate||''}</td>
      <td class="bg-slate" data-val="${emp.note||''}">${emp.note||''}</td>
      <td class="bg-slate" data-val="${cDeptName}">${cDeptName}</td>
      <td class="bg-slate" data-val="${emp.currentTitle||''}">${emp.currentTitle||''}</td>
      <td class="bg-slate" data-val="${emp.currentGrade||''}">${emp.currentGrade||''}</td>
      <td class="bg-slate" data-val="${emp.currentYears||0}">${emp.currentYears||''}</td>
      <td class="bg-slate" data-val="${emp.currentSkillsStr||''}">${emp.currentSkillsStr||''}</td>
      <td class="bg-slate" data-val="${emp.currentEmploymentType||''}">${emp.currentEmploymentType||''}</td>
      <td class="bg-slate" data-val="${emp.currentExclude||''}">${emp.currentExclude||''}</td>
      
      <td class="bg-blue" data-val="${nDeptName}">${nDeptName}</td>
      <td class="bg-blue" data-val="${emp.nextTitle||''}">${emp.nextTitle||''}</td>
      <td class="bg-blue" data-val="${emp.nextGrade||''}">${emp.nextGrade||''}</td>
      <td class="bg-blue" data-val="${emp.nextYears||0}">${emp.nextYears||''}</td>
      <td class="bg-blue" data-val="${emp.nextSkillsStr||''}">${emp.nextSkillsStr||''}</td>
      <td class="bg-blue" data-val="${emp.nextEmploymentType||''}">${emp.nextEmploymentType||''}</td>
      <td class="bg-blue" data-val="${emp.nextExclude||''}">${emp.nextExclude||''}</td>
      
      <td class="bg-fuchsia" data-val="${emp.hireDate ? emp.hireDate.substring(0,4) : ''}">${emp.hireDate ? emp.hireDate.substring(0,4) : ''}</td>
      ${renderPromo('promoYearChief')}
      ${renderPromo('promoYearAssistant1')}
      ${renderPromo('promoYearAssistant2')}
      ${renderPromo('promoYearAssistant3')}
      ${renderPromo('promoYearSecHead')}
      ${renderPromo('promoYearDivHead')}
      ${renderPromo('promoYearDeputyHead')}
      ${renderPromo('promoYearDeptHead')}
      ${renderFinalDiff()}
      
      ${histHtml}
    </tr>`;
    });

    html += `
  </tbody>
</table>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `人事異動案_職員一括_${targetYear}年度.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
'''

content = content[:end_func_idx] + html_export_func + content[end_func_idx:]

# Insert HTML button next to CSV button
target_btn = '''<button 
              onClick={handleExportCSV} 
              className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold flex items-center gap-1 border border-indigo-200 hover:bg-indigo-200 transition-colors" 
              title="現在の編集内容をCSV形式で保存します"
            >
              <DownloadCloud className="w-3.5 h-3.5" />CSV保存
            </button>'''

repl_btn = target_btn + '''
            <button 
              onClick={handleExportHTML} 
              className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold flex items-center gap-1 border border-orange-200 hover:bg-orange-200 transition-colors" 
              title="現在の内容をHTML形式で保存します（閲覧・ソート用）"
            >
              <FileCode className="w-3.5 h-3.5" />HTML保存
            </button>'''

content = content.replace(target_btn, repl_btn)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS added handleExportHTML and button")
