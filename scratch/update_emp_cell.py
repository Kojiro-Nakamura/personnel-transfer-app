import os

with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = "onClick={(!isNext && isPickingMode && !isSelected) ? undefined : onClick}"
replace = "onClick={onClick}"

if search in code:
    code = code.replace(search, replace)
    print("Replaced onClick successfully")
else:
    print("Could not find onClick string")

with open("src/components/employee/EmployeeComponents.jsx", "w", encoding="utf8") as f:
    f.write(code)