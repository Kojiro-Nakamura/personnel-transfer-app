with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(15, 30):
        print(f"{i+1}: {lines[i].rstrip()}")