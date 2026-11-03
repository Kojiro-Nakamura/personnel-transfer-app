with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(1650, 1680):
        print(f"{i+1}: {lines[i].rstrip()}")