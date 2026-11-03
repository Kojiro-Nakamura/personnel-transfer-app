with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if i >= 2700 and i <= 2800:
        if "r.promoYearMap = promoYearMap;" in line:
            lines[i] = line.replace("r.promoYearMap", "row.promoYearMap")
            print(f"Fixed row on line {i+1}")
            break

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(lines)