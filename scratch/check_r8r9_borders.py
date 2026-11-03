with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+350, i+450):
                if "if (c === 1) {" in lines[j] or "if (c === 18)" in lines[j] or "bottomStyle = null;" in lines[j]:
                    for k in range(j-5, j+20):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break