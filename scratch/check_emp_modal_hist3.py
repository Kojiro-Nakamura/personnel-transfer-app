with open("src/components/employee/EmployeeComponents.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "history" in line.lower() and j > 400:
            print(f"{j+1}: {line.strip()}")