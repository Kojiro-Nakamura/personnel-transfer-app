import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search_jsx = """            <div className="bg-white text-slate-900 rounded px-3 py-2 flex flex-col gap-1 shadow-inner text-[11px]">
              <div className="flex items-center gap-3 font-bold text-sm text-[#065084] border-b pb-1 mb-1 border-slate-200">
                <span className="truncate flex-1">{selEmp.name}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-slate-700">
                <div className="flex gap-2 items-center">
                  <span className="w-10 shrink-0 font-bold">今年度:</span>
                  <span className="flex-1 truncate" title={`${currDeptStr}`}>{currDeptStr}</span>
                  <span className="w-24 shrink-0 truncate">{selEmp.currentTitle || '未定'}</span>
                  <span className="w-28 shrink-0 truncate">{selEmp.currentGrade || ''}</span>
                  <span className={cx("w-20 shrink-0 text-right font-medium", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "")}>{yd}</span>
                  <span className="w-10 shrink-0 text-right">{dispAge !== '' ? `${dispAge}歳` : ''}</span>
                  <span className="w-20 shrink-0 truncate ml-1">{selEmp.currentEmploymentType || ''}</span>
                </div>
                <div className="flex gap-2 items-center text-blue-700">
                  <span className="w-10 shrink-0 font-bold">来年度:</span>
                  <span className="flex-1 truncate" title={`${nextDeptStr}`}>{nextDeptStr}</span>
                  {selEmp.departmentId === 'retired' ? (
                    <React.Fragment>
                      <span className="w-24 shrink-0 truncate"></span>
                      <span className="w-28 shrink-0 truncate"></span>
                      <span className="w-20 shrink-0 text-right font-medium"></span>
                      <span className="w-10 shrink-0 text-right">{nextAge !== '' ? `${nextAge}歳` : ''}</span>
                      <span className="w-20 shrink-0 truncate ml-1"></span>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <span className="w-24 shrink-0 truncate">{selEmp.nextTitle || '未定'}</span>
                      <span className="w-28 shrink-0 truncate">{selEmp.nextGrade || ''}</span>
                      <span className={cx("w-20 shrink-0 text-right font-medium", nextYs >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "")}>{nextYd}</span>
                      <span className="w-10 shrink-0 text-right">{nextAge !== '' ? `${nextAge}歳` : ''}</span>
                      <span className="w-20 shrink-0 truncate ml-1">{selEmp.nextEmploymentType || ''}</span>
                    </React.Fragment>
                  )}
                </div>
              </div>
            </div>"""

replace_jsx = """            <div className="bg-white text-slate-900 rounded px-3 py-2 flex flex-col gap-1 shadow-inner text-[11px]">
              <div className="flex items-center gap-3 font-bold text-sm text-[#065084] border-b pb-1 mb-1 border-slate-200">
                <span className="truncate flex-1">{selEmp.name}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-slate-700">
                <div className="flex gap-2 items-center">
                  <span className="w-10 shrink-0 font-bold">今年度:</span>
                  <span className="flex-1 truncate" title={`${currDeptStr}`}>{currDeptStr}</span>
                  <span className="w-24 shrink-0 truncate">{selEmp.currentTitle || '未定'}</span>
                  <span className="w-28 shrink-0 truncate">{selEmp.currentGrade || ''}</span>
                  <span className={cx("w-20 shrink-0 text-right font-medium", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "")}>{yd}</span>
                  <span className="w-10 shrink-0 text-right">{dispAge !== '' ? `${dispAge}歳` : ''}</span>
                  <span className="w-32 shrink-0 truncate ml-1" title={selEmp.currentEmploymentType || ''}>{selEmp.currentEmploymentType || ''}</span>
                </div>
                <div className="flex gap-2 items-center text-blue-700">
                  <span className="w-10 shrink-0 font-bold">来年度:</span>
                  <span className="flex-1 truncate" title={`${nextDeptStr}`}>{nextDeptStr}</span>
                  {selEmp.departmentId === 'retired' ? (
                    <React.Fragment>
                      <span className="w-24 shrink-0 truncate"></span>
                      <span className="w-28 shrink-0 truncate"></span>
                      <span className="w-20 shrink-0 text-right font-medium"></span>
                      <span className="w-10 shrink-0 text-right">{nextAge !== '' ? `${nextAge}歳` : ''}</span>
                      <span className="w-32 shrink-0 truncate ml-1"></span>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <span className="w-24 shrink-0 truncate">{selEmp.nextTitle || '未定'}</span>
                      <span className="w-28 shrink-0 truncate">{selEmp.nextGrade || ''}</span>
                      <span className={cx("w-20 shrink-0 text-right font-medium", nextYs >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "")}>{nextYd}</span>
                      <span className="w-10 shrink-0 text-right">{nextAge !== '' ? `${nextAge}歳` : ''}</span>
                      <span className="w-32 shrink-0 truncate ml-1" title={selEmp.nextEmploymentType || ''}>{selEmp.nextEmploymentType || ''}</span>
                    </React.Fragment>
                  )}
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