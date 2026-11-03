with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(850, 920):
        if "ws.columns =" in lines[j] or "columns.push" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")