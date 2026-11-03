with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(2335, 2380):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")