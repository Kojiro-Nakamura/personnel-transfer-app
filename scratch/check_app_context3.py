with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "value={{" in line:
            for j in range(max(0, i-5), i+30):
                if j < len(lines):
                    print(lines[j].rstrip())
            break