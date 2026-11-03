with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2160, 2250):
        if "isNextPromoted" in lines[j] or "nextPromoColor" in lines[j] or "11" in lines[j] or "17" in lines[j] or "氏名" in lines[j] or "colNumber" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")