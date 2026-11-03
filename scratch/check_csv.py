import re
with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(945, 965):
        print(f"{j+1}: {lines[j].rstrip()}")