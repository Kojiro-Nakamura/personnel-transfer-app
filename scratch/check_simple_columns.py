with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(800, 850):
        if "ws.columns =" in lines[j] or "extraCols" in lines[j] or "width:" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")
    print("--- 1800 ---")
    for j in range(1800, 1850):
        if "ws.columns =" in lines[j] or "extraCols" in lines[j] or "width:" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")