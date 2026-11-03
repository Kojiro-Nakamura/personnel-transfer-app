with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+200, i+800):
                if "promoYearMap" in lines[j] or "historyYears" in lines[j]:
                    print(f"{j+1}: {lines[j].rstrip()}")
            break