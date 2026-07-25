const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="border border-slate-300 rounded p-3 mt-4 mb-4 bg-slate-50\/50">[\s\S]*?<\/h4>\s*<div className="flex flex-wrap items-end gap-y-4 gap-x-1">[\s\S]*?\{\/\*\s*END PROMO\s*\*\/\}\s*<\/div>\s*<\/div>|<div className="border border-slate-300 rounded p-3 mt-4 mb-4 bg-slate-50\/50">[\s\S]*?<div className="grid grid-cols-2 gap-4">/g;

// Wait, doing regex like this is risky. Let's just find the exact indices and splice the array.

let lines = content.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 380; i < 440; i++) {
  if (lines[i] && lines[i].includes('className="border border-slate-300 rounded p-3 mt-4 mb-4 bg-slate-50/50"')) {
    startIdx = i;
  }
  if (lines[i] && lines[i].includes('className="grid grid-cols-2 gap-4"')) {
    endIdx = i;
    break;
  }
}

const replacement = `          <div className="border border-slate-300 rounded p-3 mt-4 mb-4 bg-slate-50/50">
            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
              昇進年度 (西暦) と経過年数
            </h4>
            <div className="flex flex-col gap-5">
              {/* Top Row */}
              <div className="flex items-end justify-between">
                <div className="flex flex-col mb-1.5 w-[85px] shrink-0">
                  <span className="text-[11px] font-bold text-slate-600 mb-1">採用</span>
                  <div className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-bold shadow-inner text-center">
                    {fd.hireDate ? fd.hireDate.substring(0, 4) : '----'}
                  </div>
                </div>
                
                <ArrowDiff diff={getDiffFor('promoYearChief')} />
                <div className="w-[85px] shrink-0"><FormInput label="係長級(主査)" type="number" placeholder="YYYY" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} /></div>
                
                <ArrowDiff diff={getDiffFor('promoYearAssistant1')} />
                <div className="w-[85px] shrink-0"><FormInput label="補佐級I(主任)" type="number" placeholder="YYYY" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} /></div>
                
                <ArrowDiff diff={getDiffFor('promoYearAssistant2')} />
                <div className="w-[85px] shrink-0"><FormInput label="補佐級II(班長)" type="number" placeholder="YYYY" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} /></div>
                
                <ArrowDiff diff={getDiffFor('promoYearAssistant3')} />
                <div className="w-[85px] shrink-0"><FormInput label="補佐級III" type="number" placeholder="YYYY" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} /></div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-end justify-between">
                <div className="w-[85px] shrink-0 opacity-0 pointer-events-none"><div className="h-[62px]"></div></div>
                <ArrowDiff diff={getDiffFor('promoYearSecHead')} />
                
                <div className="w-[85px] shrink-0"><FormInput label="課長級" type="number" placeholder="YYYY" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} /></div>
                
                <ArrowDiff diff={getDiffFor('promoYearDivHead')} />
                <div className="w-[85px] shrink-0"><FormInput label="所属長級" type="number" placeholder="YYYY" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} /></div>
                
                <ArrowDiff diff={getDiffFor('promoYearDeputyHead')} />
                <div className="w-[85px] shrink-0"><FormInput label="次長級" type="number" placeholder="YYYY" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} /></div>
                
                <ArrowDiff diff={getDiffFor('promoYearDeptHead')} />
                <div className="w-[85px] shrink-0"><FormInput label="部長級" type="number" placeholder="YYYY" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} /></div>
                
                <div className="flex flex-col items-center mx-1 justify-end h-[62px]">
                  <ArrowRight className="w-4 h-4 text-slate-300 mb-1" />
                </div>
                <div className="flex flex-col mb-1.5 w-[85px] shrink-0">
                  <span className="text-[11px] font-bold text-blue-700 mb-1 truncate">来年度まで</span>
                  <div className="px-2 py-1.5 bg-blue-100 border border-blue-200 text-blue-800 rounded text-sm font-bold shadow-inner text-center">
                    {yearsSinceLast !== null ? Math.max(0, yearsSinceLast) + '年' : '----'}
                  </div>
                </div>
              </div>
            </div>
          </div>
`;

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx, replacement);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
} else {
  console.log("Could not find boundaries");
}
