with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1110, 1160):
        if "sortedEmps" in lines[j] or "localEmps" in lines[j] or "historyYears" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")