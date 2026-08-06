import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''        let dir = 'asc'; 
        if (sortConfig.key === sortKey && sortConfig.direction === 'asc') dir = 'desc'; '''

repl = '''        let dir = 'desc'; 
        if (sortConfig.key === sortKey && sortConfig.direction === 'desc') dir = 'asc'; '''

target_arrow = '''          {sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '▲'}'''
repl_arrow = '''          {sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '▼'}'''

if target in text and target_arrow in text:
    text = text.replace(target, repl)
    text = text.replace(target_arrow, repl_arrow)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Patch applied to Modals.jsx")
else:
    print("Targets not found")
