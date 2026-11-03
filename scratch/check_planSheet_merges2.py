with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i+180, i+250):
                if "ws.mergeCells('A4" in lines[j]:
                    for k in range(j-2, j+20):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break