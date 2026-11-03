with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(3180, 3200):
        if "c >=" in lines[j] or "c <=" in lines[j] or "nextPromoColor" in lines[j] or "isNextPromoted" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")