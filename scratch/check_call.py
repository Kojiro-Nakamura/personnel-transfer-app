with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "addCurrentBasePlanSheet(workbook" in line and "export const" not in line:
            for j in range(i-5, i+5):
                print(f"{j+1}: {lines[j].rstrip()}")