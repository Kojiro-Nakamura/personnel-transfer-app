with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2800, 2920):
        if "cell.fill" in lines[j] or "19" in lines[j] or "39" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")