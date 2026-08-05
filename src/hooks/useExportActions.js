import { useCallback } from 'react';
import { downloadFile, traverseOrgTree, getCounts, formatCountText, calculateAge, isPromotedGrade, getPromotedBgColorCode, generateGradeSummary } from '../utils/helpers.js';
import { GRADE_LEVELS, GRADE_OPTIONS } from '../constants/config.js';
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
      let nameStyle = ''; let gradeStyle = '';
      if (emp && isNext && isPromotedGrade(emp.currentGrade, emp.nextGrade)) {
        const colorCode = getPromotedBgColorCode(emp.nextGrade);
        if (colorCode) { 
          nameStyle = ` style="background-color: ${colorCode};"`; 
          gradeStyle = ` style="background-color: ${colorCode};"`; 
        }
      }
      const values = [
        { val: emp ? (isNext ? emp.nextTitle : emp.currentTitle) : '', attr: attributes }, 
        { val: emp ? emp.name : '', attr: attributes + nameStyle }, 
        { val: emp ? (isNext ? emp.nextGrade : emp.currentGrade) : '', attr: attributes + gradeStyle }, 
        { val: getAgeStr(emp, isNext), attr: attributes }, 
        { val: getYearsStr(emp, isNext), attr: attributes }, 
        { val: getNoteStr(emp, isNext), attr: attributes }
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

        let deptNoteText = '';
        if (isNewDept && dept.id) {
           const dNote = notes.find(n => n.targetId === `dept-${dept.id}`);
           if (dNote && dNote.text) {
             deptNoteText = `<br><span style="color:#0ea5e9;font-size:10px;">[メモ] ${escapeHtml(dNote.text)}</span>`;
           }
        }

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
            displayDeptHtml = `${escapeHtml(deptName)} <span style="font-size:10px;font-weight:normal;color:#64748b;margin-left:4px;">（今:${formatCountText(cCounts)} / 来:${formatCountText(nCounts)}）</span>${deptNoteText}`;
          } else {
            displayDeptHtml = escapeHtml(deptName) + deptNoteText;
          }
        }

        let groupNoteText = '';
        if (isNewGroup && group && group.id) {
           const gNote = notes.find(n => n.targetId === `groupHeader-${dept.id}-${group.id}`);
           if (gNote && gNote.text) {
             groupNoteText = `<br><span style="color:#0ea5e9;font-size:10px;">[メモ] ${escapeHtml(gNote.text)}</span>`;
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
            displayGroupHtml = `${escapeHtml(groupName)} <span style="font-size:10px;font-weight:normal;color:#64748b;margin-left:4px;">（今:${formatCountText(gCCounts)} / 来:${formatCountText(gNCounts)}）</span>${groupNoteText}`;
          } else {
            displayGroupHtml = escapeHtml(groupName) + groupNoteText;
          }
        }

        let targetId = '';
        if (rowType === 'post') targetId = `postRow-${dept.id}-${post.id}-${i}`;
        else if (rowType === 'groupPost') targetId = `groupPostRow-${dept.id}-${group.id}-${post.id}-${i}`;
        else if (rowType === 'direct') targetId = `directRow-${dept.id}-${group.id}-${i}`;
        else if (rowType === 'deptDirect') targetId = `deptDirectRow-${dept.id}-${i}`;
        else if (rowType === 'system') targetId = `side-${nextEmp ? nextEmp.id : currEmp?.id}`;

        const note = notes.find(n => n.targetId === targetId);
        const rowNoteHtml = note && note.text 
          ? `<td style="color:#0369a1; white-space:pre-wrap; max-width:200px; font-size:11px;">${escapeHtml(note.text)}</td>` 
          : '<td></td>';

        const isPostCell = postName !== '' && postName !== '班員';
        const isDeptPost = isPostCell && groupName === ''; 
        const isGroupPost = isPostCell && groupName !== '';
        const isDeptLevelHighlight = (isNewDept || isDeptPost);
        const isGroupLevelHighlight = (isDeptLevelHighlight || isNewGroup || isGroupPost);
        const isPostLevelHighlight = (isGroupLevelHighlight || isPostCell);
        
        const deptClass = isDeptLevelHighlight ? ' class="post-cell"' : ''; 
        const groupClass = isGroupLevelHighlight ? ' class="post-cell"' : ''; 
        const postClass = isPostLevelHighlight ? ' class="post-cell"' : '';
        const currTds = generateTds(currEmp, currEmp?.id, false, isPostLevelHighlight);
        const nextTds = generateTds(nextEmp, nextEmp?.id, true, isPostLevelHighlight);
        
        const trAttr = ` data-dept="${escapeHtml(deptName)}" data-group="${escapeHtml(groupName)}"`;
        rowsHtml += `<tr${trAttr}><td${deptClass}>${displayDeptHtml}</td><td${groupClass}>${displayGroupHtml}</td><td${postClass}>${escapeHtml(displayPost)}</td>${currTds}${nextTds}${rowNoteHtml}</tr>\n`;
      });
      return rowsHtml;
    };

    const tbodyAll = generateTbody(); 
    const headers = ['部署名', '班・グループ', 'ポスト', '【今年度】職名', '【今年度】氏名', '【今年度】級', '【今年度】年齢', '【今年度】在籍', '【今年度】備考', '【来年度】職名', '【来年度】氏名', '【来年度】級', '【来年度】年齢', '【来年度】在籍', '【来年度】備考', 'メモ'];
    
    const currSummaryStr = generateGradeSummary(employees, false);
    const nextSummaryStr = generateGradeSummary(employees, true);
    const summaryHtml = `
      <div style="margin-bottom:16px;font-family:sans-serif;font-size:14px;background:#f8fafc;padding:12px;border:1px solid #e2e8f0;border-radius:6px;">
        <div style="margin-bottom:8px;"><strong>【全体集計（今年度）】</strong> <span style="color:#0369a1;font-weight:600;">${escapeHtml(currSummaryStr)}</span></div>
        <div><strong>【全体集計（来年度）】</strong> <span style="color:#0369a1;font-weight:600;">${escapeHtml(nextSummaryStr)}</span></div>
      </div>`;

    const gradeLevelsHtml = JSON.stringify(GRADE_LEVELS);
    const gradeOptionsHtml = JSON.stringify(GRADE_OPTIONS);

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(fileName.replace(/\.html$/, ''))} - 人事異動案</title>
  <style>
    body { font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; font-size: 11px; margin: 0; color: #334155; -webkit-font-smoothing: auto; -moz-osx-font-smoothing: auto; }
    table { border-collapse: collapse; width: 100%; } 
    th, td { border: 1px solid #ccc; padding: 4px 8px; vertical-align: top; } 
    th, strong, b { font-weight: 600; }
    thead { position: sticky; top: 0; z-index: 20; }
    th { background-color: #f0f0f0; border-bottom: 2px solid #94a3b8; background-clip: padding-box; } 
    .highlight { background-color: #a7f3d0 !important; cursor: pointer; } 
    .selected { background-color: #fef08a !important; } 
    .post-cell { font-weight: 600; color: #0369a1; background-color: #e0f2fe; } 
    td:nth-child(4), td:nth-child(10), td:nth-child(16) { border-left: 2px solid #475569; } 
    thead tr:first-child th:nth-child(4), thead tr:first-child th:nth-child(5), thead tr:first-child th:nth-child(6) { border-left: 2px solid #475569; }
    thead tr:nth-child(2) th:nth-child(1), thead tr:nth-child(2) th:nth-child(7) { border-left: 2px solid #475569; } 
    td:nth-child(7), td:nth-child(13), thead tr:nth-child(2) th:nth-child(4), thead tr:nth-child(2) th:nth-child(10) { white-space: nowrap; min-width: 45px; text-align: center; }
    .filter-container { margin-bottom:16px; font-family:sans-serif; font-size:14px; background:#fff; padding:12px; border:1px solid #e2e8f0; border-radius:6px; display:inline-block; } 
    .filter-container label { margin-right:16px; cursor:pointer; display:inline-flex; align-items:center; gap:4px; font-size: 13px; }
    tr.border-dept-top td { border-top: 3px solid #475569 !important; }
    tr.border-group-top td { border-top: 2px solid #94a3b8 !important; }

    /* ========== 印刷用最適化設定 ========== */
    .print-only { display: none; }
    @media print {
      @page {
        size: A4 landscape; /* 自動でA4横向きに設定 */
        margin: 10mm; /* 用紙の余白 */
      }
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
    }
  </style>
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
        let lastDept = null;
        let lastGroup = null;
        
        rows.forEach(row => {
          row.classList.remove('border-dept-top', 'border-group-top');
          
          if (row.style.display !== 'none') {
            const currentDept = row.getAttribute('data-dept');
            const currentGroup = row.getAttribute('data-group');
            
            if (currentDept !== lastDept) {
              row.classList.add('border-dept-top');
              lastDept = currentDept;
              lastGroup = currentGroup;
            } else if (currentGroup !== lastGroup) {
              row.classList.add('border-group-top');
              lastGroup = currentGroup;
            }
          }
        });
      };
      
      updateBorders();
      
      const filterContainer = document.querySelector(".filter-container");
      let radioHtml = '<strong>表示切り替え：</strong> <label title="すべての職員を表示する"><input type="radio" name="filter" value="0" checked> 全件表示</label>';
      
      const filteredOptions = GRADE_OPTIONS.filter(g => g !== "");
      filteredOptions.forEach(g => {
         radioHtml += \`<label title="\${g}以上の職員のみを表示する"><input type="radio" name="filter" value="\${GRADE_LEVELS[g]}"> \${g}以上</label>\`;
      });
      
      filterContainer.innerHTML = radioHtml;
      
      document.querySelectorAll("input[name='filter']").forEach(r => {
        r.addEventListener("change", (e) => {
          const filterLevel = parseInt(e.target.value, 10);
          
          rows.forEach(row => {
            if (filterLevel === 0) {
               row.style.display = "";
               return;
            }
            
            const postName = row.cells[2] ? row.cells[2].textContent.trim() : "";
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
    });
  </script>
</head>
<body>
  <h2>${targetYear}年度(R${targetYear - 2018})人事異動案</h2>
  ${summaryHtml}
  <div class="filter-container">
  </div>
  <table>
    <thead>
      <tr>
        <th rowspan="2" style="background-color: #cbd5e1;">部署名</th>
        <th rowspan="2" style="background-color: #cbd5e1;">班・グループ</th>
        <th rowspan="2" style="background-color: #cbd5e1;">ポスト</th>
        <th colspan="6" style="background-color: #cbd5e1;">今年度</th>
        <th colspan="6" style="background-color: #bfdbfe;">来年度</th>
        <th rowspan="2" style="background-color: #f0f0f0;">メモ</th>
      </tr>
      <tr>
        <th style="background-color: #cbd5e1;">職名</th>
        <th style="background-color: #cbd5e1;">氏名</th>
        <th style="background-color: #cbd5e1;">級</th>
        <th style="background-color: #cbd5e1; width: 32px; min-width: 32px;">年齢</th>
        <th style="background-color: #cbd5e1;">在籍</th>
        <th style="background-color: #cbd5e1;">備考</th>
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

  return { exportToJSON, exportToHTML };
}

// ==========================================
// 4. アプリケーションコンテキストプロバイダー
