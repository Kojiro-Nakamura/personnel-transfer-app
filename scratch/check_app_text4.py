with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(315, 340):
        print(f"{j+1}: {lines[j].rstrip()}")