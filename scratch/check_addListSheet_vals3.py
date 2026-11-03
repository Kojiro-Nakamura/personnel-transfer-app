with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2070, 2110):
        print(f"{j+1}: {lines[j].rstrip()}")