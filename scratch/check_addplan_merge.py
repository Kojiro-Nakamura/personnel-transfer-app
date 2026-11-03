with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1850, 1950):
        if "merge" in lines[j] or "r2" in lines[j] or "r1" in lines[j] or "legend" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")