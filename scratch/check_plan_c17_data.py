with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i+350, i+450):
                if "if (c === 17)" in lines[j] or "topBorder = false" in lines[j]:
                    for k in range(j-5, j+15):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break