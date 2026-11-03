import re
with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace(
    'value={fd.note}',
    'value={fd.note || ""}'
).replace(
    'value={fd.desiredAssignment}',
    'value={fd.desiredAssignment || ""}'
).replace(
    'value={fd.specialCircumstances}',
    'value={fd.specialCircumstances || ""}'
)

with open("src/components/employee/EmployeeComponents.jsx", "w", encoding="utf8") as f:
    f.write(code)
print("Employee form fixed!")