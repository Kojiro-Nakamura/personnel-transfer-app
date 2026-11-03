with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i, i+120):
                if "ws.getCell('S4').value" in lines[j] or "r4Vals.push" in lines[j] or "r5Vals.push" in lines[j] or "historyYears.forEach" in lines[j] or "ws.mergeCells" in lines[j] or "ws.getCell(4, c)" in lines[j]:
                    print(f"{j+1}: {lines[j].rstrip()}")
            break