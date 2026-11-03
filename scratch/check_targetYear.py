with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2315, 2355):
        if "historyYears" in lines[j] or "allHistoryYears" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")