with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1515, 1530):
        print(f"{j+1}: {lines[j].rstrip()}")