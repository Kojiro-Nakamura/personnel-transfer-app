const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

// 1. Update trAttr to include data-post
content = content.replace(
  "const trAttr = ` data-dept=\"${escapeHtml(deptName)}\" data-group=\"${escapeHtml(groupName)}\"`;",
  "const trAttr = ` data-dept=\"${escapeHtml(deptName)}\" data-group=\"${escapeHtml(groupName)}\" data-post=\"${escapeHtml(formattedPostName)}\"`;"
);

// 2. Update the embedded JS in the HTML string to implement border-post-top
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
      };`;

const newUpdateBorders = `      const updateBorders = () => {
        let lastDept = null;
        let lastGroup = null;
        let lastPost = null;
        
        rows.forEach(row => {
          row.classList.remove('border-dept-top', 'border-group-top', 'border-post-top');
          
          if (row.style.display !== 'none') {
            const currentDept = row.getAttribute('data-dept');
            const currentGroup = row.getAttribute('data-group');
            const currentPost = row.getAttribute('data-post');
            
            if (currentDept !== lastDept) {
              row.classList.add('border-dept-top');
              lastDept = currentDept;
              lastGroup = currentGroup;
              lastPost = currentPost;
            } else if (currentGroup !== lastGroup) {
              row.classList.add('border-group-top');
              lastGroup = currentGroup;
              lastPost = currentPost;
            } else if (currentPost !== lastPost) {
              row.classList.add('border-post-top');
              lastPost = currentPost;
            }
          }
        });
      };`;

content = content.replace(oldUpdateBorders, newUpdateBorders);

// 3. Update the filter logic to read data-post since row.cells[2] text content might be empty on subsequent rows
content = content.replace(
  "const postName = row.cells[2] ? row.cells[2].textContent.trim() : \"\";",
  "const postName = row.cells[2] ? row.getAttribute('data-post') : \"\";"
);

// 4. Update CSS 
content = content.replace(
  "table { border-collapse: collapse; table-layout: fixed; width: max-content; }",
  "table { border-collapse: collapse; table-layout: fixed; width: max-content; border-bottom: 1px solid #333; }"
);

content = content.replace(
  "th, td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }",
  "th, td { border: 1px solid #333; padding: 4px 6px; vertical-align: top; overflow: hidden; word-break: break-word; }"
);

// Replace border CSS rules
const oldCssBorders = `    tr.border-dept-top td { border-top: 3px solid #475569 !important; }
    tr.border-group-top td { border-top: 2px solid #94a3b8 !important; }`;

const newCssBorders = `    tr.border-dept-top td { border-top: 2px solid #333 !important; }
    tr.border-group-top td { border-top: 1px solid #333 !important; }
    td:nth-child(1), td:nth-child(2), td:nth-child(3) { border-bottom: none !important; border-top: none !important; }
    tr.border-dept-top td:nth-child(1), tr.border-dept-top td:nth-child(2), tr.border-dept-top td:nth-child(3) { border-top: 2px solid #333 !important; }
    tr.border-group-top td:nth-child(2), tr.border-group-top td:nth-child(3) { border-top: 1px solid #333 !important; }
    tr.border-post-top td:nth-child(3) { border-top: 1px dashed #333 !important; }`;

content = content.replace(oldCssBorders, newCssBorders);

fs.writeFileSync('src/hooks/useExportActions.js', content);
console.log('Patch complete.');
