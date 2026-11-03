import os

with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = """    } else {
      if (history.selectedEmp.id === tId && history.selectedEmp.isSource === src) {
        history.setSelectedEmp(null);
      } else {
        if (src) return;
        handleAssign(history.selectedEmp.id, { dId, pId, gId, gpId });
        history.setSelectedEmp(null);
      }
    }"""

replace = """    } else {
      if (history.selectedEmp.id === tId && history.selectedEmp.isSource === src) {
        history.setSelectedEmp(null);
      } else {
        if (src) {
          if (tId) history.setSelectedEmp({ id: tId, isSource: src });
          return;
        }
        handleAssign(history.selectedEmp.id, { dId, pId, gId, gpId });
        history.setSelectedEmp(null);
      }
    }"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced handleCellClick successfully")
else:
    print("Could not find handleCellClick string")

with open("src/contexts/AppContext.jsx", "w", encoding="utf8") as f:
    f.write(code)