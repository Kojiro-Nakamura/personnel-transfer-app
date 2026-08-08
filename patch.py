import os
file = 'src/components/department/DepartmentComponents.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('bg-slate-700 text-white px-2 py-1.5 flex justify-between items-center sticky top-0 z-10 group/dept', 'bg-slate-500 text-white px-2 py-1.5 flex justify-between items-center sticky top-0 z-10 group/dept shadow-sm')
content = content.replace('cursor-pointer hover:bg-slate-600 rounded p-0.5', 'cursor-pointer hover:bg-slate-400 rounded p-0.5')
content = content.replace('w-4 h-4 text-slate-300', 'w-4 h-4 text-slate-100')
content = content.replace('w-4 h-4 text-sky-300', 'w-4 h-4 text-sky-200')
content = content.replace('text-[10px] bg-slate-600 px-2 py-0.5 rounded text-slate-200 ml-2 shadow-inner pointer-events-none', 'text-[10px] bg-slate-400 px-2 py-0.5 rounded text-slate-50 ml-2 shadow-inner pointer-events-none')
content = content.replace('cx("p-0.5 rounded text-slate-300", onMoveUp ? "hover:bg-slate-600 hover:text-white" : "invisible")', 'cx("p-0.5 rounded text-slate-200", onMoveUp ? "hover:bg-slate-400 hover:text-white" : "invisible")')
content = content.replace('cx("p-0.5 rounded text-slate-300", onMoveDown ? "hover:bg-slate-600 hover:text-white" : "invisible")', 'cx("p-0.5 rounded text-slate-200", onMoveDown ? "hover:bg-slate-400 hover:text-white" : "invisible")')
content = content.replace('p-1 hover:bg-rose-500/50 text-rose-300 rounded', 'p-1 hover:bg-rose-500 text-white rounded')
content = content.replace('border-l border-slate-600', 'border-l border-slate-400')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patch complete.')
