const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// 1. Add caching variables for Dept and Group HTML
content = content.replace(
  "let rowsHtml = ''; let lastDept = null; let lastGroup = null; let lastPost = null;",
  "let rowsHtml = ''; let lastDept = null; let lastGroup = null; let lastPost = null;\n      let cachedDeptHtml = ''; let cachedGroupHtml = '';"
);

// 2. Modify displayPost logic
content = content.replace(
  "const displayPost = (isNewGroup || formattedPostName !== lastPost) ? formattedPostName : '';",
  "const displayPost = formattedPostName;"
);

// 3. Modify displayDeptHtml to use cache
content = content.replace(
  /let displayDeptHtml = '';\s+if \(isNewDept\) {[\s\S]*?}\s+let groupNoteText = '';/,
  `let displayDeptHtml = '';
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
            cachedDeptHtml = \`\${escapeHtml(deptName)} <span style="font-size:10px;font-weight:normal;color:#64748b;margin-left:4px;">（今:\${formatCountText(cCounts)} / 来:\${formatCountText(nCounts)}）</span>\${deptNoteText}\`;
          } else {
            cachedDeptHtml = escapeHtml(deptName) + deptNoteText;
          }
        }
        displayDeptHtml = cachedDeptHtml;

        let groupNoteText = '';`
);

// 4. Modify displayGroupHtml to use cache
content = content.replace(
  /let displayGroupHtml = '';\s+if \(isNewGroup && groupName !== ''\) {[\s\S]*?}\s+let targetId = '';/,
  `let displayGroupHtml = '';
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
            cachedGroupHtml = \`\${escapeHtml(groupName)} <span style="font-size:10px;font-weight:normal;color:#64748b;margin-left:4px;">（今:\${formatCountText(gCCounts)} / 来:\${formatCountText(gNCounts)}）</span>\${groupNoteText}\`;
          } else {
            cachedGroupHtml = escapeHtml(groupName) + groupNoteText;
          }
        } else if (groupName === '') {
          cachedGroupHtml = '';
        }
        displayGroupHtml = cachedGroupHtml;

        let targetId = '';`
);

// 5. Update trAttr to include data-post
content = content.replace(
  "const trAttr = ` data-dept=\"${escapeHtml(deptName)}\" data-group=\"${escapeHtml(groupName)}\"`;",
  "const trAttr = ` data-dept=\"${escapeHtml(deptName)}\" data-group=\"${escapeHtml(groupName)}\" data-post=\"${escapeHtml(formattedPostName)}\"`;"
);

// 6. Update the embedded JS in the HTML string to implement updateRowspans
const oldUpdateBorders = `      const updateBorders = () => {
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
      
      updateBorders();`;

const newUpdateRowspans = `      const updateRowspans = () => {
        rows.forEach(row => {
          for(let i=0; i<3; i++) {
            if (row.cells[i]) {
               row.cells[i].rowSpan = 1;
               row.cells[i].style.display = "";
            }
          }
          row.classList.remove('border-dept-top', 'border-group-top');
        });

        let currentDept = null, deptStart = null, deptSpan = 0;
        let currentGroup = null, groupStart = null, groupSpan = 0;
        let currentPost = null, postStart = null, postSpan = 0;

        rows.forEach(row => {
          if (row.style.display === 'none') return;

          const dept = row.getAttribute('data-dept');
          const group = row.getAttribute('data-group');
          const post = row.getAttribute('data-post');

          if (dept !== currentDept) {
            row.classList.add('border-dept-top');
            currentDept = dept;
            deptStart = row.cells[0];
            deptSpan = 1;
          } else {
            deptSpan++;
            if (deptStart) deptStart.rowSpan = deptSpan;
            if (row.cells[0]) row.cells[0].style.display = 'none';
          }

          const deptGroup = dept + '|' + group;
          if (deptGroup !== currentGroup) {
            if (dept === currentDept && deptGroup !== '|' && deptSpan > 1) {
              row.classList.add('border-group-top');
            }
            currentGroup = deptGroup;
            groupStart = row.cells[1];
            groupSpan = 1;
          } else {
            groupSpan++;
            if (groupStart) groupStart.rowSpan = groupSpan;
            if (row.cells[1]) row.cells[1].style.display = 'none';
          }

          const deptGroupPost = deptGroup + '|' + post;
          if (deptGroupPost !== currentPost) {
            currentPost = deptGroupPost;
            postStart = row.cells[2];
            postSpan = 1;
          } else {
            postSpan++;
            if (postStart) postStart.rowSpan = postSpan;
            if (row.cells[2]) row.cells[2].style.display = 'none';
          }
        });
      };
      
      updateRowspans();`;

content = content.replace(oldUpdateBorders, newUpdateRowspans);

// 7. Update inside the radio button event listener:
content = content.replace(
  "const postName = row.cells[2] ? row.cells[2].textContent.trim() : \"\";",
  "const postName = row.cells[2] ? row.getAttribute('data-post') : \"\";"
);

content = content.replace(
  "updateBorders();",
  "updateRowspans();"
);

// 8. Update table border CSS
content = content.replace(
  "th, td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }",
  "th, td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }"
);


fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Patch complete.');
