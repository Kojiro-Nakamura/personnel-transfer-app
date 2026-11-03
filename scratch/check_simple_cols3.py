with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(806, 1200):
        if "ws.columns" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")