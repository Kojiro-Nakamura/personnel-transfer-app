import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(50, 90):
        print(f"{j+1}: {lines[j].rstrip()}")