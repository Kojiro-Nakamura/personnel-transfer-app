with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(370, 390):
        print(f"{j+1}: {lines[j].rstrip()}")