import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initial sort in sortedEmps useMemo
target_sort = '''  const sortedEmps = useMemo(() => {
    let items = [...localEmps];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] || ''; 
        let bv = b[sortConfig.key] || '';
        if (sortConfig.key.includes('Years')) { 
          av = Number(av); 
          bv = Number(bv); 
        }
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [localEmps, sortConfig]);'''

repl_sort = '''  const sortedEmps = useMemo(() => {
    let items = [...localEmps];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] || ''; 
        let bv = b[sortConfig.key] || '';
        if (sortConfig.key.includes('Years')) { 
          av = Number(av); 
          bv = Number(bv); 
        }
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      items.sort((a, b) => {
        const gradeA = getGradeLevel(a.currentGrade);
        const gradeB = getGradeLevel(b.currentGrade);
        if (gradeA !== gradeB) {
          return gradeB - gradeA;
        }
        const yA = Number(a.currentYears || 0);
        const yB = Number(b.currentYears || 0);
        return yB - yA;
      });
    }
    return items;
  }, [localEmps, sortConfig]);'''

content = content.replace(target_sort, repl_sort)

# 2. Update renderPromoCell to horizontal layout
target_promo = '''                const renderPromoCell = (emp, key, isFirst = false) => {
                  const diff = getDiff(emp, key);
                  return (
                    <td key={key} className={cx("bg-fuchsia-50/30 p-0.5 align-middle", isFirst ? "border-l" : "")}>
                      <div className="flex flex-col items-center justify-center">
                        <input type="text" value={emp[key]||''} onChange={e => handleChange(emp.id, key, e.target.value)} className={cx(inputCls, 'text-center px-1 w-full')} />
                        <div className="h-[12px] flex items-center justify-center mt-0.5">
                          {diff !== null && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded-sm leading-none border border-emerald-100 shadow-sm">{diff}年</span>}
                        </div>
                      </div>
                    </td>
                  );
                };'''

repl_promo = '''                const renderPromoCell = (emp, key, isFirst = false) => {
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

content = content.replace(target_promo, repl_promo)

# 3. Update table headers for promo columns (need to widen them and add the final column)
target_promo_header = '''<th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>'''
repl_promo_header = '''<th colSpan="9" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>'''
content = content.replace(target_promo_header, repl_promo_header)

target_promo_headers2 = '''                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50 border-l border-r w-14 min-w-[56px] whitespace-normal leading-tight" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r w-14 min-w-[56px] whitespace-normal leading-tight" />
                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50 w-14 min-w-[56px] whitespace-normal leading-tight" />'''

repl_promo_headers2 = '''                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50 border-l border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="来年度まで" sortKey="" className="bg-fuchsia-50/50 border-r w-[56px] min-w-[56px] whitespace-normal leading-tight" />'''

content = content.replace(target_promo_headers2, repl_promo_headers2)

# 4. Insert renderFinalDiffCell usage in the table row
target_render_row = '''                    {renderPromoCell(emp, 'promoYearDeptHead')}
                    {historyYears.length > 0 && historyYears.map(year => {'''
repl_render_row = '''                    {renderPromoCell(emp, 'promoYearDeptHead')}
                    {renderFinalDiffCell(emp)}
                    {historyYears.length > 0 && historyYears.map(year => {'''
content = content.replace(target_render_row, repl_render_row)

# 5. Add custom tooltip to history cells
target_history_td = '''                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px]">
                          <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center"} title={histStr} />
                        </td>
                      );'''

repl_history_td = '''                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px] relative group/hist">
                          <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center cursor-default"} title="" />
                          {histStr && (
                            <div className="absolute hidden group-hover/hist:block z-[999] bg-slate-800 text-white text-[11px] rounded py-1 px-2 top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap shadow-xl pointer-events-none">
                              {histStr}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                            </div>
                          )}
                        </td>
                      );'''

content = content.replace(target_history_td, repl_history_td)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS apply all changes")
