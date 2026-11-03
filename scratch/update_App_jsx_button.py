import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t_search = """            <button onClick={() => openModal('openFile')} className="bg-slate-400/30 hover:bg-slate-400/50 border border-slate-300 text-slate-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold shadow-sm" title="保存したデータを読み込む"><FolderOpen className="w-4 h-4 mr-1" />開く</button>"""

t_insert = """            <button onClick={() => openModal('openFile')} className="bg-slate-400/30 hover:bg-slate-400/50 border border-slate-300 text-slate-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold shadow-sm" title="保存したデータを読み込む"><FolderOpen className="w-4 h-4 mr-1" />開く</button>
            <input type="file" accept=".json" className="hidden" ref={partialImportInputRef} onChange={handlePartialImport} />
            <button onClick={() => partialImportInputRef.current?.click()} className="bg-orange-500/30 hover:bg-orange-500/50 border border-orange-300 text-orange-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold shadow-sm" title="他のJSONファイルから一部のデータ（特記事項など）のみを読み込んで上書きします"><Download className="w-4 h-4 mr-1" />一部インポート</button>"""

if t_search in code:
    code = code.replace(t_search, t_insert)
    with open("src/App.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("Button added.")
else:
    print("Could not find button insertion point!")