import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search_assign = """        const getAssignStr = (dId, gId, isNext) => {
          if (dId === 'retired') return '退職';
          if (!dId || dId === 'unassigned') return '未定';
          const nDept = departments.find(d => d.id === dId);
          const nGroup = nDept && gId ? (nDept.groups || []).find(g => g.id === gId) : null;
          const d = nDept ? (isNext ? (nDept.nextName || nDept.name) : nDept.name) : '';
          const g = nGroup ? (isNext ? (nGroup.nextName || nGroup.name) : nGroup.name) : '';
          
          if (d === 'システム用ダミー') return '未定';"""

replace_assign = """        const getAssignStr = (dId, gId, isNext) => {
          if (dId === 'retired') return '退職';
          if (!dId || dId === 'unassigned') return '未配置';
          const nDept = departments.find(d => d.id === dId);
          const nGroup = nDept && gId ? (nDept.groups || []).find(g => g.id === gId) : null;
          const d = nDept ? (isNext ? (nDept.nextName || nDept.name) : nDept.name) : '';
          const g = nGroup ? (isNext ? (nGroup.nextName || nGroup.name) : nGroup.name) : '';
          
          if (d === 'システム用ダミー') return '未配置';"""

if search_assign in code:
    code = code.replace(search_assign, replace_assign)
    print("Replaced getAssignStr successfully")
else:
    print("Could not find getAssignStr string")

search_jsx = """                <div className="flex gap-2 items-center text-blue-700">
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
                </div>"""

replace_jsx = """                <div className="flex gap-2 items-center text-blue-700">
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
                  ) : (!selEmp.departmentId || selEmp.departmentId === 'unassigned') ? (
                    <React.Fragment>
                      <span className="w-24 shrink-0 truncate"></span>
                      <span className="w-28 shrink-0 truncate"></span>
                      <span className="w-20 shrink-0 text-right font-medium"></span>
                      <span className="w-10 shrink-0 text-right">{nextAge !== '' ? `${nextAge}歳` : ''}</span>
                      <span className="w-32 shrink-0 truncate ml-1" title={selEmp.nextEmploymentType || ''}>{selEmp.nextEmploymentType || ''}</span>
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
                </div>"""

if search_jsx in code:
    code = code.replace(search_jsx, replace_jsx)
    print("Replaced JSX successfully")
else:
    print("Could not find JSX string")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)