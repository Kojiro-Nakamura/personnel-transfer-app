const fs = require('fs');
let content = fs.readFileSync('src/hooks/useExportActions.js', 'utf8');

const jsScriptOld = `      const updateBorders = () => {
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

console.log(content.includes(jsScriptOld));
