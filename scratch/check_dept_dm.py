with open("src/components/department/DepartmentComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "const deptMap =" in line:
            for j in range(max(0, i-2), i+30):
                print(f"{j+1}: {lines[j].rstrip()}")
            break