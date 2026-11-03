with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2880, 2900):
        if "c >=" in lines[j] or "cell.fill" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")