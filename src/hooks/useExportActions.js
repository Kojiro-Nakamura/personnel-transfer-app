import { useCallback } from 'react';
import { downloadFile, traverseOrgTree, getCounts, formatCountText, calculateAge, isPromotedGrade, getPromotedBgColorCode, generateGradeSummary, getMaxDeptLevel, getMaxGroupLevel } from '../utils/helpers.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../constants/config.js';
import { exportPlanToExcel } from '../utils/exportExcel.js';

export function useExportActions({ targetYear, activePlanId, plans, employees, departments, notes, filterLevel, deptMap, currMap, nextMap, setCurrentFileName }) {
  const exportToJSON = useCallback((fileName) => {
    const dataToSave = { 
      targetYear, 
      activePlanId, 
      plans: plans.map(p => p.id === activePlanId ? { ...p, employees, departments, notes } : p) 
    };
    downloadFile(JSON.stringify(dataToSave, null, 2), 'application/json', fileName);
    setCurrentFileName(fileName);
  }, [targetYear, activePlanId, plans, employees, departments, notes, setCurrentFileName]);

  const exportToHTML = useCallback((fileName) => {
    const escapeHtml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    
    const dateObj = new Date();
    const printDate = `${dateObj.getFullYear()}年${dateObj.getMonth()+1}月${dateObj.getDate()}日 ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

    const getYearsStr = (emp, isNext) => { 
      if (!emp) return ''; 
      const years = isNext ? emp.nextYears : emp.currentYears;
      const skills = isNext ? emp.nextSkills : emp.currentSkills; 
      return skills?.length ? `${years}年(${skills.join('、')})` : `${years}年`; 
    };
    
    const getNoteStr = (emp, isNext) => {
      if (!emp) return '';
      return isNext ? emp.nextEmploymentType : emp.currentEmploymentType;
    };
    
    const getAgeStr = (emp, isNext) => {
      if (!emp || !emp.birthDate) return '';
      const age = calculateAge(emp.birthDate, isNext ? targetYear : targetYear - 1);
      return age !== '' ? `${age}歳` : '';
    };

    const generateTds = (emp, id, isNext, isHighlight) => { 
      const attributes = (id ? ` data-emp-id="${id}"` : '') + (isHighlight ? ' class="post-cell"' : ''); 
      let promoStyle = '';
      if (emp && isNext && isPromotedGrade(emp.currentGrade, emp.nextGrade)) {
        const colorCode = getPromotedBgColorCode(emp.nextGrade);
        if (colorCode) { 
          promoStyle = ` style="background-color: ${colorCode};"`; 
        }
      }
      const values = [
        { val: emp ? (isNext ? emp.nextTitle : emp.currentTitle) : '', attr: attributes + promoStyle }, 
        { val: emp ? emp.name : '', attr: attributes + promoStyle }, 
        { val: emp ? (isNext ? emp.nextGrade : emp.currentGrade) : '', attr: attributes + promoStyle }, 
        { val: getAgeStr(emp, isNext), attr: attributes + promoStyle }, 
        { val: getYearsStr(emp, isNext), attr: attributes + promoStyle }, 
        { val: getNoteStr(emp, isNext), attr: attributes + promoStyle }
      ];
      return values.map(v => `<td${v.attr}>${escapeHtml(v.val)}</td>`).join(''); 
    };
    
    const generateTbody = () => {
      let rowsHtml = ''; let lastDept = null; let lastGroup = null; let lastPost = null;
      
      traverseOrgTree(departments, deptMap, currMap, nextMap, 0, (dept, group, postName, currEmp, nextEmp, rowType, i, post) => {
        const deptName = dept.nextName && dept.nextName !== dept.name ? `${dept.name} / ${dept.nextName}` : dept.name;
        const groupName = group ? (group.nextName && group.nextName !== group.name ? `${group.name} / ${group.nextName}` : group.name) : '';
        
        let formattedPostName = postName;
        if (post && post.nextName && post.nextName !== post.name) {
          formattedPostName = `${post.name} / ${post.nextName}`;
        }

        const isNewDept = deptName !== lastDept;
        const isNewGroup = isNewDept || groupName !== lastGroup;
        const displayPost = (isNewGroup || formattedPostName !== lastPost) ? formattedPostName : '';
        
        lastDept = deptName; lastGroup = groupName; lastPost = formattedPostName;



        let displayDeptHtml = '';
        if (isNewDept) {
          if (dept.id && deptMap[dept.id]) {
            const dm = deptMap[dept.id];
            const deptCurrEmps = [...dm.direct.current];
            const deptNextEmps = [...dm.direct.next];
            
            Object.values(dm.posts).forEach(p => { 
              deptCurrEmps.push(...p.current); 
              deptNextEmps.push(...p.next); 
            });
            Object.values(dm.groups).forEach(g => {
              deptCurrEmps.push(...g.direct.current); 
              deptNextEmps.push(...g.direct.next);
              Object.values(g.posts).forEach(gp => { 
                deptCurrEmps.push(...gp.current); 
                deptNextEmps.push(...gp.next); 
              });
            });
            
            const cCounts = getCounts(deptCurrEmps, false);
            const nCounts = getCounts(deptNextEmps, true);
            displayDeptHtml = `${escapeHtml(deptName)} <span style="font-size:10px;font-weight:normal;color:#64748b;margin-left:4px;">（今:${formatCountText(cCounts)} / 来:${formatCountText(nCounts)}）</span>`;
          } else {
            displayDeptHtml = escapeHtml(deptName);
          }
        }



        let displayGroupHtml = '';
        if (isNewGroup && groupName !== '') {
          if (dept.id && group && group.id && deptMap[dept.id].groups[group.id]) {
            const gm = deptMap[dept.id].groups[group.id];
            const grpCurrEmps = [...gm.direct.current];
            const grpNextEmps = [...gm.direct.next];
            
            Object.values(gm.posts).forEach(gp => { 
              grpCurrEmps.push(...gp.current); 
              grpNextEmps.push(...gp.next); 
            });
            
            const gCCounts = getCounts(grpCurrEmps, false);
            const gNCounts = getCounts(grpNextEmps, true);
            displayGroupHtml = `${escapeHtml(groupName)} <span style="font-size:10px;font-weight:normal;color:#64748b;margin-left:4px;">（今:${formatCountText(gCCounts)} / 来:${formatCountText(gNCounts)}）</span>`;
          } else {
            displayGroupHtml = escapeHtml(groupName);
          }
        }

        let targetId = '';
        if (rowType === 'post') targetId = `postRow-${dept.id}-${post.id}-${i}`;
        else if (rowType === 'groupPost') targetId = `groupPostRow-${dept.id}-${group.id}-${post.id}-${i}`;
        else if (rowType === 'direct') targetId = `directRow-${dept.id}-${group.id}-${i}`;
        else if (rowType === 'deptDirect') targetId = `deptDirectRow-${dept.id}-${i}`;
        else if (rowType === 'system') targetId = `side-${nextEmp ? nextEmp.id : currEmp?.id}`;

        const note = notes.find(n => n.targetId === targetId);
        let noteStr = note && note.text ? note.text : '';

        if (isNewDept && dept.id) {
           const dNote = notes.find(n => n.targetId === `dept-${dept.id}`);
           if (dNote && dNote.text) {
             if (noteStr) noteStr += '\n';
             noteStr += `[部署メモ] ${dNote.text}`;
           }
        }
        if (isNewGroup && group && group.id) {
           const gNote = notes.find(n => n.targetId === `groupHeader-${dept.id}-${group.id}`);
           if (gNote && gNote.text) {
             if (noteStr) noteStr += '\n';
             noteStr += `[班メモ] ${gNote.text}`;
           }
        }

        const rowNoteHtml = noteStr
          ? `<td style="color:#0369a1; white-space:pre-wrap; max-width:200px; font-size:11px;">${escapeHtml(noteStr)}</td>` 
          : '<td></td>';

        const isPostCell = postName !== '' && postName !== '班員';
        const isDeptPost = isPostCell && groupName === ''; 
        const isGroupPost = isPostCell && groupName !== '';
        const isDeptLevelHighlight = isNewDept || isDeptPost;
        const isGroupLevelHighlight = isDeptLevelHighlight || isNewGroup || isGroupPost;
        const isPostLevelHighlight = isGroupLevelHighlight || isPostCell;
        
        const deptClass = isDeptLevelHighlight ? ' class="post-cell"' : ''; 
        const groupClass = isGroupLevelHighlight ? ' class="post-cell"' : ''; 
        const postClass = isPostLevelHighlight ? ' class="post-cell"' : '';
        const currTds = generateTds(currEmp, currEmp?.id, false, isPostLevelHighlight);
        const nextTds = generateTds(nextEmp, nextEmp?.id, true, isPostLevelHighlight);
        
        const dm = deptMap[dept.id];
        const deptMaxLvl = dm ? getMaxDeptLevel(dept, dm) : 0;
        const groupMaxLvl = (group && dm) ? getMaxGroupLevel(group, dm.groups[group.id]) : deptMaxLvl;
        
        const trAttr = ` data-dept="${escapeHtml(deptName)}" data-group="${escapeHtml(groupName)}" data-post="${escapeHtml(formattedPostName)}" data-dept-max="${deptMaxLvl}" data-group-max="${groupMaxLvl}"`;
        rowsHtml += `<tr${trAttr}><td${deptClass}>${displayDeptHtml}</td><td${groupClass}>${displayGroupHtml}</td><td${postClass}>${escapeHtml(displayPost)}</td>${currTds}${nextTds}${rowNoteHtml}</tr>\n`;
      });
      return rowsHtml;
    };

    const tbodyAll = generateTbody(); 
    const headers = ['部署名', '班・グループ', 'ポスト', '【今年度】職名', '【今年度】氏名', '【今年度】級', '【今年度】年齢', '【今年度】在籍', '【今年度】備考', '【来年度】職名', '【来年度】氏名', '【来年度】級', '【来年度】年齢', '【来年度】在籍', '【来年度】備考', 'メモ'];
    
    const currSummaryStr = generateGradeSummary(employees, false);
    const nextSummaryStr = generateGradeSummary(employees, true);
    const summaryHtml = `
      <div style="margin-bottom:16px;font-family:sans-serif;font-size:12px;background:#f8fafc;padding:12px;border:1px solid #e2e8f0;border-radius:6px;">
        <div style="margin-bottom:8px;"><strong>【全体集計（今年度 ${targetYear - 1}(R${targetYear - 2019})）】</strong> <span style="color:#0369a1;font-weight:600;">${escapeHtml(currSummaryStr)}</span></div>
        <div><strong>【全体集計（来年度 ${targetYear}(R${targetYear - 2018})）】</strong> <span style="color:#0369a1;font-weight:600;">${escapeHtml(nextSummaryStr)}</span></div>
      </div>`;

    const gradeLevelsHtml = JSON.stringify(GRADE_LEVELS);
    const gradeOptionsHtml = JSON.stringify(GRADE_OPTIONS);

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(fileName.replace(/\.html$/, ''))} - 人事異動案</title>
  <style>
    body { font-family: "BIZ UDPGothic", "BIZ UDPゴシック", "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; font-size: 11px; margin: 0; color: #334155; -webkit-font-smoothing: auto; -moz-osx-font-smoothing: auto; }
    table { border-collapse: separate; border-spacing: 0; table-layout: fixed; width: 100%; min-width: 1150px; border-bottom: 2px solid #000; border-right: 2px solid #000; }
    th, td { border: none; border-top: 1px solid #94a3b8; border-left: 1px solid #94a3b8; padding: 2px 4px; vertical-align: top; overflow: hidden; word-break: break-word; line-height: 1.25; background-clip: padding-box; } 
    th, strong, b { font-weight: 600; }
    thead { position: sticky; top: 0; z-index: 20; background-color: #fff; }
    
    thead tr:nth-child(1) th { border-top: 2px solid #000 !important; }
    th:first-child, td:first-child { border-left: 2px solid #000 !important; }
    thead tr:nth-child(2) th { border-top: 2px solid #000 !important; }
    thead tr:nth-child(3) th, thead tr:nth-child(2) th[rowspan="2"] { border-bottom: 2px solid #000 !important; }

    td:nth-child(4), td:nth-child(10), td:nth-child(16) { border-left: 2px solid #000 !important; } 
    thead tr:nth-child(2) th:nth-child(4), thead tr:nth-child(2) th:nth-child(5), thead tr:nth-child(2) th:nth-child(6) { border-left: 2px solid #000 !important; }
    thead tr:nth-child(3) th:nth-child(1), thead tr:nth-child(3) th:nth-child(7) { border-left: 2px solid #000 !important; } 

    .highlight { background-color: #a7f3d0 !important; cursor: pointer; } 
    .selected { background-color: #fef08a !important; } 
    .post-cell { font-weight: 600; color: #0c4a6e; background-color: #e0f2fe; } 
    .table-filtered .post-cell { font-weight: normal; color: inherit; background-color: transparent; }
    
    td:nth-child(5), td:nth-child(11) { white-space: nowrap; text-overflow: ellipsis; text-align: left; }
    td:nth-child(7), td:nth-child(13) { white-space: nowrap; text-align: center; }
    
    tbody tr.highlight:not(.dept-boundary) td { border-top: 1px solid #94a3b8 !important; }
    tbody tr.highlight td { border-bottom: 1px solid #94a3b8 !important; }
    tbody tr.highlight + tr.highlight td:nth-child(1):empty,
    tbody tr.highlight + tr.highlight td:nth-child(2):empty,
    tbody tr.highlight + tr.highlight td:nth-child(3):empty { border-top: none !important; }
    .filter-container { display:flex; align-items:center; gap:12px; flex-wrap:wrap; font-size:12px; font-weight: normal; } 
    .filter-container label { margin:0; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight: normal; }

    /* ========== 印刷用最適化設定 ========== */
    .print-only { display: none; }
    @media print {
      .print-hide { display: none !important; }
      .filter-container { display: none !important; }
      body {
        -webkit-print-color-adjust: exact !important; /* 背景色・グラデーションを強制印刷 */
        print-color-adjust: exact !important;
        margin: 0;
        background-color: white;
        zoom: 0.7; /* 印刷設定画面で100%のままでも、自動的に70%サイズで出力されるようにする */
      }
      
      .print-only { display: table-footer-group; } /* 印刷時のみフッター情報を表示 */
      
      thead { display: table-header-group; } /* 複数ページにまたがる際、各ページ上部にヘッダーを表示 */
      tr { page-break-inside: avoid; } /* 行の途中で分断させない */
      table { min-width: 100% !important; max-width: 100% !important; width: 100% !important; box-sizing: border-box; }
    }
  </style>
  <style id="page-style">@page { size: A4 portrait; margin: 10mm; }</style>
  <script>
    const GRADE_LEVELS = ${gradeLevelsHtml};
    const GRADE_OPTIONS = ${gradeOptionsHtml};
    const getGradeLevel = (grade) => GRADE_LEVELS[grade] || 1;

    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("td[data-emp-id]").forEach(td => {
        td.addEventListener("mouseenter", (e) => {
          const id = e.target.getAttribute("data-emp-id");
          if(id) document.querySelectorAll(\`td[data-emp-id="\${id}"]\`).forEach(el => el.classList.add("highlight"));
        });
        td.addEventListener("mouseleave", (e) => {
          const id = e.target.getAttribute("data-emp-id");
          if(id) document.querySelectorAll(\`td[data-emp-id="\${id}"]\`).forEach(el => el.classList.remove("highlight"));
        });
        td.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-emp-id");
          if(id) {
            const els = document.querySelectorAll(\`td[data-emp-id="\${id}"]\`);
            const isSel = els[0].classList.contains("selected");
            document.querySelectorAll("td.selected").forEach(el => el.classList.remove("selected"));
            if(!isSel) els.forEach(el => el.classList.add("selected"));
          }
        });
      });

      const tbody = document.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));
      
      const updateBorders = () => {
        const tableElement = document.querySelector('table');
        const isFiltered = tableElement ? tableElement.classList.contains('table-filtered') : false;
        
        let lastDept = null;
        let lastGroup = null;
        let isFirstRow = true;
        let prevVisibleRow = null;
        
        rows.forEach(row => {
          if (row.style.display !== 'none') {
            const currentDept = row.getAttribute('data-dept');
            const currentGroup = row.getAttribute('data-group');
            
            const isNewDept = currentDept !== lastDept;
            const isNewGroup = !isNewDept && currentGroup !== lastGroup;
            
            if (isNewDept) {
              row.classList.add('dept-boundary');
            } else {
              row.classList.remove('dept-boundary');
            }
            
            for(let i = 0; i < row.cells.length; i++) {
              const cell = row.cells[i];
              const isPostCellClass = cell.classList.contains('post-cell');
              const isHeaderCol = (i <= 2);
              const isBlank = cell.textContent.trim() === '';
              
              let isColorDifferent = false;
              if (isHeaderCol && prevVisibleRow && prevVisibleRow.cells[i]) {
                const prevIsPostCell = prevVisibleRow.cells[i].classList.contains('post-cell');
                isColorDifferent = !isFiltered && (isPostCellClass !== prevIsPostCell);
              }
              
              if (isFirstRow) {
                cell.style.borderTop = 'none';
              } else if (isNewDept) {
                cell.style.borderTop = '2px solid #000';
              } else {
                if (isHeaderCol && !isColorDifferent && isBlank) {
                  cell.style.borderTop = 'none';
                  if (prevVisibleRow && prevVisibleRow.cells[i]) {
                    prevVisibleRow.cells[i].style.borderBottom = 'none';
                  }
                } else {
                  cell.style.borderTop = '1px solid #94a3b8';
                  if (prevVisibleRow && prevVisibleRow.cells[i]) {
                    prevVisibleRow.cells[i].style.borderBottom = '1px solid #94a3b8';
                  }
                }
              }
            }
            
            if (isNewDept) {
              lastDept = currentDept;
              lastGroup = currentGroup;
            } else if (isNewGroup) {
              lastGroup = currentGroup;
            }
            
            isFirstRow = false;
            prevVisibleRow = row;
          }
        });
      };
      
      updateBorders();
      
            const filterContainer = document.querySelector(".filter-container");
      let radioHtml = '<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">';
      
      radioHtml += '<div style="display: flex; gap: 12px; align-items: center;">';
      radioHtml += '<div><strong>表示切替：</strong> <label title="すべての職員を表示する"><input type="radio" name="filter" value="0" ' + (${filterLevel} === 0 ? "checked" : "") + '> 全件表示</label>';
      
      const filteredOptions = GRADE_OPTIONS.filter(g => g !== "");
      filteredOptions.forEach(g => {
         const isChecked = ${filterLevel} === GRADE_LEVELS[g] ? "checked" : "";
         radioHtml += '<label title="' + g + '以上の職員のみを表示する"><input type="radio" name="filter" value="' + GRADE_LEVELS[g] + '" ' + isChecked + '> ' + g + '以上</label>';
      });
      radioHtml += '</div>';
      radioHtml += '</div>';
      
      radioHtml += '<div style="display: flex; gap: 16px; align-items: center;">';
      radioHtml += '<div><label><input type="radio" name="orientation" value="landscape"> 横</label> <label><input type="radio" name="orientation" value="portrait" checked> 縦</label></div>';
      radioHtml += '<button onclick="window.print()" style="padding: 4px 12px; background-color: #0ea5e9; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">印刷</button>';
      radioHtml += '</div>';
      
      filterContainer.innerHTML = radioHtml;
      
      document.querySelectorAll("input[name='orientation']").forEach(r => {
        r.addEventListener("change", (e) => {
          const pageStyle = document.getElementById("page-style");
          if (pageStyle) {
            pageStyle.textContent = \`@page { size: A4 \${e.target.value}; margin: 10mm; }\`;
          }
        });
      });

      document.querySelectorAll("input[name='filter']").forEach(r => {
        r.addEventListener("change", (e) => {
          const filterLevel = parseInt(e.target.value, 10);
          const tableElement = document.querySelector('table');
          if (filterLevel === 0) {
            tableElement.classList.remove('table-filtered');
          } else {
            tableElement.classList.add('table-filtered');
          }
          
          rows.forEach(row => {
            if (filterLevel === 0) {
               row.style.display = "";
               return;
            }
            
            const deptMaxLvl = parseInt(row.getAttribute('data-dept-max') || '0', 10);
            const groupMaxLvl = parseInt(row.getAttribute('data-group-max') || '0', 10);
            
            if (deptMaxLvl < filterLevel || groupMaxLvl < filterLevel) {
               row.style.display = "none";
               return;
            }
            
            const postName = row.cells[2] ? row.getAttribute('data-post') : "";
            const currName = row.cells[4] ? row.cells[4].textContent.trim() : "";
            const currGrade = row.cells[5] ? row.cells[5].textContent.trim() : "";
            const nextName = row.cells[10] ? row.cells[10].textContent.trim() : "";
            const nextGrade = row.cells[11] ? row.cells[11].textContent.trim() : "";
            
            const currLvl = currGrade ? getGradeLevel(currGrade) : 0;
            const nextLvl = nextGrade ? getGradeLevel(nextGrade) : 0;
            const hasEmp = currName !== "" || nextName !== "";
            
            if (postName !== '班員' && postName !== '') {
               if (hasEmp && currLvl < filterLevel && nextLvl < filterLevel) {
                 row.style.display = "none";
               } else {
                 row.style.display = "";
               }
            } else {
               if (currLvl < filterLevel && nextLvl < filterLevel) {
                 row.style.display = "none";
               } else {
                 row.style.display = "";
               }
            }
          });
          
          updateBorders();
        });
      });
      
      const initRadio = document.querySelector("input[name='filter']:checked");
      if (initRadio) {
        initRadio.dispatchEvent(new Event("change"));
      }
    });
  </script>
</head>
<body>
  <h2>${targetYear}年度(R${targetYear - 2018})人事異動案 【${escapeHtml(fileName.replace(/\.html$/, ''))}】</h2>
  ${summaryHtml}
  <table border="1">
    <colgroup>
      <col style="width: calc((100% - 550px) * 0.15);" />
      <col style="width: calc((100% - 550px) * 0.15);" />
      <col style="width: 50px;" />
      <col style="width: calc((100% - 550px) * 0.08);" />
      <col style="width: 80px;" />
      <col style="width: 130px;" />
      <col style="width: 40px;" />
      <col style="width: calc((100% - 550px) * 0.12);" />
      <col style="width: calc((100% - 550px) * 0.10);" />
      <col style="width: calc((100% - 550px) * 0.08);" />
      <col style="width: 80px;" />
      <col style="width: 130px;" />
      <col style="width: 40px;" />
      <col style="width: calc((100% - 550px) * 0.12);" />
      <col style="width: calc((100% - 550px) * 0.10);" />
      <col style="width: calc((100% - 550px) * 0.10);" />
    </colgroup>
    <thead>
      <tr class="print-hide">
        <th colspan="16" style="background-color: #cbd5e1; text-align: left; padding: 6px 12px;">
          <div class="filter-container">
          </div>
        </th>
      </tr>
      <tr>
        <th rowspan="2" style="background-color: #cbd5e1;">部署名</th>
        <th rowspan="2" style="background-color: #cbd5e1;">班・グループ</th>
        <th rowspan="2" style="background-color: #cbd5e1;">ポスト</th>
        <th colspan="6" style="background-color: #fef3c7;">今年度（${targetYear - 1}(R${targetYear - 2019})）</th>
        <th colspan="6" style="background-color: #bfdbfe;">来年度（${targetYear}(R${targetYear - 2018})）</th>
        <th rowspan="2" style="background-color: #f0f0f0;">メモ</th>
      </tr>
      <tr>
        <th style="background-color: #fef3c7;">職名</th>
        <th style="background-color: #fef3c7;">氏名</th>
        <th style="background-color: #fef3c7;">級</th>
        <th style="background-color: #fef3c7; width: 32px; min-width: 32px;">年齢</th>
        <th style="background-color: #fef3c7;">在籍</th>
        <th style="background-color: #fef3c7;">備考</th>
        <th style="background-color: #bfdbfe;">職名</th>
        <th style="background-color: #bfdbfe;">氏名</th>
        <th style="background-color: #bfdbfe;">級</th>
        <th style="background-color: #bfdbfe; width: 32px; min-width: 32px;">年齢</th>
        <th style="background-color: #bfdbfe;">在籍</th>
        <th style="background-color: #bfdbfe;">備考</th>
      </tr>
    </thead>
    <tbody>${tbodyAll}</tbody>
    <tfoot class="print-only">
      <tr>
        <td colspan="${headers.length}" style="border: none; text-align: right; padding-top: 10px; color: #555; font-size: 9px;">
          出力ファイル名: ${escapeHtml(fileName)} 　/　 出力日時: ${printDate}
        </td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
    downloadFile(htmlContent, 'text/html;charset=utf-8;', fileName);
  }, [targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel]);

  const exportToExcel = useCallback((fileName) => {
    exportPlanToExcel(fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel);
  }, [targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel]);

  return { exportToJSON, exportToHTML, exportToExcel };
}

// ==========================================
// 4. アプリケーションコンテキストプロバイダー
