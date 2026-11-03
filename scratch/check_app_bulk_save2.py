with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(385, 410):
        print(f"{j+1}: {lines[j].rstrip()}")