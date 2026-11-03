import re

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t = """              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-200" />
                <span className="font-bold text-sm text-slate-50">来年度の配属先の枠をクリックしてください</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); openModal('emp', selEmp); }}
                  className="bg-sky-600/80 hover:bg-sky-500 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center shadow"
                  title="職員の情報を編集"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  職員編集
                </button>
                <button
                  onClick={cancelSelection}"""

r = """              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-amber-200" />
                  <span className="font-bold text-[13px] text-slate-50">来年度の配属先の枠をクリックしてください</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openModal('emp', selEmp); }}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors flex items-center shadow-sm border border-sky-400"
                  title="職員の情報を編集"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  職員情報を編集
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelSelection}"""

code = code.replace(t, r)

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)