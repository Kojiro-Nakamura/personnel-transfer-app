import sys
import re

# 1. Update EmployeeComponents.jsx
with open('src/components/employee/EmployeeComponents.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target_arrow_diff = '''      const diff = !isNaN(lastY) ? (targetYear - lastY) : null;'''
repl_arrow_diff = '''      const diff = !isNaN(lastY) ? (targetYear - lastY + 1) : null;'''
content = content.replace(target_arrow_diff, repl_arrow_diff)

with open('src/components/employee/EmployeeComponents.jsx', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Update Modals.jsx
with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    modals = f.read()

# BulkEditModal final diff column title
target_th = '''<Th label="来年度まで" sortKey="" className="bg-fuchsia-50/50 border-r w-[56px] min-w-[56px] whitespace-normal leading-tight" />'''
repl_th = '''<Th label="来年度" sortKey="" className="bg-fuchsia-50/50 border-r w-[56px] min-w-[56px] whitespace-normal leading-tight" />'''
modals = modals.replace(target_th, repl_th)

# handleExportHTML string
target_html_th = '''<th onclick="sortTable(29)" class="bg-fuchsia" style="width: 56px;">来年度まで</th>'''
repl_html_th = '''<th onclick="sortTable(29)" class="bg-fuchsia" style="width: 56px;">来年度</th>'''
modals = modals.replace(target_html_th, repl_html_th)

# BulkEditModal renderFinalDiffCell calculation
target_diff = '''const diff = (!isNaN(prevY)) ? targetYear - prevY : null;'''
repl_diff = '''const diff = (!isNaN(prevY)) ? targetYear - prevY + 1 : null;'''
modals = modals.replace(target_diff, repl_diff)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(modals)

print("SUCCESS patched +1 year")
