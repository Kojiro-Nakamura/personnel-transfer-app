with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2780, 2810):
        if "historyYears.forEach" in lines[j] or "vals[" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")