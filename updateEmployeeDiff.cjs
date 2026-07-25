const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const logic = `
  const pYears = [
    { key: 'hire', year: fd.hireDate ? parseInt(fd.hireDate.substring(0, 4)) : NaN },
    { key: 'promoYearChief', year: parseInt(fd.promoYearChief) },
    { key: 'promoYearAssistant1', year: parseInt(fd.promoYearAssistant1) },
    { key: 'promoYearAssistant2', year: parseInt(fd.promoYearAssistant2) },
    { key: 'promoYearAssistant3', year: parseInt(fd.promoYearAssistant3) },
    { key: 'promoYearSecHead', year: parseInt(fd.promoYearSecHead) },
    { key: 'promoYearDivHead', year: parseInt(fd.promoYearDivHead) },
    { key: 'promoYearDeputyHead', year: parseInt(fd.promoYearDeputyHead) },
    { key: 'promoYearDeptHead', year: parseInt(fd.promoYearDeptHead) }
  ];
  
  const getDiffFor = (currentKey) => {
    const idx = pYears.findIndex(p => p.key === currentKey);
    if (idx <= 0) return null;
    const currentY = pYears[idx].year;
    if (isNaN(currentY)) return null;
    
    // Find previous valid year
    for (let i = idx - 1; i >= 0; i--) {
      if (!isNaN(pYears[i].year)) {
        return currentY - pYears[i].year;
      }
    }
    return null;
  };

  const ArrowDiff = ({ diff }) => {
    if (diff === null) return <div className="text-slate-300 mx-1"><ChevronRight className="w-4 h-4" /></div>;
    return (
      <div className="flex flex-col items-center mx-1">
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">{diff > 0 ? diff : 0}年</span>
        <ChevronRight className="w-4 h-4 text-emerald-500" />
      </div>
    );
  };
`;

const replaceTargetStart = '<div className="border border-slate-300 rounded p-3 mt-4 mb-4">';
const replaceTargetEnd = '</div>'; // End of the promotion section

const uiReplacement = `
          <div className="border border-slate-300 rounded p-3 mt-4 mb-4 bg-slate-50/50">
            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
              昇進年度 (西暦) と経過年数
            </h4>
            <div className="flex flex-wrap items-end gap-y-4 gap-x-1">
              <div className="flex flex-col mb-1.5">
                <span className="text-[11px] font-bold text-slate-600 mb-1">採用</span>
                <div className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-bold shadow-inner">
                  {fd.hireDate ? fd.hireDate.substring(0, 4) : '----'}
                </div>
              </div>
              
              <ArrowDiff diff={getDiffFor('promoYearChief')} />
              <div className="w-24"><FormInput label="係長級(主査)" type="number" placeholder="YYYY" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} /></div>
              
              <ArrowDiff diff={getDiffFor('promoYearAssistant1')} />
              <div className="w-24"><FormInput label="補佐級I(主任)" type="number" placeholder="YYYY" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} /></div>
              
              <ArrowDiff diff={getDiffFor('promoYearAssistant2')} />
              <div className="w-24"><FormInput label="補佐級II(班長)" type="number" placeholder="YYYY" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} /></div>
              
              <ArrowDiff diff={getDiffFor('promoYearAssistant3')} />
              <div className="w-24"><FormInput label="補佐級III" type="number" placeholder="YYYY" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} /></div>
              
              <ArrowDiff diff={getDiffFor('promoYearSecHead')} />
              <div className="w-24"><FormInput label="課長級" type="number" placeholder="YYYY" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} /></div>
              
              <ArrowDiff diff={getDiffFor('promoYearDivHead')} />
              <div className="w-24"><FormInput label="所属長級" type="number" placeholder="YYYY" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} /></div>
              
              <ArrowDiff diff={getDiffFor('promoYearDeputyHead')} />
              <div className="w-24"><FormInput label="次長級" type="number" placeholder="YYYY" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} /></div>
              
              <ArrowDiff diff={getDiffFor('promoYearDeptHead')} />
              <div className="w-24"><FormInput label="部長級" type="number" placeholder="YYYY" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} /></div>
            </div>
          </div>
`;

// Insert logic before return
for (let i = 280; i < 330; i++) {
  if (lines[i].includes('return (')) {
    lines.splice(i, 0, logic);
    break;
  }
}

// Replace UI
for (let i = 320; i < 400; i++) {
  if (lines[i].includes('className="border border-slate-300 rounded p-3 mt-4 mb-4"')) {
    // Find the end div of this section
    let endIdx = i;
    let divCount = 0;
    for (let j = i; j < 400; j++) {
      if (lines[j].includes('<div')) divCount++;
      if (lines[j].includes('</div')) divCount--;
      if (divCount === 0) {
        endIdx = j;
        break;
      }
    }
    lines.splice(i, endIdx - i + 1, uiReplacement);
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
