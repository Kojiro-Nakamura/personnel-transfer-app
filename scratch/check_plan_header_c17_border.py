with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i+150, i+200):
                if "if (i === 17) argb = 'FFFFFFFF';" in lines[j]:
                    for k in range(j-15, j+5):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break