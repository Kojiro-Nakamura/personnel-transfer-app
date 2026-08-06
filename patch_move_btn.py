import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target_btn = '''            <button 
              onClick={handleExportHTML} 
              className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold flex items-center gap-1 border border-orange-200 hover:bg-orange-200 transition-colors" 
              title="現在の内容をHTML形式で保存します（閲覧・ソート用）"
            >
              <FileCode className="w-3.5 h-3.5" />HTML保存
            </button>'''

if target_btn in content:
    # Remove the button from its current position
    content = content.replace(target_btn + '\n', '')
    
    # Insert it before the closing div of the button group
    insert_target = '''            )}
          </div>
          <button onClick={onClose} title="閉じる"><X className="w-4 h-4" /></button>'''
    
    insert_repl = '''            )}
''' + target_btn + '''
          </div>
          <button onClick={onClose} title="閉じる"><X className="w-4 h-4" /></button>'''
    
    content = content.replace(insert_target, insert_repl)
    
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS moved HTML button")
else:
    print("ERROR: Target button not found")
