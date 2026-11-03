with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(1600, 1620):
        if "cell.alignment =" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")