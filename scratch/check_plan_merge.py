with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1850, 1900):
        if "ws.mergeCells" in lines[j] or "legend" in lines[j] or "r2" in lines[j] or "A2" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")