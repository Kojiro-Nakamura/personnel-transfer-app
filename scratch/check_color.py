with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "const getPromotedBgColorCode =" in line or "function getPromotedBgColorCode" in line:
            for j in range(i, i+20):
                print(f"{j+1}: {lines[j].rstrip()}")
            break