with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1290, 1315):
        if "inputCls" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")
    for j in range(1385, 1400):
        if "inputCls" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")