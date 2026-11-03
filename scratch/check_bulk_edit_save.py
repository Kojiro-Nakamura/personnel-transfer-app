with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(600, 630):
        if "handleSave" in lines[j] or "onSave" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")
            for k in range(j+1, j+20):
                print(f"{k+1}: {lines[k].rstrip()}")
            break