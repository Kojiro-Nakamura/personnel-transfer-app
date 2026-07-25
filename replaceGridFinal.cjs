const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

// We want to replace everything from `const pYears = [` down to the end of `<div className="border border-slate-300 rounded p-3 mt-4 mb-4 bg-slate-50/50">`
const startRegex = /const pYears = \[\s*\{ key: 'hire'/;
let lines = content.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 300; i < 450; i++) {
  if (lines[i] && lines[i].includes("const pYears = [")) startIdx = i;
  if (lines[i] && lines[i].includes('className="grid grid-cols-2 gap-4"')) {
    endIdx = i;
    break;
  }
}

const replacement = `  const pKeys = ['hire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
  
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
          <span className="text-[9px] font-bold text-blue-600 leading-tight whitespace-nowrap">来年度</span>
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

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-5 max-w-2xl w-full shadow-xl border-t-4 border-[#065084] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <div>
            <h3 className="text-xl font-bold text-[#065084]">職員情報編集</h3>
            <p className="text-sm text-slate-500 mt-1">
              基本情報やスキル、異動案（現行・新）を編集します。
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4 overflow-y-auto flex-1 pr-2 pb-2">
          <div className="flex gap-4">
            <FormInput label="職員番号" value={fd.employeeNumber} onChange={v => setFd({...fd, employeeNumber: v})} className="w-24" />
            <FormInput label="氏名" value={fd.name} onChange={v => setFd({...fd, name: v})} className="w-32" />
            <FormInput label="生年月日" type="date" value={fd.birthDate} onChange={v => setFd({...fd, birthDate: v})} className="w-32" />
            <FormInput label="学歴" value={fd.education} onChange={v => setFd({...fd, education: v})} className="w-32" />
            <FormInput label="採用年月" type="date" value={fd.hireDate} onChange={v => setFd({...fd, hireDate: v})} className="w-32" />
            <FormInput label="備考(休)" value={fd.note} onChange={v => setFd({...fd, note: v})} className="flex-1" />
          </div>
          
          <div className="border border-slate-300 rounded p-3 mt-4 mb-4 bg-slate-50/50">
            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
              昇進年度 (西暦) と経過年数
            </h4>
            <div className="grid grid-cols-[85px_1fr_85px_1fr_85px_1fr_85px_1fr_85px_1fr] gap-y-5 items-end justify-items-center">
              {/* Top Row */}
              <div className="flex flex-col mb-1.5 w-full shrink-0">
                <span className="text-[11px] font-bold text-slate-600 mb-1">採用</span>
                <div className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-bold shadow-inner text-center">
                  {fd.hireDate ? fd.hireDate.substring(0, 4) : '----'}
                </div>
              </div>
              <ArrowDiff currentKey="promoYearChief" />
              <div className="w-full"><FormInput label="係長級(主査)" type="number" placeholder="YYYY" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} /></div>
              <ArrowDiff currentKey="promoYearAssistant1" />
              <div className="w-full"><FormInput label="補佐級I(主任)" type="number" placeholder="YYYY" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} /></div>
              <ArrowDiff currentKey="promoYearAssistant2" />
              <div className="w-full"><FormInput label="補佐級II(班長)" type="number" placeholder="YYYY" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} /></div>
              <ArrowDiff currentKey="promoYearAssistant3" />
              <div className="w-full"><FormInput label="補佐級III" type="number" placeholder="YYYY" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} /></div>
              <ArrowDiff currentKey="promoYearSecHead" />

              {/* Bottom Row */}
              <div className="w-full opacity-0 pointer-events-none"></div>
              <div className="w-full opacity-0 pointer-events-none"></div>
              <div className="w-full"><FormInput label="課長級" type="number" placeholder="YYYY" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} /></div>
              <ArrowDiff currentKey="promoYearDivHead" />
              <div className="w-full"><FormInput label="所属長級" type="number" placeholder="YYYY" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} /></div>
              <ArrowDiff currentKey="promoYearDeputyHead" />
              <div className="w-full"><FormInput label="次長級" type="number" placeholder="YYYY" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} /></div>
              <ArrowDiff currentKey="promoYearDeptHead" />
              <div className="w-full"><FormInput label="部長級" type="number" placeholder="YYYY" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} /></div>
              <ArrowDiff currentKey="finalArrow" />
            </div>
          </div>
`;

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx, replacement);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
} else {
  console.log("Could not find start/end bounds.");
}
