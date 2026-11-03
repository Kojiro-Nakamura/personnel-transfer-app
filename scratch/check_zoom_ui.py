with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(115, 130):
        print(f"{i+1}: {lines[i].rstrip()}")