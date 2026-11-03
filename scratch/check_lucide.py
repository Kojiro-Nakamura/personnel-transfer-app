with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(0, 15):
        if "lucide" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")