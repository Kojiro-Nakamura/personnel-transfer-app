import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add FileCode to imports
if 'FileCode' not in text:
    text = text.replace('MessageSquareText\n}', 'MessageSquareText, FileCode\n}')

# Find the button
target_btn = '<button onClick={() => openModal(\'saveFile\', { type: \'html\', defaultName: currentFileName ? currentFileName.replace(\'.json\', \'\') : baseFileName })} className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の表をHTMLファイルとして保存する"><Table className="w-4 h-4 mr-1" />表HTML</button>'
repl_btn = '<button onClick={() => openModal(\'saveFile\', { type: \'html\', defaultName: currentFileName ? currentFileName.replace(\'.json\', \'\') : baseFileName })} className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の表をHTMLファイルとして保存する"><Table className="w-4 h-4 mr-1" />表HTML</button>\n            <button onClick={() => generateAndDownloadHTML(employees, departments, targetYear)} className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の職員一覧をHTMLファイルとして保存する"><FileCode className="w-4 h-4 mr-1" />職員一覧HTML</button>'

if target_btn in text:
    text = text.replace(target_btn, repl_btn)
    print("Button added successfully")
else:
    print("Button not found in App.jsx")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
