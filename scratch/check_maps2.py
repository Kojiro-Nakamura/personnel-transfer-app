with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(160, 220):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")