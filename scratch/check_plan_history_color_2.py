with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i+575, i+650):
                if "cell.fill =" in lines[j] and "history" in "".join(lines[j-10:j+5]):
                    for k in range(j-15, j+20):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break