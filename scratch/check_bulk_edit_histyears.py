with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(580, 615):
        if "historyYears" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")