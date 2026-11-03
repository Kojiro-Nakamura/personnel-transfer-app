import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search_vars = """        const dispTitle = selEmp.currentTitle || '未定';
        const dispGrade = selEmp.currentGrade;
        const dispAge = calculateAge(selEmp.birthDate, targetYear - 1);"""

replace_vars = """        const dispTitle = selEmp.currentTitle || '未定';
        const dispGrade = selEmp.currentGrade;
        const dispAge = calculateAge(selEmp.birthDate, targetYear - 1);
        
        const nextYs = selEmp.nextYears;
        const nextSk = (selEmp.nextSkills || []).join('＋');
        const nextYd = nextSk ? `${nextYs}年(${nextSk})` : `${nextYs}年`;
        const nextAge = calculateAge(selEmp.birthDate, targetYear);"""

if search_vars in code:
    code = code.replace(search_vars, replace_vars)
    print("Replaced vars successfully")
else:
    print("Could not find vars string")

search_jsx = """            <div className="bg-white text-slate-900 rounded px-3 py-2 flex flex-col gap-1 shadow-inner text-[11px]">
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

replace_jsx = """            <div className="bg-white text-slate-900 rounded px-3 py-2 flex flex-col gap-1 shadow-inner text-[11px]">
              <div className="flex items-center gap-3 font-bold text-sm text-[#065084] border-b pb-1 mb-1 border-slate-200">
                <span className="truncate flex-1">{selEmp.name}</span>
                <span className="text-left shrink-0">{noteText}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-slate-700">
                <div className="flex gap-2 items-center">
                  <span className="w-10 shrink-0 font-bold">今年度:</span>
                  <span className="flex-1 truncate" title={`${currDeptStr}`}>{currDeptStr}</span>
                  <span className="w-24 shrink-0 truncate">{selEmp.currentTitle || '未定'}</span>
                  <span className="w-32 shrink-0 truncate">{selEmp.currentGrade || ''}</span>
                  <span className={cx("w-20 shrink-0 text-right font-medium", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "")}>{yd}</span>
                  <span className="w-12 shrink-0 text-right">{dispAge !== '' ? `${dispAge}歳` : ''}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="w-10 shrink-0 font-bold text-blue-700">来年度:</span>
                  <span className="flex-1 truncate text-blue-700" title={`${nextDeptStr}`}>{nextDeptStr}</span>
                  <span className="w-24 shrink-0 truncate text-blue-700">{selEmp.nextTitle || '未定'}</span>
                  <span className="w-32 shrink-0 truncate text-blue-700">{selEmp.nextGrade || ''}</span>
                  <span className={cx("w-20 shrink-0 text-right font-medium text-blue-700", nextYs >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "")}>{nextYd}</span>
                  <span className="w-12 shrink-0 text-right text-blue-700">{nextAge !== '' ? `${nextAge}歳` : ''}</span>
                </div>
              </div>
            </div>"""

if search_jsx in code:
    code = code.replace(search_jsx, replace_jsx)
    print("Replaced JSX successfully")
else:
    print("Could not find JSX string")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)