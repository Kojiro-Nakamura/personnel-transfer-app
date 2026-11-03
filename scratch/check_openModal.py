import re
with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(65, 80):
        print(f"{j+1}: {lines[j].rstrip()}")