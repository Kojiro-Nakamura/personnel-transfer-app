with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "return (" in line and i > 80:
            for j in range(i, i+30):
                if j < len(lines):
                    print(f"{j+1}: {lines[j].rstrip()}")
            break