with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "history.employees.map(e => ({" in line:
            for j in range(max(0, i-2), i+30):
                print(f"{j+1}: {lines[j].rstrip()}")
            break