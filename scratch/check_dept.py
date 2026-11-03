with open("src/components/department/DepartmentComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(160, 185):
        print(f"{i+1}: {lines[i].rstrip()}")