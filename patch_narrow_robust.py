import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update widths of promotion headers to w-[72px]
for promo in ['Chief', 'Assistant1', 'Assistant2', 'Assistant3', 'SecHead', 'DivHead', 'DeputyHead', 'DeptHead']:
    content = re.sub(
        r'sortKey="promoYear' + promo + r'" className="bg-fuchsia-50/50 border-r w-\[[0-9]+px\] min-w-\[[0-9]+px\] whitespace-normal leading-tight"',
        f'sortKey="promoYear{promo}" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight"',
        content
    )

# 2. Update renderPromoCell
promo_pattern = re.compile(
    r'const renderPromoCell = \(emp, key, isFirst = false\) => \{.*?\};\n',
    re.DOTALL
)
new_promo = '''const renderPromoCell = (emp, key, isFirst = false) => {
                  const diff = getDiff(emp, key);
                  return (
                    <td key={key} className={cx("bg-fuchsia-50/30 p-0.5 align-middle", isFirst ? "border-l" : "")}>
                      <div className="flex flex-row items-center justify-center gap-0.5 overflow-hidden">
                        {diff !== null && (
                          <div className="flex flex-row items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-0.5 rounded-sm border border-emerald-100 shadow-sm shrink-0 leading-none whitespace-nowrap">
                            {diff}年<ChevronRight className="w-2.5 h-2.5 text-emerald-500" />
                          </div>
                        )}
                        {diff === null && <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />}
                        <input type="text" value={emp[key]||''} onChange={e => handleChange(emp.id, key, e.target.value)} className={cx(inputCls, 'text-center !px-0 !w-[34px] shrink-0')} />
                      </div>
                    </td>
                  );
                };
'''
content = promo_pattern.sub(new_promo, content)

# 3. Update renderFinalDiffCell
final_pattern = re.compile(
    r'const renderFinalDiffCell = \(emp\) => \{.*?\};\n',
    re.DOTALL
)
new_final = '''const renderFinalDiffCell = (emp) => {
                  const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
                  let prevY = NaN;
                  for (let i = pKeys.length - 1; i >= 0; i--) {
                    const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                    if (!isNaN(y)) { prevY = y; break; }
                  }
                  const diff = (!isNaN(prevY)) ? targetYear - prevY : null;
                  return (
                    <td className="bg-fuchsia-50/30 p-0.5 align-middle border-r">
                      <div className="flex flex-row items-center justify-start gap-0.5 h-full min-h-[26px] overflow-hidden">
                        {diff !== null && (
                          <div className="flex flex-row items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded-sm border border-blue-200 shadow-sm shrink-0 leading-none whitespace-nowrap">
                            {diff >= 0 ? diff : 0}年<ChevronRight className="w-2.5 h-2.5 text-blue-500" />
                          </div>
                        )}
                        {diff === null && <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />}
                      </div>
                    </td>
                  );
                };
'''
content = final_pattern.sub(new_final, content)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS robust patch applied")
