import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Change HTML button colors to purple
target_btn_html1 = '<button onClick={() => openModal(\'saveFile\', { type: \'html\', defaultName: currentFileName ? currentFileName.replace(\'.json\', \'\') : baseFileName })} className="bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の人事異動案をHTMLファイルとして保存する"><Table className="w-4 h-4 mr-1" />人事異動案HTML</button>'
repl_btn_html1 = '<button onClick={() => openModal(\'saveFile\', { type: \'html\', defaultName: currentFileName ? currentFileName.replace(\'.json\', \'\') : baseFileName })} className="bg-purple-600 hover:bg-purple-500 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の人事異動案をHTMLファイルとして保存する"><Table className="w-4 h-4 mr-1" />人事異動案HTML</button>'

target_btn_html2 = '<button onClick={() => generateAndDownloadHTML(employees, departments, targetYear)} className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の職員一覧をHTMLファイルとして保存する"><FileCode className="w-4 h-4 mr-1" />職員一覧HTML</button>'
repl_btn_html2 = '<button onClick={() => generateAndDownloadHTML(employees, departments, targetYear)} className="bg-purple-700 hover:bg-purple-600 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の職員一覧をHTMLファイルとして保存する"><FileCode className="w-4 h-4 mr-1" />職員一覧HTML</button>'

text = text.replace(target_btn_html1, repl_btn_html1)
text = text.replace(target_btn_html2, repl_btn_html2)


# 2. Move expand/collapse buttons
expand_collapse_code = '''            <div className="flex gap-0.5">
              <button onClick={expandAll} className="p-1.5 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all rounded" title="すべての部署を展開する"><ChevronsDown className="w-4 h-4"/></button>
              <button onClick={collapseAll} className="p-1.5 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all rounded" title="すべての部署を折りたたむ"><ChevronsUp className="w-4 h-4"/></button>
            </div>'''

if expand_collapse_code in text:
    text = text.replace(expand_collapse_code + '\n', '')
else:
    print("Could not find expand/collapse code exactly.")
    # Fallback remove
    start_ec = text.find('<button onClick={expandAll}')
    if start_ec != -1:
        start_div = text.rfind('<div', 0, start_ec)
        end_div = text.find('</div>', start_ec) + 6
        text = text[:start_div] + text[end_div:]

# Insert it before the filter in the lower row
target_lower_row = '''          <div className="flex gap-2 pb-1.5 items-center">
                        <div className="flex items-center gap-1.5 ml-2 mr-2">'''

# Modify padding slightly for the lower row to match
new_ec_code = '''            <div className="flex gap-0.5 items-center mr-1">
              <button onClick={expandAll} className="p-1 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all rounded" title="すべての部署を展開する"><ChevronsDown className="w-4 h-4"/></button>
              <button onClick={collapseAll} className="p-1 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all rounded" title="すべての部署を折りたたむ"><ChevronsUp className="w-4 h-4"/></button>
            </div>'''

repl_lower_row = f'''          <div className="flex gap-2 pb-1.5 items-center">
{new_ec_code}
                        <div className="flex items-center gap-1.5 mr-2">'''

if target_lower_row in text:
    text = text.replace(target_lower_row, repl_lower_row)
else:
    print("Could not find lower row target.")
    # The previous script had some whitespace oddities, let's just search for the filter div
    filter_start = text.find('<div className="flex items-center gap-1.5 ml-2 mr-2">')
    if filter_start != -1:
        text = text[:filter_start] + new_ec_code + '\n            ' + text[filter_start:].replace('ml-2 mr-2', 'mr-2')
    else:
        print("Could not find filter start either.")

# Clean up empty lines
text = text.replace('\n\n\n\n', '\n\n')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done")
