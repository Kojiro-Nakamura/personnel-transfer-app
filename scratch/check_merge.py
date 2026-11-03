with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i, i+150):
                if "ws.mergeCells(" in lines[j] and ("endColCode" in lines[j] or "historyYears.length" in lines[j]):
                    for k in range(j-5, j+5):
                        print(f"{k+1}: {lines[k].rstrip()}")
            break