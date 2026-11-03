with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i+350, i+650):
                if "if (colNumber > 38) {" in lines[j] or "if (colNumber >= 39) {" in lines[j] or "history" in lines[j]:
                    for k in range(j, j+15):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break