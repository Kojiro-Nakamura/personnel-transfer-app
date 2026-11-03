with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if ".width" in line and 800 < i < 1420:
            print(f"{i+1}: {line.strip()}")