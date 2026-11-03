import re

with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    code = f.read()

t1 = """                        const histIdx = newHistory.findIndex(h => h.year === year);
                        if (histIdx >= 0) {
                            newHistory[histIdx] = { ...newHistory[histIdx], department: val };
                        } else {
                            newHistory.push({ year, department: val });
                        }"""

r1 = """                        const histIdx = newHistory.findIndex(h => Number(h.year) === Number(year));
                        if (histIdx >= 0) {
                            newHistory[histIdx] = { ...newHistory[histIdx], department: val };
                        } else {
                            newHistory.push({ year: Number(year), department: val });
                        }"""

code = code.replace(t1, r1)

t2 = """                          const hist = (emp.history || []).find(h => h.year === year);"""

r2 = """                          const hist = (emp.history || []).find(h => Number(h.year) === Number(year));"""

code = code.replace(t2, r2)

with open("src/components/modals/Modals.jsx", "w", encoding="utf8") as f:
    f.write(code)