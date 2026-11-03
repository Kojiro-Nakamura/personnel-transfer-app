with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+100, i+200):
                if "c4.fill =" in lines[j] and "c >=" in lines[j-1]:
                    for k in range(j-3, j+20):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break