with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(295, 335):
        print(f"{i+1}: {lines[i].rstrip()}")