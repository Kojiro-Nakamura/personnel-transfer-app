with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(800, 900):
        if "historyYears.forEach" in lines[j] or "const extraCols =" in lines[j] or "ws.columns =" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")