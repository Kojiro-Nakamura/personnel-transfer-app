with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "history" in line and "onChange" in line and "Employee" not in line: # Try to find other history onChange
            print(f"{j+1}: {line.strip()}")