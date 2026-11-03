with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "BulkEditModal" in line:
            print(f"{j+1}: {line.strip()}")
            for k in range(j+1, j+20):
                print(f"{k+1}: {lines[k].strip()}")
            break