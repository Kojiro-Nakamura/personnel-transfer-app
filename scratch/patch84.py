import re

with open('src/hooks/useExportActions.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_func = """      const updateBorders = () => {
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
      };"""

new_func = """      const updateBorders = () => {
        let lastDept = null;
        let lastGroup = null;
        
        rows.forEach(row => {
          row.classList.remove('border-dept-top', 'border-group-top');
          
          if (row.style.display !== 'none') {
            const currentDept = row.getAttribute('data-dept');
            const currentGroup = row.getAttribute('data-group');
            
            const isNewDept = currentDept !== lastDept;
            const isNewGroup = !isNewDept && currentGroup !== lastGroup;
            
            for(let i = 0; i < row.cells.length; i++) {
              const cell = row.cells[i];
              const isHeaderCell = (i <= 2 && !cell.classList.contains('post-cell'));
              
              if (isNewDept) {
                cell.style.borderTop = '1.5px solid #475569';
              } else if (isNewGroup) {
                cell.style.borderTop = '1px solid #94a3b8';
              } else {
                if (isHeaderCell) {
                  cell.style.borderTop = 'none';
                } else {
                  cell.style.borderTop = '1px solid #94a3b8';
                }
              }
              
              if (isHeaderCell) {
                cell.style.borderBottom = 'none';
              } else {
                cell.style.borderBottom = '1px solid #94a3b8';
              }
            }
            
            if (isNewDept) {
              row.classList.add('border-dept-top');
              lastDept = currentDept;
              lastGroup = currentGroup;
            } else if (isNewGroup) {
              row.classList.add('border-group-top');
              lastGroup = currentGroup;
            }
          }
        });
        
        const visibleRows = rows.filter(r => r.style.display !== 'none');
        if (visibleRows.length > 0) {
          const lastRow = visibleRows[visibleRows.length - 1];
          for(let i = 0; i < lastRow.cells.length; i++) {
            lastRow.cells[i].style.borderBottom = '1.5px solid #475569';
          }
        }
      };"""

content = content.replace(old_func, new_func)

with open('src/hooks/useExportActions.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated updateBorders to include inline styles.')
