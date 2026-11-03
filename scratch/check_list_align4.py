with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "alignment =" in line and i > 1700:
            print(f"{i+1}: {line.strip()}")