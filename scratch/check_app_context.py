with open("src/App.jsx", "r", encoding="utf8") as f:
    for i, line in enumerate(f):
        if "AppContext.Provider" in line:
            for j in range(i, i+30):
                print(f.readline().rstrip())
            break