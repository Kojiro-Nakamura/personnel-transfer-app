import re
with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    code = f.read()

t_search = """      const colMap = new Map();
      headerCols.forEach((col, i) => {
        colMap.set(col.trim(), i);
      });"""

t_replace = """      const colMap = new Map();
      headerCols.forEach((col, i) => {
        let cleanCol = col.trim();
        if (cleanCol === '〇配属希望') cleanCol = '配属希望';
        if (cleanCol === '●特殊事情') cleanCol = '特殊事情';
        colMap.set(cleanCol, i);
      });"""

if t_search in code:
    code = code.replace(t_search, t_replace)
    with open("src/components/modals/Modals.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("CSV headers cleaned!")
else:
    print("Could not find insertion point!")