const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetSpacer = '<div className="w-[85px] shrink-0 opacity-0 pointer-events-none"><div className="h-[62px]"></div></div>';
content = content.replace(targetSpacer, '');

// Also, the first ArrowDiff in the bottom row should be slightly adjusted or just left as is.
// Since it's justify-between, 5 items and 4 arrows in top row, and 5 items and 5 arrows in bottom row... Wait.
// Bottom row:
// Arrow1, Item1, Arrow2, Item2, Arrow3, Item3, Arrow4, Item4, ArrowRight, Item5
// If it starts with an Arrow, it breaks the alignment!
// Let's wrap the first Arrow and the first Item together so it counts as one "slot".
// Or just let ArrowDiff render as normal.
// If I want perfect 5-column alignment, the easiest way is to use CSS Grid instead of Flex!

const replaceGrid = `            <div className="grid grid-cols-[85px_1fr_85px_1fr_85px_1fr_85px_1fr_85px] gap-y-5 items-end justify-items-center">
              {/* Top Row */}
              <div className="flex flex-col mb-1.5 w-full shrink-0">
                <span className="text-[11px] font-bold text-slate-600 mb-1">採用</span>
                <div className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-bold shadow-inner text-center">
                  {fd.hireDate ? fd.hireDate.substring(0, 4) : '----'}
                </div>
              </div>
              <ArrowDiff diff={getDiffFor('promoYearChief')} />
              <div className="w-full"><FormInput label="係長級(主査)" type="number" placeholder="YYYY" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} /></div>
              <ArrowDiff diff={getDiffFor('promoYearAssistant1')} />
              <div className="w-full"><FormInput label="補佐級I(主任)" type="number" placeholder="YYYY" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} /></div>
              <ArrowDiff diff={getDiffFor('promoYearAssistant2')} />
              <div className="w-full"><FormInput label="補佐級II(班長)" type="number" placeholder="YYYY" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} /></div>
              <ArrowDiff diff={getDiffFor('promoYearAssistant3')} />
              <div className="w-full"><FormInput label="補佐級III" type="number" placeholder="YYYY" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} /></div>

              {/* Bottom Row */}
              <div className="w-full relative">
                <div className="absolute -left-[45px] bottom-3">
                  <ArrowDiff diff={getDiffFor('promoYearSecHead')} />
                </div>
                <FormInput label="課長級" type="number" placeholder="YYYY" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} />
              </div>
              <ArrowDiff diff={getDiffFor('promoYearDivHead')} />
              <div className="w-full"><FormInput label="所属長級" type="number" placeholder="YYYY" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} /></div>
              <ArrowDiff diff={getDiffFor('promoYearDeputyHead')} />
              <div className="w-full"><FormInput label="次長級" type="number" placeholder="YYYY" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} /></div>
              <ArrowDiff diff={getDiffFor('promoYearDeptHead')} />
              <div className="w-full"><FormInput label="部長級" type="number" placeholder="YYYY" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} /></div>
              <div className="flex flex-col items-center justify-end h-full pb-1">
                <ArrowRight className="w-4 h-4 text-slate-300 mb-1" />
              </div>
              <div className="flex flex-col mb-1.5 w-full shrink-0">
                <span className="text-[11px] font-bold text-blue-700 mb-1 truncate">来年度まで</span>
                <div className="px-2 py-1.5 bg-blue-100 border border-blue-200 text-blue-800 rounded text-sm font-bold shadow-inner text-center">
                  {yearsSinceLast !== null ? Math.max(0, yearsSinceLast) + '年' : '----'}
                </div>
              </div>
            </div>`;

// Regex replace the old flex layout with the new grid layout
const regex = /<div className="flex flex-col gap-5">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
content = content.replace(regex, replaceGrid + '\n          </div>');
fs.writeFileSync(file, content, 'utf8');
