import { getGradeLevel, getEraFormattedYear, calculateAge, getPlacementName, getPromotedBgColorCode } from './helpers.js';

const getBorderHexColor = (grade) => {
  switch (grade) {
    case "部長級": return "#c084fc";
    case "次長級": return "#f87171";
    case "所属長級": return "#fb923c";
    case "課長級": return "#facc15";
    case "補佐級III(補佐兼班長)": return "#38bdf8";
    case "補佐級II(班長)": return "#34d399";
    case "補佐級I(主任)": return "#f472b6";
    case "係長級(主査)": return "#94a3b8";
    case "一般": return "#a5b4fc";
    default: return "#cbd5e1";
  }
};

export const generateAndDownloadHTML = (employees, departments, targetYear, fileName) => {
  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');
  const targetEraShort = getEraFormattedYear(targetYear).split('(')[1].replace(')', '');
  const yearsSet = new Set();
  yearsSet.add(targetYear);
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => yearsSet.add(h.year));
  });
  const historyYears = Array.from(yearsSet).sort((a, b) => a - b);

  const getEraSuffixLocal = (y) => {
    const eraStr = getEraFormattedYear(y);
    const match = eraStr.match(/([RSHM])(\d+)/);
    return match ? `${match[1]}${match[2]}` : String(y).substring(2);
  };

  const formatWithEra = (dateStr) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})[-/]/);
    if (match) {
      const year = parseInt(match[1], 10);
      let era = '';
      if (year >= 2019) era = `(R${year - 2018})`;
      else if (year >= 1989) era = `(H${year - 1988})`;
      else if (year >= 1926) era = `(S${year - 1925})`;
      else if (year >= 1912) era = `(T${year - 1911})`;
      return era ? `${era}${dateStr}` : dateStr;
    }
    return dateStr;
  };

  const gradeToPromoKey = {
    '主任級': 'promoYearChief',
    '主査級（１）': 'promoYearAssistant1',
    '主査級（２）': 'promoYearAssistant2',
    '主査級（３）': 'promoYearAssistant3',
    '課長級': 'promoYearSecHead',
    '所属長級': 'promoYearDivHead',
    '次長級': 'promoYearDeputyHead',
    '部長級': 'promoYearDeptHead'
  };



    const scriptStr = `
      function saveHTML() {
        var htmlContent = "<!DOCTYPE html><html>" + document.documentElement.innerHTML + "</html>";
        var blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        var now = new Date();
        var y = now.getFullYear();
        var m = ("0" + (now.getMonth() + 1)).slice(-2);
        var d = ("0" + now.getDate()).slice(-2);
        var h = ("0" + now.getHours()).slice(-2);
        var min = ("0" + now.getMinutes()).slice(-2);
        a.download = "職員一覧_保存_" + y + m + d + "_" + h + min + ".html";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function clearSelection() {
        var table = document.getElementById("empTable");
        var tbody = table.getElementsByTagName("tbody")[0];
        if (!tbody) return;
        var rows = Array.from(tbody.rows);
        for (var i = 0; i < rows.length; i++) {
          rows[i].classList.remove("highlight");
        }
      }

      function resetSort() {
        var table = document.getElementById("empTable");
        var tbody = table.getElementsByTagName("tbody")[0];
        if (!tbody) return;
        var rows = Array.from(tbody.rows);
        rows.sort(function(a, b) {
          return parseInt(a.getAttribute("data-original-index")) - parseInt(b.getAttribute("data-original-index"));
        });
        for (var i = 0; i < rows.length; i++) {
          tbody.appendChild(rows[i]);
        }
      }

      function sortTable(n) {
        var table, tbody, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("empTable");
        tbody = table.getElementsByTagName("tbody")[0];
        if (!tbody) return;
        switching = true;
        dir = "desc";
        while (switching) {
          switching = false;
          rows = tbody.rows;
          for (i = 0; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            var tdsX = rows[i].getElementsByTagName("TD");
            var tdsY = rows[i + 1].getElementsByTagName("TD");
            x = tdsX.length > n ? tdsX[n] : null;
            y = tdsY.length > n ? tdsY[n] : null;
            var valX = x ? (x.hasAttribute("data-val") ? x.getAttribute("data-val") : x.textContent).toLowerCase() : "";
            var valY = y ? (y.hasAttribute("data-val") ? y.getAttribute("data-val") : y.textContent).toLowerCase() : "";
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
            if (switchcount == 0 && dir == "desc") {
              dir = "asc";
              switching = true;
            }
          }
        }
      }

      document.addEventListener("DOMContentLoaded", function() {
        var nameCol = document.querySelector("th.sticky-name");
        if (nameCol) {
          var w = nameCol.getBoundingClientRect().width;
          var style = document.createElement("style");
          style.innerHTML = ".sticky-age { left: " + w + "px !important; }";
          document.head.appendChild(style);
        }
        var tbody = document.querySelector("#empTable tbody");
        if(tbody) {
          let draggedRow = null;
          
          tbody.addEventListener("dragstart", function(e) {
            if (e.target.tagName === "TR") {
              draggedRow = e.target;
              e.target.style.opacity = '0.5';
              e.dataTransfer.effectAllowed = 'move';
            }
          });
          
          tbody.addEventListener("dragend", function(e) {
            if (e.target.tagName === "TR") {
              e.target.style.opacity = '1';
              e.target.removeAttribute("draggable");
              draggedRow = null;
              var rows = Array.from(tbody.rows);
              for (var i = 0; i < rows.length; i++) {
                 rows[i].classList.remove('drag-over-top', 'drag-over-bottom');
              }
            }
          });
          
          tbody.addEventListener("dragover", function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            var targetRow = e.target.closest("tr");
            if (targetRow && draggedRow && targetRow !== draggedRow && targetRow.parentNode === tbody) {
              var bounding = targetRow.getBoundingClientRect();
              var offset = bounding.y + (bounding.height / 2);
              
              var rows = Array.from(tbody.rows);
              for (var i = 0; i < rows.length; i++) {
                 if (rows[i] !== targetRow) rows[i].classList.remove('drag-over-top', 'drag-over-bottom');
              }
              
              if (e.clientY - offset > 0) {
                targetRow.classList.remove('drag-over-top');
                targetRow.classList.add('drag-over-bottom');
              } else {
                targetRow.classList.remove('drag-over-bottom');
                targetRow.classList.add('drag-over-top');
              }
            }
          });
          
          tbody.addEventListener("dragleave", function(e) {
            var targetRow = e.target.closest("tr");
            if (targetRow) {
              targetRow.classList.remove('drag-over-top', 'drag-over-bottom');
            }
          });
          
          tbody.addEventListener("drop", function(e) {
            e.preventDefault();
            var targetRow = e.target.closest("tr");
            if (targetRow && draggedRow && targetRow !== draggedRow && targetRow.parentNode === tbody) {
              var bounding = targetRow.getBoundingClientRect();
              var offset = bounding.y + (bounding.height / 2);
              if (e.clientY - offset > 0) {
                tbody.insertBefore(draggedRow, targetRow.nextSibling);
              } else {
                tbody.insertBefore(draggedRow, targetRow);
              }
            }
            if (targetRow) {
              targetRow.classList.remove('drag-over-top', 'drag-over-bottom');
            }
          });
          
          tbody.addEventListener("mousedown", function(e) {
            var td = e.target.closest("td");
            if (td) {
              var tr = e.target.closest("tr");
              if (tr) tr.setAttribute("draggable", "true");
            }
          });
          
          tbody.addEventListener("mouseup", function(e) {
            var td = e.target.closest("td");
            if (td) {
              var tr = e.target.closest("tr");
              if (tr) tr.removeAttribute("draggable");
            }
          });

          tbody.addEventListener("click", function(e) {
            var tr = e.target.closest("tr");
            if(tr) {
              tr.classList.toggle("highlight");
            }
          });
        }
      });
    `;

    let html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="google" content="notranslate">
<title>${targetEraShort}職員一覧HTML</title>
<style>
  body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; font-size: 11px; margin: 0; color: #334155; -webkit-font-smoothing: auto; -moz-osx-font-smoothing: auto; }
  table { border-collapse: separate; border-spacing: 0; width: max-content; }
  th, td { border-right: 1px solid #94a3b8; border-bottom: 1px solid #94a3b8; padding: 4px; text-align: center; vertical-align: middle; white-space: nowrap; background-clip: padding-box; }
  th, strong, b { font-weight: 600; }
  th { cursor: pointer; user-select: none; position: relative; padding-right: 14px !important; }
  th:hover { filter: brightness(0.95); }
  th[onclick]::after { content: '⇅'; font-size: 8px; color: #64748b; position: absolute; right: 3px; top: 50%; transform: translateY(-50%); opacity: 0.5; }
  th[onclick]:hover::after { opacity: 1; color: #334155; }
  
  /* Fix borders */
  thead tr:first-child th { border-top: 1px solid #94a3b8; }
  th:first-child, td:first-child { border-left: 1px solid #94a3b8; }
  
  /* Header backgrounds */
  thead th.bg-slate { background-color: #cbd5e1; }
  thead th.bg-blue { background-color: #bfdbfe; }
  thead th.bg-fuchsia { background-color: #f5d0fe; }
  thead th.bg-emerald { background-color: #a7f3d0; }
  
  /* Body backgrounds */
  tbody td.bg-slate { background-color: #f8fafc; }
  tbody td.bg-blue { background-color: #eff6ff; }
  tbody td.bg-fuchsia { background-color: #fdf4ff; }
  tbody td.bg-emerald { background-color: #ecfdf5; }
  
  /* Sticky name column */
  .sticky-name { position: sticky; left: 0; font-weight: 600; min-width: 125px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }
  tbody td.sticky-name { z-index: 10; background-color: #e2e8f0; }
  thead th.sticky-name { z-index: 30; background-color: #94a3b8; color: #fff; }

  /* Sticky age column */
  .sticky-age { position: sticky; left: 90px; font-weight: 600; min-width: 50px; width: 50px; box-sizing: border-box; }
  tbody td.sticky-age { z-index: 10; background-color: #e2e8f0; }
  thead th.sticky-age { z-index: 30; background-color: #94a3b8; color: #fff; }
  
  /* Thead sticky */
  thead { position: sticky; top: 0; z-index: 20; }
  
  .text-left { text-align: left; }
  .arrow { color: #64748b; font-size: 10px; margin: 0 2px; }
  .drag-over-top td { box-shadow: inset 0 2px 0 0 #2563eb !important; }
  .drag-over-bottom td { box-shadow: inset 0 -2px 0 0 #2563eb !important; }
  
  tbody td { cursor: grab; user-select: none; }
  tbody td:active { cursor: grabbing; }

  .diff-span { font-size: 10px; font-weight: 600; border-radius: 2px; padding: 1px 3px; margin-right: 2px; border: 1px solid; }
  .diff-emerald { color: #059669; background-color: #ecfdf5; border-color: #d1fae5; }
  .diff-blue { color: #2563eb; background-color: #eff6ff; border-color: #bfdbfe; }
  .highlight > td { background-color: #fef08a !important; }
  .promo-highlight { background-color: #fed7aa !important; }
  .highlight > td.promo-highlight { background-color: #fdba74 !important; }
  tbody tr { cursor: pointer; }
  tbody tr:hover > td { opacity: 0.9; }
</style>
<script>
${scriptStr}
</script>
</head>
<body>
<table id="empTable">
  <thead>
    <tr>
      <th class="sticky-name bg-slate" style="vertical-align: middle; padding: 1px;"><div style="display:flex; gap:2px; justify-content:center;"><button onclick="resetSort()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">最初に戻す</button><button onclick="clearSelection()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">選択解除</button></div></th>
      <th class="sticky-age bg-slate" style="vertical-align: middle; padding: 1px;"><div style="display:flex; justify-content:center;"><button onclick="saveHTML()" style="cursor: pointer; font-size: 9px; padding: 1px 3px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 3px; color: #334155;">保存</button></div></th>
      <th colspan="5" class="bg-slate">基本情報</th>
      <th colspan="7" class="bg-slate">今年度（現行）${getEraFormattedYear(targetYear - 1)}</th>
      <th colspan="7" class="bg-blue">来年度（新組織）${getEraFormattedYear(targetYear)}</th>
      <th colspan="10" class="bg-fuchsia">昇進年度</th>
      ${historyYears.length > 0 ? `<th colspan="${historyYears.length}" class="bg-emerald">履歴</th>` : ''}
    </tr>
    <tr>
      <th onclick="sortTable(0)" class="sticky-name text-left">氏名</th>
      <th onclick="sortTable(1)" class="sticky-age">${currentEraShort}年齢</th>
      <th onclick="sortTable(1)" class="bg-slate">職員番号</th>
      <th onclick="sortTable(3)" class="bg-slate">生年月日</th>
      <th onclick="sortTable(4)" class="bg-slate">最終学歴</th>
      <th onclick="sortTable(5)" class="bg-slate">採用年月日</th>
      <th onclick="sortTable(6)" class="bg-slate">特記事項</th>
      <th onclick="sortTable(7)" class="bg-slate">配置先</th>
      <th onclick="sortTable(8)" class="bg-slate">職名</th>
      <th onclick="sortTable(9)" class="bg-slate">級</th>
      <th onclick="sortTable(10)" class="bg-slate">年数</th>
      <th onclick="sortTable(11)" class="bg-slate">詳細</th>
      <th onclick="sortTable(12)" class="bg-slate">備考</th>
      <th onclick="sortTable(13)" class="bg-slate">カウント除外</th>
      <th onclick="sortTable(14)" class="bg-blue">配置先</th>
      <th onclick="sortTable(15)" class="bg-blue">職名</th>
      <th onclick="sortTable(16)" class="bg-blue">級</th>
      <th onclick="sortTable(17)" class="bg-blue">年数</th>
      <th onclick="sortTable(18)" class="bg-blue">詳細</th>
      <th onclick="sortTable(19)" class="bg-blue">備考</th>
      <th onclick="sortTable(20)" class="bg-blue">カウント除外</th>
      <th onclick="sortTable(21)" class="bg-fuchsia" style="width: 56px;">採用</th>
      <th onclick="sortTable(22)" style="width: 80px; background-color: ${getPromotedBgColorCode('係長級(主査)')};">係長級(主査)</th>
      <th onclick="sortTable(23)" style="width: 80px; background-color: ${getPromotedBgColorCode('補佐級I(主任)')};">補佐級I(主任)</th>
      <th onclick="sortTable(24)" style="width: 80px; background-color: ${getPromotedBgColorCode('補佐級II(班長)')};">補佐級II(班長)</th>
      <th onclick="sortTable(25)" style="width: 80px; background-color: ${getPromotedBgColorCode('補佐級III(補佐兼班長)')};">補佐級III</th>
      <th onclick="sortTable(26)" style="width: 80px; background-color: ${getPromotedBgColorCode('課長級')};">課長級</th>
      <th onclick="sortTable(27)" style="width: 80px; background-color: ${getPromotedBgColorCode('所属長級')};">所属長級</th>
      <th onclick="sortTable(28)" style="width: 80px; background-color: ${getPromotedBgColorCode('次長級')};">次長級</th>
      <th onclick="sortTable(29)" style="width: 80px; background-color: ${getPromotedBgColorCode('部長級')};">部長級</th>
      <th onclick="sortTable(30)" class="bg-fuchsia" style="width: 56px;">来年度<br>${getEraFormattedYear(targetYear)}</th>
            ${historyYears.map((y, idx) => {
        const hStyle = y === targetYear ? "width: 60px; color: #dc2626; font-weight: bold;" : "width: 60px;";
        return `<th onclick="sortTable(${31 + idx})" class="bg-emerald" style="${hStyle}">${getEraFormattedYear(y)}</th>`;
      }).join('')}
    </tr>
  </thead>
  <tbody>
`;

    const dMap = new Map(departments.map(d => [d.id, d]));
    
    const sortedEmployees = [...employees].sort((a, b) => {
        const gradeA = getGradeLevel(a.currentGrade);
        const gradeB = getGradeLevel(b.currentGrade);
        if (gradeA !== gradeB) {
          return gradeB - gradeA;
        }
        
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        const getYear = (emp) => {
            for (let i = pKeys.length - 1; i >= 0; i--) {
                const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                if (!isNaN(y)) return y;
            }
            return NaN;
        };
        const yA = getYear(a);
        const yB = getYear(b);
        
        if (!isNaN(yA) && !isNaN(yB)) {
            return yA - yB;
        } else if (!isNaN(yA)) {
            return -1;
        } else if (!isNaN(yB)) {
            return 1;
        }
        return 0;
    });

    sortedEmployees.forEach((emp, index) => {
      const getDeptName = (deptId, postId, groupId, groupPostId, isNext) => {
        if (!deptId || deptId === 'unassigned' || deptId === 'retired') return '';
        const dept = dMap.get(deptId);
        if (!dept) return '';
        
        let str = isNext ? (dept.nextName || dept.name) : dept.name;
        
        if (postId) {
          const p = (dept.posts || []).find(p => p.id === postId);
          if (p) str += '（' + (isNext ? (p.nextName || p.name) : p.name) + '）';
        } else if (groupId) {
          const g = (dept.groups || []).find(g => g.id === groupId);
          if (g) {
            str += ' ' + (isNext ? (g.nextName || g.name) : g.name);
            if (groupPostId) {
              const gp = (g.posts || []).find(p => p.id === groupPostId);
              if (gp) str += '（' + (isNext ? (gp.nextName || gp.name) : gp.name) + '）';
            }
          }
        }
        return str;
      };

      const cDeptName = getDeptName(emp.currentDeptId, emp.currentPostId, emp.currentGroupId, emp.currentGroupPostId, false);
      const nDeptName = getDeptName(emp.departmentId, emp.postId, emp.groupId, emp.groupPostId, true);

      const getGradeLevel = (grade) => {
        const levels = { "部長級": 10, "次長級": 9, "所属長級": 8, "課長級": 7, "補佐級III(補佐兼班長)": 6, "補佐級II(班長)": 5, "補佐級I(主任)": 4, "係長級(主査)": 3, "一般": 1 };
        return levels[grade] || 0;
      };
      
      const gradeToPromoKey = { "部長級": "promoYearDeptHead", "次長級": "promoYearDeputyHead", "所属長級": "promoYearDivHead", "課長級": "promoYearSecHead", "補佐級III(補佐兼班長)": "promoYearAssistant3", "補佐級II(班長)": "promoYearAssistant2", "補佐級I(主任)": "promoYearAssistant1", "係長級(主査)": "promoYearChief" };

      const renderPromo = (key) => {
        let isNextPromo = false;
        let cellVal = emp[key] || '';
        let targetGrade = '';
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        const gradeList = ['', '係長級(主査)', '補佐級I(主任)', '補佐級II(班長)', '補佐級III(補佐兼班長)', '課長級', '所属長級', '次長級', '部長級'];
        const idx = pKeys.indexOf(key);
        if (idx > 0) targetGrade = gradeList[idx];

        if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === key) {
           isNextPromo = true;
           cellVal = String(targetYear);
        }

        let prevY = NaN;
        if (idx > 0) {
          for (let i = idx - 1; i >= 0; i--) {
            let pVal = pKeys[i] === 'hireDate' ? (emp.hireDate ? emp.hireDate.substring(0,4) : '') : (emp[pKeys[i]] || '');
            if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade) && gradeToPromoKey[emp.nextGrade] === pKeys[i]) {
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
          cellHtml += `<span class="diff-span diff-emerald">${diff + 1}年目&gt;</span>`;
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
        
        const promoColor = isNextPromo ? getPromotedBgColorCode(emp.nextGrade) : '';
        const styleStr = promoColor ? ` style="background-color: ${promoColor} !important;"` : '';
        return `<td class="bg-fuchsia" data-val="${cellVal||''}"${styleStr}><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;
      };

      const renderFinalDiff = (nStyle) => {
        let diff = null;
        if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade)) {
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
          cellHtml += `<span class="arrow">&gt;</span><span class="diff-span diff-blue">${diff >= 0 ? diff : 0}年目</span>`;
        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        return `<td class="bg-fuchsia" data-val="${diff !== null ? (diff >= 0 ? diff : 0) : ''}"${nStyle}><div style="display:flex;align-items:center;justify-content:flex-start;">${cellHtml}</div></td>`;
      };

      const promoYearMap = {};
      if (emp.promoYearChief) promoYearMap[emp.promoYearChief] = "係長級(主査)";
      if (emp.promoYearAssistant1) promoYearMap[emp.promoYearAssistant1] = "補佐級I(主任)";
      if (emp.promoYearAssistant2) promoYearMap[emp.promoYearAssistant2] = "補佐級II(班長)";
      if (emp.promoYearAssistant3) promoYearMap[emp.promoYearAssistant3] = "補佐級III(補佐兼班長)";
      if (emp.promoYearSecHead) promoYearMap[emp.promoYearSecHead] = "課長級";
      if (emp.promoYearDivHead) promoYearMap[emp.promoYearDivHead] = "所属長級";
      if (emp.promoYearDeputyHead) promoYearMap[emp.promoYearDeputyHead] = "次長級";
      if (emp.promoYearDeptHead) promoYearMap[emp.promoYearDeptHead] = "部長級";

      let histHtml = '';
      let prevDept = null;
      
      historyYears.forEach(year => {
        let hStr = '';
        let histStyleCss = '';
        if (year === targetYear) {
          hStr = nDeptName;
          if (getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade)) {
            const c = getPromotedBgColorCode(emp.nextGrade);
            if (c) histStyleCss += `background-color: ${c} !important; `;
          }
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        
        let displayStr = hStr;
        if (hStr && hStr !== ' / 課直属' && hStr !== '未配置' && hStr !== '-') {
          if (year === targetYear || prevDept === null || hStr !== prevDept) {
            histStyleCss += `color: #000; font-weight: bold; `;
          }
          prevDept = hStr;

          const histAge = (emp.birthDate && !isNaN(year)) ? calculateAge(emp.birthDate, year) : null;
          if (histAge !== null && !isNaN(histAge)) {
            displayStr = `${hStr} <span style="font-size: 0.85em;">(${histAge}歳)</span>`;
          }
        }

        const promoGrade = promoYearMap[year];
        if (promoGrade) {
          histStyleCss += `box-shadow: inset 0 0 0 2px ${getBorderHexColor(promoGrade)}; `;
        }

        const histStyleAttr = histStyleCss ? ` style="${histStyleCss}"` : '';
        histHtml += `<td class="bg-emerald" data-val="${hStr}"${histStyleAttr}>${displayStr}</td>`;
      });

            let ageNum = '';
      if (emp.birthDate) {
        const age = calculateAge(emp.birthDate, targetYear - 1);
        if (age !== null && !isNaN(age)) {
          ageNum = age;
        }
      }
      const nameVal = emp.name || '';
      
      const isNextRetired = emp.departmentId === 'retired';
      const nTitle = isNextRetired ? '' : (emp.nextTitle || '');
      const nGrade = isNextRetired ? '' : (emp.nextGrade || '');
      const nSkills = isNextRetired ? '' : (emp.nextSkillsStr || '');
      const nEmpType = isNextRetired ? '' : (emp.nextEmploymentType || '');
      const nExclude = isNextRetired ? '' : (emp.nextExclude || '');
      
      const isNextPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
      const nextPromoColor = isNextPromoted ? getPromotedBgColorCode(emp.nextGrade) : '';
      const nStyle = nextPromoColor ? ` style="background-color: ${nextPromoColor} !important;"` : '';

      html += `
    <tr data-original-index="${index}">
      <td class="sticky-name text-left" data-val="${nameVal}"${nStyle}><span class="drag-handle" style="cursor: grab; margin-right: 4px; color: #94a3b8;" title="ドラッグで並べ替え">≡</span>${nameVal}</td>
      <td class="sticky-age" data-val="${ageNum}"${nStyle}>${ageNum !== '' ? ageNum + '歳' : ''}</td>
      <td class="bg-slate" data-val="${emp.employeeNumber||''}">${emp.employeeNumber||''}</td>
      <td class="bg-slate" data-val="${emp.birthDate||''}">${formatWithEra(emp.birthDate)}</td>
      <td class="bg-slate" data-val="${emp.education||''}">${emp.education||''}</td>
      <td class="bg-slate" data-val="${emp.hireDate||''}">${formatWithEra(emp.hireDate)}</td>
      <td class="bg-slate" data-val="${emp.note||''}">${emp.note||''}</td>
      <td class="bg-slate" data-val="${cDeptName}">${cDeptName}</td>
      <td class="bg-slate" data-val="${emp.currentTitle||''}">${emp.currentTitle||''}</td>
      <td class="bg-slate" data-val="${emp.currentGrade||''}">${emp.currentGrade||''}</td>
      <td class="bg-slate" data-val="${emp.currentYears||0}">${emp.currentYears||''}</td>
      <td class="bg-slate" data-val="${emp.currentSkillsStr||''}">${emp.currentSkillsStr||''}</td>
      <td class="bg-slate" data-val="${emp.currentEmploymentType||''}">${emp.currentEmploymentType||''}</td>
      <td class="bg-slate" data-val="${emp.currentExclude||''}">${emp.currentExclude||''}</td>
      
      <td class="bg-blue" data-val="${nDeptName}"${nStyle}>${nDeptName}</td>
      <td class="bg-blue" data-val="${nTitle}"${nStyle}>${nTitle}</td>
      <td class="bg-blue" data-val="${nGrade}"${nStyle}>${nGrade}</td>
      ${(() => {
        if (isNextRetired) return `<td class="bg-blue" data-val=""${nStyle}></td>`;
        const isPromoted = getGradeLevel(emp.nextGrade) > getGradeLevel(emp.currentGrade);
        const displayYears = isPromoted ? 1 : (emp.nextYears || '');
        const valYears = isPromoted ? 1 : (emp.nextYears || 0);
        return `<td class="bg-blue" data-val="${valYears}"${nStyle}>${displayYears}</td>`;
      })()}
      <td class="bg-blue" data-val="${nSkills}"${nStyle}>${nSkills}</td>
      <td class="bg-blue" data-val="${nEmpType}"${nStyle}>${nEmpType}</td>
      <td class="bg-blue" data-val="${nExclude}"${nStyle}>${nExclude}</td>
      
      ${(() => {
        const hireYear = emp.hireDate ? emp.hireDate.substring(0,4) : '';
        let cellHtml = hireYear;
        if (hireYear) {
          const suffix = getEraSuffixLocal(hireYear);
          if (suffix) cellHtml += `<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">(${suffix})</span>`;
          if (emp.birthDate) {
             const hAge = calculateAge(emp.birthDate, parseInt(hireYear));
             if (hAge !== null && !isNaN(hAge)) {
                cellHtml += `<span style="font-size: 10px; color: #334155; margin-left: 2px;">${hAge}歳</span>`;
             }
          }
        }
        return `<td class="bg-fuchsia" data-val="${hireYear}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;
      })()}
      ${renderPromo('promoYearChief')}
      ${renderPromo('promoYearAssistant1')}
      ${renderPromo('promoYearAssistant2')}
      ${renderPromo('promoYearAssistant3')}
      ${renderPromo('promoYearSecHead')}
      ${renderPromo('promoYearDivHead')}
      ${renderPromo('promoYearDeputyHead')}
      ${renderPromo('promoYearDeptHead')}
      ${renderFinalDiff(nStyle)}
      
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
        const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const eraYear = getEraFormattedYear(targetYear);
    link.setAttribute("download", fileName ? (fileName.endsWith('.html') ? fileName : fileName + '.html') : `${dateStr}_${eraYear}年度_職員一覧.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
};
