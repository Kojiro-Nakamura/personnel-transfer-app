import os

with open("src/components/department/DepartmentComponents.jsx", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("opacity-0 group-hover/dept:opacity-100 ", "opacity-70 hover:opacity-100 transition-opacity ")
code = code.replace("opacity-0 group-hover/grp:opacity-100 ", "opacity-70 hover:opacity-100 transition-opacity ")

with open("src/components/department/DepartmentComponents.jsx", "w", encoding="utf8") as f:
    f.write(code)