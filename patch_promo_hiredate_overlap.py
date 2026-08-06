import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update colSpan
content = content.replace(
    '<th colSpan="9" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>',
    '<th colSpan="10" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>'
)

# 2. Update column widths to 96px to prevent overlap
for promo in ['Chief', 'Assistant1', 'Assistant2', 'Assistant3', 'SecHead', 'DivHead', 'DeputyHead', 'DeptHead']:
    old_th = f'sortKey="promoYear{promo}" className="bg-fuchsia-50/50 border-r w-[82px] min-w-[82px] whitespace-normal leading-tight"'
    new_th = f'sortKey="promoYear{promo}" className="bg-fuchsia-50/50 border-r w-[96px] min-w-[96px] whitespace-normal leading-tight"'
    content = content.replace(old_th, new_th)
    
    # Also handle the first one which might have border-l
    old_th_first = f'sortKey="promoYear{promo}" className="bg-fuchsia-50/50 border-l border-r w-[82px] min-w-[82px] whitespace-normal leading-tight"'
    new_th_first = f'sortKey="promoYear{promo}" className="bg-fuchsia-50/50 border-r w-[96px] min-w-[96px] whitespace-normal leading-tight"'
    content = content.replace(old_th_first, new_th_first)

# 3. Insert "採用" header
target_header_insert = '<Th label="係長級(主査)" sortKey="promoYearChief"'
new_header_insert = '<Th label="採用" sortKey="hireDate" className="bg-fuchsia-50/50 border-l border-r w-[48px] min-w-[48px] whitespace-normal leading-tight" />\n                <Th label="係長級(主査)" sortKey="promoYearChief"'
content = content.replace(target_header_insert, new_header_insert)

# 4. Insert "採用" cell and remove isFirst from promoYearChief
target_cell_insert = "{renderPromoCell(emp, 'promoYearChief', true)}"
new_cell_insert = '''<td className="bg-fuchsia-50/30 p-1 align-middle border-l border-r">
                      <div className="flex items-center justify-center h-full min-h-[26px] text-slate-700 text-xs">
                        {emp.hireDate ? emp.hireDate.substring(0,4) : ''}
                      </div>
                    </td>
                    {renderPromoCell(emp, 'promoYearChief', false)}'''
content = content.replace(target_cell_insert, new_cell_insert)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS apply hire date and width changes")
