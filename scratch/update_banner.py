import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = """            <div className="bg-white text-slate-900 rounded px-3 py-2 flex items-center gap-3 shadow-inner">
              <div className="w-14 truncate text-[11px] text-black" title={dispTitle}>{dispTitle}</div>
              <div className="flex-1 truncate text-sm font-bold text-[#065084]" title={selEmp.name}>{selEmp.name}</div>
              <div className="w-20 truncate text-[11px] text-black text-center" title={dispGrade}>{dispGrade}</div>
              <div className="w-10 text-[12px] text-black text-right" title={`${dispAge}歳`}>{dispAge !== '' ? `${dispAge}歳` : ''}</div>
              <div className={cx("w-20 text-[12px] text-right font-medium truncate shrink-0", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "text-black")} title={yd}>{yd}</div>
              <div className="w-24 truncate text-[11px] text-slate-900 text-left shrink-0 ml-1" title={noteText}>{noteText}</div>
            </div>"""

replace = """            <div className="bg-white text-slate-900 rounded px-3 py-2 flex flex-col gap-1 shadow-inner text-[11px]">
              <div className="flex items-center gap-3 font-bold text-sm text-[#065084] border-b pb-1 mb-1 border-slate-200">
                <span className="truncate flex-1">{selEmp.name}</span>
                <span className="w-12 text-right">{dispAge !== '' ? `${dispAge}歳` : ''}</span>
                <span className={cx("text-right px-1", ys >= 3 ? "text-rose-700 bg-rose-100 rounded" : "")}>{yd}</span>
                <span className="text-left shrink-0">{noteText}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-slate-700">
                <div className="flex gap-2">
                  <span className="w-10 shrink-0 font-bold">今年度:</span>
                  <span className="flex-1 truncate" title={`${currDeptStr}`}>{currDeptStr}</span>
                  <span className="w-24 shrink-0 truncate">{selEmp.currentTitle || '未定'}</span>
                  <span className="w-32 shrink-0 truncate">{selEmp.currentGrade || '未定'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-10 shrink-0 font-bold text-blue-700">来年度:</span>
                  <span className="flex-1 truncate text-blue-700" title={`${nextDeptStr}`}>{nextDeptStr}</span>
                  <span className="w-24 shrink-0 truncate text-blue-700">{selEmp.nextTitle || '未定'}</span>
                  <span className="w-32 shrink-0 truncate text-blue-700">{selEmp.nextGrade || '未定'}</span>
                </div>
              </div>
            </div>"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced banner successfully")
else:
    print("Could not find banner string")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)