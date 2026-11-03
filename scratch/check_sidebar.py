with open("src/components/layout/AppSidebar.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(0, 50):
        print(f"{j+1}: {lines[j].rstrip()}")