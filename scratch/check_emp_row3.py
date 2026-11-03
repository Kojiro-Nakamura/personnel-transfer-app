with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(215, 235):
        print(f"{i+1}: {lines[i].rstrip()}")