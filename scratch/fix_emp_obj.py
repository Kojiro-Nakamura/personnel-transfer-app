import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Replace:
#       if (filterLevel > 0) {
#         filteredEmps = emps.filter(eId => {
#           const emp = employees.find(e => e.id === eId);
#           if (!emp) return false;

replace_filter1 = """      if (filterLevel > 0) {
        filteredEmps = emps.filter(emp => {
          if (!emp) return false;"""

code = code.replace("""      if (filterLevel > 0) {
        filteredEmps = emps.filter(eId => {
          const emp = employees.find(e => e.id === eId);
          if (!emp) return false;""", replace_filter1)


# Replace:
#       filteredEmps.forEach((eId, idx) => {
#         const emp = employees.find(e => e.id === eId);
#         if (!emp) return;

replace_loop1 = """      filteredEmps.forEach((emp, idx) => {
        if (!emp) return;"""

code = code.replace("""      filteredEmps.forEach((eId, idx) => {
        const emp = employees.find(e => e.id === eId);
        if (!emp) return;""", replace_loop1)


# And for the unassigned block:
#     uObj.direct.current.forEach(eId => {
#       const emp = employees.find(e => e.id === eId);
#       if (!emp) return;

replace_loop2 = """    uObj.direct.current.forEach(emp => {
      if (!emp) return;"""

code = code.replace("""    uObj.direct.current.forEach(eId => {
      const emp = employees.find(e => e.id === eId);
      if (!emp) return;""", replace_loop2)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)