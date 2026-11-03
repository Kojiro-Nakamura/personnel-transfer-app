import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1290, 1330):
        if "fill" in lines[j] and "pKeys" in lines[j] or "gradeToPromoKey" in lines[j] or "isNextPromoted" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")