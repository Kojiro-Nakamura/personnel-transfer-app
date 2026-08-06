import sys
with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''                const handleChange = (id, key, val) => setLocalEmps(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));
                
                return ('''

repl1 = '''                const handleChange = (id, key, val) => setLocalEmps(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));

                const getDiff = (emp, currentKey) => {
                  const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
                  const currentIdx = pKeys.indexOf(currentKey);
                  if (currentIdx <= 0) return null;
                  const currentY = currentKey === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[currentKey] || 'NaN');
                  if (isNaN(currentY)) return null;
                  let prevY = NaN;
                  for (let i = currentIdx - 1; i >= 0; i--) {
                    const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                    if (!isNaN(y)) { prevY = y; break; }
                  }
                  if (!isNaN(prevY)) {
                    const diff = currentY - prevY;
                    return diff >= 0 ? diff : 0;
                  }
                  return null;
                };

                const renderPromoCell = (emp, key, isFirst = false) => {
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
                };

                return ('''

target2 = '''                    <td className="bg-fuchsia-50/30 border-l"><input type="text" value={emp.promoYearChief||''} onChange={e => handleChange(emp.id,'promoYearChief',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-fuchsia-50/30"><input type="text" value={emp.promoYearAssistant1||''} onChange={e => handleChange(emp.id,'promoYearAssistant1',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-fuchsia-50/30"><input type="text" value={emp.promoYearAssistant2||''} onChange={e => handleChange(emp.id,'promoYearAssistant2',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-fuchsia-50/30"><input type="text" value={emp.promoYearAssistant3||''} onChange={e => handleChange(emp.id,'promoYearAssistant3',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-fuchsia-50/30"><input type="text" value={emp.promoYearSecHead||''} onChange={e => handleChange(emp.id,'promoYearSecHead',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-fuchsia-50/30"><input type="text" value={emp.promoYearDivHead||''} onChange={e => handleChange(emp.id,'promoYearDivHead',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-fuchsia-50/30"><input type="text" value={emp.promoYearDeputyHead||''} onChange={e => handleChange(emp.id,'promoYearDeputyHead',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-fuchsia-50/30"><input type="text" value={emp.promoYearDeptHead||''} onChange={e => handleChange(emp.id,'promoYearDeptHead',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>'''

repl2 = '''                    {renderPromoCell(emp, 'promoYearChief', true)}
                    {renderPromoCell(emp, 'promoYearAssistant1')}
                    {renderPromoCell(emp, 'promoYearAssistant2')}
                    {renderPromoCell(emp, 'promoYearAssistant3')}
                    {renderPromoCell(emp, 'promoYearSecHead')}
                    {renderPromoCell(emp, 'promoYearDivHead')}
                    {renderPromoCell(emp, 'promoYearDeputyHead')}
                    {renderPromoCell(emp, 'promoYearDeptHead')}'''

if target1 in content and target2 in content:
    content = content.replace(target1, repl1).replace(target2, repl2)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS')
else:
    print('FAILED')
    print('t1:', target1 in content)
    print('t2:', target2 in content)
