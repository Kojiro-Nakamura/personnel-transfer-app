with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i, i+600):
                if "vals[18]" in lines[j] or "rowVals.push(getFormattedNameForPlan" in lines[j]:
                    for k in range(j-5, j+25):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break