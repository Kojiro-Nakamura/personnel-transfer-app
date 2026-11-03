with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(0, 15):
        print(f"{i+1}: {lines[i].rstrip()}")