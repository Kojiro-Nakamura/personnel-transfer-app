with open("src/components/department/DepartmentComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(120, 145):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")
    print("---------------------------------")
    for i in range(240, 260):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")