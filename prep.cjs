const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const newArrowDiff = `
  const pKeys = ['hire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
  
  // Find index of last filled
  let lastFilledIdx = 0;
  for (let i = pKeys.length - 1; i >= 0; i--) {
    const val = pKeys[i] === 'hire' ? (fd.hireDate ? parseInt(fd.hireDate.substring(0,4)) : NaN) : parseInt(fd[pKeys[i]]);
    if (!isNaN(val)) {
      lastFilledIdx = i;
      break;
    }
  }

  const ArrowDiff = ({ currentKey }) => {
    let currentIdx = pKeys.indexOf(currentKey);
    if (currentIdx === -1) {
      // It's the final dummy arrow after DeptHead
      currentIdx = pKeys.length; 
    }

    if (currentIdx <= lastFilledIdx) {
      // Normal arrow between filled
      const currentY = pKeys[currentIdx] === 'hire' ? (fd.hireDate ? parseInt(fd.hireDate.substring(0,4)) : NaN) : parseInt(fd[pKeys[currentIdx]]);
      let prevY = NaN;
      for (let i = currentIdx - 1; i >= 0; i--) {
        const y = pKeys[i] === 'hire' ? (fd.hireDate ? parseInt(fd.hireDate.substring(0,4)) : NaN) : parseInt(fd[pKeys[i]]);
        if (!isNaN(y)) { prevY = y; break; }
      }
      const diff = (!isNaN(currentY) && !isNaN(prevY)) ? currentY - prevY : null;
      return (
        <div className="flex flex-col items-center justify-end h-full pb-1">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded mb-0.5">{diff !== null && diff >= 0 ? diff : 0}年</span>
          <ChevronRight className="w-4 h-4 text-emerald-500" />
        </div>
      );
    } else if (currentIdx === lastFilledIdx + 1) {
      // Final "来年度まで" arrow
      const lastY = pKeys[lastFilledIdx] === 'hire' ? (fd.hireDate ? parseInt(fd.hireDate.substring(0,4)) : NaN) : parseInt(fd[pKeys[lastFilledIdx]]);
      const diff = !isNaN(lastY) ? (targetYear - lastY) : null;
      return (
        <div className="flex flex-col items-center justify-end h-full pb-1">
          <span className="text-[9px] font-bold text-blue-600 leading-tight">来年度</span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1 rounded border border-blue-200 mb-0.5 whitespace-nowrap">{diff !== null && diff >= 0 ? diff : 0}年</span>
          <ChevronRight className="w-4 h-4 text-blue-500" />
        </div>
      );
    } else {
      // Empty gray arrow
      return (
        <div className="flex flex-col items-center justify-end h-full pb-1">
          <ChevronRight className="w-4 h-4 text-slate-300 mb-1" />
        </div>
      );
    }
  };
`;

// Insert the new logic before return (
let insertIdx = -1;
for (let i = 320; i < 370; i++) {
  if (lines[i] && lines[i].includes('const ArrowDiff = ({ diff }) => {')) {
    insertIdx = i;
    break;
  }
}

if (insertIdx !== -1) {
  // Remove old getDiffFor and ArrowDiff and yearsSinceLast
  // We'll just regex replace the whole block later.
}
