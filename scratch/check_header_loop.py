with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "const headerFill =" in line and i > 2300:
            for j in range(i, i+30):
                print(f"{j+1}: {lines[j].rstrip()}")
            break