with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    code = f.read()

t = """const baseHistory = [...(fd.history || [])].sort((a, b) => a.year - b.year);"""
r = """const baseHistory = [...(fd.history || [])].filter(h => h.department && h.department.trim() !== '').sort((a, b) => a.year - b.year);"""

code = code.replace(t, r)

with open("src/components/employee/EmployeeComponents.jsx", "w", encoding="utf8") as f:
    f.write(code)