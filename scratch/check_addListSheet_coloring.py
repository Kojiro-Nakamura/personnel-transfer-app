with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1740, 2200):
        if "fill =" in lines[j] or "bgColor" in lines[j] or "fgColor" in lines[j] or "targetCol" in lines[j] or "isTransfer" in lines[j]:
            print(f"{j+1}: {lines[j].strip()}")