with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2130, 2180):
        if "hStr" in lines[j] or "histAge" in lines[j] or "isNextPromoted" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")