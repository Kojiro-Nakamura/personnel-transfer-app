import re

with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    code = f.read()

t1 = """              {sortedEmps.map((emp, empIdx) => {
                const isS = selectedIds.has(emp.id);
                const handleChange = (id, key, val) => setLocalEmps(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));"""

r1 = """              {sortedEmps.map((emp, empIdx) => {
                const isS = selectedIds.has(emp.id);
                const handleChange = (id, key, val) => setLocalEmps(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));
                const handleHistoryChange = (id, year, val) => {
                    setLocalEmps(prev => prev.map(e => {
                        if (e.id !== id) return e;
                        const newHistory = [...(e.history || [])];
                        const histIdx = newHistory.findIndex(h => h.year === year);
                        if (histIdx >= 0) {
                            newHistory[histIdx] = { ...newHistory[histIdx], department: val };
                        } else {
                            newHistory.push({ year, department: val });
                        }
                        return { ...e, history: newHistory };
                    }));
                };"""

code = code.replace(t1, r1)

t2 = """                      } else {
                          const hist = (emp.history || []).find(h => h.year === year);
                          histStr = hist ? hist.department : '';
                      }

                      const isBottom = empIdx >= sortedEmps.length - 2;
                      const isRight = yIdx >= historyYears.length - 2;
                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px] relative group/hist">
                          <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center cursor-default"} title="" />"""

r2 = """                      } else {
                          const hist = (emp.history || []).find(h => h.year === year);
                          histStr = hist ? hist.department : '';
                      }

                      const isBottom = empIdx >= sortedEmps.length - 2;
                      const isRight = yIdx >= historyYears.length - 2;
                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px] relative group/hist">
                          {year === targetYear ? (
                             <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center cursor-default"} title="" />
                          ) : (
                             <input type="text" value={histStr} onChange={(e) => handleHistoryChange(emp.id, year, e.target.value)} className={inputCls + " focus:bg-white focus:ring-1 text-center"} title="" />
                          )}"""

code = code.replace(t2, r2)

with open("src/components/modals/Modals.jsx", "w", encoding="utf8") as f:
    f.write(code)