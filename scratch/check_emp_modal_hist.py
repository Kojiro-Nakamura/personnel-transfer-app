with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(710, 725):
        print(f"{j+1}: {lines[j].rstrip()}")