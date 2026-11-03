with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2880, 2900):
        if "isNextPromoted" in lines[j] or "11" in lines[j] or "19" in lines[j] or "5" in lines[j] or "39" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")