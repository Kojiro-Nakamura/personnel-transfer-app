with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "<input type=\"text\" value={histStr} readOnly className={inputCls + \" bg-transparent border-transparent text-slate-600 text-center cursor-default\"} title=\"\" />" in line:
        if "td key={`hist-d-${year}`}" in lines[i-1]:
            # This is the one
            lines[i] = """                          {year === targetYear ? (
                             <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center cursor-default"} title="" />
                          ) : (
                             <input type="text" value={histStr} onChange={(e) => handleHistoryChange(emp.id, year, e.target.value)} className={inputCls + " focus:bg-white focus:ring-1 text-center"} title="" />
                          )}\n"""

with open("src/components/modals/Modals.jsx", "w", encoding="utf8") as f:
    f.writelines(lines)