with open("src/components/department/DepartmentComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(160, 205):
        print(f"{i+1}: {lines[i].rstrip()}")