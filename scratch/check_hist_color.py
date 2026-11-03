with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2880, 2920):
        if "c >= 40" in lines[j] or "fill" in lines[j] or "color" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")