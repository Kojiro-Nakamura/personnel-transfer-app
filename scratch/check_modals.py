import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "export const AppContent" in line:
            for k in range(j, j + 20):
                print(f"{k+1}: {lines[k].rstrip()}")
            break