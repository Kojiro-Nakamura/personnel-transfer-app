with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+150, i+250):
                if "// Fix borders for merged cells" in lines[j]:
                    for k in range(j, j+15):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break