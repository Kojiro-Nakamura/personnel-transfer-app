with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i, i+700):
                if "historyYears.forEach" in lines[j] and "curFontStyles" in lines[j+10]:
                    for k in range(j-5, j+20):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break