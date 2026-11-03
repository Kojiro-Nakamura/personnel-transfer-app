with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const EmployeeCell =" in line:
            for j in range(i+25, i+55):
                print(f"{j+1}: {lines[j].rstrip()}")
            break