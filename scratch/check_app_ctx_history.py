with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "currentTitle =" in line or "currentTitle:" in line:
            for j in range(max(0, i-5), i+15):
                print(f"{j+1}: {lines[j].rstrip()}")
            break