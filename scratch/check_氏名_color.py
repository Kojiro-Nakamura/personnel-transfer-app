with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2800, 2900):
        if "氏名" in lines[j] or "19" in lines[j] or "22" in lines[j] or "39" in lines[j] or "nextPromoColor" in lines[j] or "18" in lines[j] or "20" in lines[j] or "isNextPromoted" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")