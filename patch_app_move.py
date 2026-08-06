import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update button text and color
target_btn = '<button onClick={() => openModal(\'saveFile\', { type: \'html\', defaultName: currentFileName ? currentFileName.replace(\'.json\', \'\') : baseFileName })} className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の表をHTMLファイルとして保存する"><Table className="w-4 h-4 mr-1" />表HTML</button>'
repl_btn = '<button onClick={() => openModal(\'saveFile\', { type: \'html\', defaultName: currentFileName ? currentFileName.replace(\'.json\', \'\') : baseFileName })} className="bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の人事異動案をHTMLファイルとして保存する"><Table className="w-4 h-4 mr-1" />人事異動案HTML</button>'

if target_btn in text:
    text = text.replace(target_btn, repl_btn)
else:
    print("表HTML button not found")

# 2. Move filter dropdown
filter_code = '''            <div className="flex items-center gap-1.5 ml-2 mr-2">
              <Filter className="w-4 h-4 text-sky-300" />
              <select 
                value={filterLevel} 
                onChange={e => setFilterLevel(Number(e.target.value))} 
                className={cx("text-xs py-1.5 px-2 rounded outline-none font-bold cursor-pointer transition-colors", filterLevel > 0 ? "bg-sky-500 text-white shadow-inner" : "bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transition-all")}
                title="表示する職員の条件を切り替える"
              >
                <option value={0}>全件表示</option>
                {GRADE_OPTIONS.filter(g => g !== "").map(g => (
                  <option key={g} value={GRADE_LEVELS[g]}>{g}以上</option>
                ))}
              </select>
            </div>'''

if filter_code in text:
    text = text.replace(filter_code + '\n', '')  # Remove from original location
else:
    print("Filter code not found. Trying flexible match.")
    # Fallback to search if formatting is slightly off
    start_filter = text.find('<div className="flex items-center gap-1.5 ml-2 mr-2">')
    if start_filter != -1:
        end_filter = text.find('</div>', text.find('</select>', start_filter)) + 6
        filter_code = text[start_filter:end_filter]
        text = text[:start_filter] + text[end_filter:]
        text = text.replace('\n\n\n', '\n\n')

target_dept_row = '<div className="flex gap-2 pb-1.5">'
repl_dept_row = f'''<div className="flex gap-2 pb-1.5 items-center">
            {filter_code.replace('py-1.5', 'py-1')}'''

if target_dept_row in text:
    text = text.replace(target_dept_row, repl_dept_row)
else:
    print("target_dept_row not found")


with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
