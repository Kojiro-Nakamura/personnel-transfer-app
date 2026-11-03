with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(40, 80):
        print(f"{i+1}: {lines[i].rstrip()}")