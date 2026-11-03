with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(193, 220):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")