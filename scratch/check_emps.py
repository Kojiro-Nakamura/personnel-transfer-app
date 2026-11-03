with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(350, 370):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")