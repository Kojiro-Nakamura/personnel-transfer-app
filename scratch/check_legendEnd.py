with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "legendEndCol = " in line:
            print(f"{j+1}: {line.rstrip()}")