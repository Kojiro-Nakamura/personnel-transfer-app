with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(160, 180):
        if "legend" in lines[j] or "currYearIndex" in lines[j] or "historyYears.indexOf" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")
    print("--- 2410 ---")
    for j in range(2410, 2435):
        if "legend" in lines[j] or "currYearIndex" in lines[j] or "historyYears.indexOf" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")