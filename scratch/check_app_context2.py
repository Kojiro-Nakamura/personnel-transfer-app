with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "AppContext.Provider" in line:
            for j in range(i, i+30):
                if j < len(lines):
                    print(lines[j].rstrip())
            break