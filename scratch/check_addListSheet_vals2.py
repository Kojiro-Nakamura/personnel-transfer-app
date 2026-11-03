with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2110, 2150):
        print(f"{j+1}: {lines[j].rstrip()}")