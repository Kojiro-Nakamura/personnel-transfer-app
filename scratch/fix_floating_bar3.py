with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()

# delete lines 328-335 (index 327 to 334)
del lines[327:335]

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.writelines(lines)