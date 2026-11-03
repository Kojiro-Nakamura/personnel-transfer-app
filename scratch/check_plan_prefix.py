with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines[:800]):
        if "desiredAssignment" in line:
            print(f"{i+1}: {line.strip()}")