with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2385, 2415):
        if "mergeCells" in lines[j] or "ws.getCell" in lines[j] or "endTitleCol" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")