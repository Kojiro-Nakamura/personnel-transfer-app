import sys

# 1. Update Modals.jsx
with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    modals = f.read()

# Titles
modals = modals.replace('昇進年度 (西暦)', '昇進年度 (西暦(和暦))')

# Widths in HTML Export
for i in range(21, 29):
    old_th = f'<th onclick="sortTable({i})" class="bg-fuchsia" style="width: 72px;">'
    new_th = f'<th onclick="sortTable({i})" class="bg-fuchsia" style="width: 80px;">'
    modals = modals.replace(old_th, new_th)

# Widths in React headers
old_th_react = 'className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight"'
new_th_react = 'className="bg-fuchsia-50/50 border-r w-[80px] min-w-[80px] whitespace-normal leading-tight"'
modals = modals.replace(old_th_react, new_th_react)

# Add getEraSuffixLocal inside BulkEditModal
suffix_func = '''  const getEraSuffixLocal = (year) => {
    const y = parseInt(year);
    if (isNaN(y)) return '';
    if (y >= 2019) return `R${y - 2018}`;
    if (y >= 1989) return `H${y - 1988}`;
    if (y >= 1926) return `S${y - 1925}`;
    return '';
  };'''

insert_target = '''  const getDiff = (emp, currentKey) => {'''
if insert_target in modals and suffix_func not in modals:
    modals = modals.replace(insert_target, suffix_func + '\n\n' + insert_target)

# HTML Export renderPromo
target_renderPromo = '''        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        cellHtml += emp[key] || '';'''
repl_renderPromo = '''        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        cellHtml += (emp[key] || '');
        if (emp[key]) {
          const suffix = getEraSuffixLocal(emp[key]);
          if (suffix) cellHtml += `<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">(${suffix})</span>`;
        }'''
modals = modals.replace(target_renderPromo, repl_renderPromo)

# React component renderPromoCell
target_renderPromoCell = '''                        {diff === null && <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />}
                        <input type="text" value={emp[key]||''} onChange={e => handleChange(emp.id, key, e.target.value)} className={cx(inputCls, 'text-center !px-0 !w-[34px] shrink-0')} />
                      </div>
                    </td>'''
repl_renderPromoCell = '''                        {diff === null && <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />}
                        <input type="text" value={emp[key]||''} onChange={e => handleChange(emp.id, key, e.target.value)} className={cx(inputCls, 'text-center !px-0 !w-[34px] shrink-0')} />
                        {emp[key] && <span className="text-[9px] text-slate-500 font-bold tracking-tighter shrink-0 select-none">({getEraSuffixLocal(emp[key])})</span>}
                      </div>
                    </td>'''
modals = modals.replace(target_renderPromoCell, repl_renderPromoCell)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(modals)

# 2. Update EmployeeComponents.jsx
with open('src/components/employee/EmployeeComponents.jsx', 'r', encoding='utf-8') as f:
    emp_comp = f.read()

emp_comp = emp_comp.replace('昇進年度 (西暦) と経過年数', '昇進年度 (西暦(和暦)) と経過年数')

with open('src/components/employee/EmployeeComponents.jsx', 'w', encoding='utf-8') as f:
    f.write(emp_comp)

print("SUCCESS")
