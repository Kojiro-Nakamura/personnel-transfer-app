const fs = require('fs');
const file = 'src/components/modals/ChainTransferModal.jsx';
let content = fs.readFileSync(file, 'utf8');

const finalStr =       let noteStr = '';
      if (succ && succ.nextEmploymentType) {
        const notes = [];
        if (String(succ.nextEmploymentType).includes('育代')) notes.push('育児休業中');
        if (String(succ.nextEmploymentType).includes('役職定年')) notes.push('役職定年');
        noteStr = notes.join(' / ');
      }

      return {
        orgOrder,
        predDept: predPost.dept || '',
        predDeptTitle: (predPost.dept || '') + (predPost.title || ''),
        predGroup: predPost.group || '',
        predEmpNo,
        predName: pred.name ? getFormattedNameWithPrefix(pred, false) : '',
        predAge: pred.ageNextYear ?? pred.age ?? '',
        reason: row.reason,
        currentYears: getEmpCurrentYears(pred, targetYear - 1, false) || '',
        succEmpNo,
        succName,
        isPromoted,
        succAge: succ.ageNextYear ?? succ.age ?? '',
        succPostLabel: succPost.type === 'unassigned' ? '' : (succPost.label || ''),
        noteStr
      };;

// Replace the return block
content = content.replace(/      let noteStr = '';\n      if \(succ && succ\.note\) {[\s\S]*?noteStr\n      };/, finalStr);

fs.writeFileSync(file, content, 'utf8');
