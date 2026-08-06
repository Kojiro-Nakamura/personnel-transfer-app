import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update renderPromoCell and renderFinalDiffCell to move the diff to the left with an arrow
target_promo = '''                const renderPromoCell = (emp, key, isFirst = false) => {
                  const diff = getDiff(emp, key);
                  return (
                    <td key={key} className={cx("bg-fuchsia-50/30 p-1 align-middle", isFirst ? "border-l" : "")}>
                      <div className="flex flex-row items-center justify-center gap-1">
                        <input type="text" value={emp[key]||''} onChange={e => handleChange(emp.id, key, e.target.value)} className={cx(inputCls, 'text-center px-0.5 w-[38px] shrink-0')} />
                        {diff !== null && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-sm border border-emerald-100 shadow-sm whitespace-nowrap shrink-0 leading-tight">{diff}年</span>}
                      </div>
                    </td>
                  );
                };
                
                const renderFinalDiffCell = (emp) => {
                  const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
                  let prevY = NaN;
                  for (let i = pKeys.length - 1; i >= 0; i--) {
                    const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                    if (!isNaN(y)) { prevY = y; break; }
                  }
                  const diff = (!isNaN(prevY)) ? targetYear - prevY : null;
                  return (
                    <td className="bg-fuchsia-50/30 p-1 align-middle border-r">
                      <div className="flex items-center justify-center h-full min-h-[26px]">
                        {diff !== null && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm border border-blue-200 shadow-sm whitespace-nowrap leading-tight">{diff >= 0 ? diff : 0}年</span>}
                      </div>
                    </td>
                  );
                };'''

repl_promo = '''                const renderPromoCell = (emp, key, isFirst = false) => {
                  const diff = getDiff(emp, key);
                  return (
                    <td key={key} className={cx("bg-fuchsia-50/30 p-1 align-middle", isFirst ? "border-l" : "")}>
                      <div className="flex flex-row items-center justify-center gap-1">
                        {diff !== null && (
                          <div className="flex flex-row items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-0.5 rounded-sm border border-emerald-100 shadow-sm shrink-0 leading-tight whitespace-nowrap">
                            {diff}年<ChevronRight className="w-2 h-2 ml-0.5 text-emerald-500" />
                          </div>
                        )}
                        {diff === null && <ChevronRight className="w-2 h-2 text-slate-300 shrink-0" />}
                        <input type="text" value={emp[key]||''} onChange={e => handleChange(emp.id, key, e.target.value)} className={cx(inputCls, 'text-center px-0.5 w-[38px] shrink-0')} />
                      </div>
                    </td>
                  );
                };
                
                const renderFinalDiffCell = (emp) => {
                  const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
                  let prevY = NaN;
                  for (let i = pKeys.length - 1; i >= 0; i--) {
                    const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                    if (!isNaN(y)) { prevY = y; break; }
                  }
                  const diff = (!isNaN(prevY)) ? targetYear - prevY : null;
                  return (
                    <td className="bg-fuchsia-50/30 p-1 align-middle border-r">
                      <div className="flex flex-row items-center justify-start gap-1 h-full min-h-[26px]">
                        {diff !== null && (
                          <div className="flex flex-row items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded-sm border border-blue-200 shadow-sm shrink-0 leading-tight whitespace-nowrap">
                            {diff >= 0 ? diff : 0}年<ChevronRight className="w-2 h-2 ml-0.5 text-blue-500" />
                          </div>
                        )}
                        {diff === null && <ChevronRight className="w-2 h-2 text-slate-300 shrink-0" />}
                      </div>
                    </td>
                  );
                };'''

content = content.replace(target_promo, repl_promo)

# 2. Update table headers for promo columns to widen them slightly for the chevron
target_promo_headers = '''                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50 border-l border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="来年度まで" sortKey="" className="bg-fuchsia-50/50 border-r w-[56px] min-w-[56px] whitespace-normal leading-tight" />'''

repl_promo_headers = '''                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50 border-l border-r w-[82px] min-w-[82px] whitespace-normal leading-tight" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r w-[82px] min-w-[82px] whitespace-normal leading-tight" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r w-[82px] min-w-[82px] whitespace-normal leading-tight" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r w-[82px] min-w-[82px] whitespace-normal leading-tight" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r w-[82px] min-w-[82px] whitespace-normal leading-tight" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r w-[82px] min-w-[82px] whitespace-normal leading-tight" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r w-[82px] min-w-[82px] whitespace-normal leading-tight" />
                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50 border-r w-[82px] min-w-[82px] whitespace-normal leading-tight" />
                <Th label="来年度まで" sortKey="" className="bg-fuchsia-50/50 border-r w-[56px] min-w-[56px] whitespace-normal leading-tight" />'''

content = content.replace(target_promo_headers, repl_promo_headers)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS apply diff swap changes")
