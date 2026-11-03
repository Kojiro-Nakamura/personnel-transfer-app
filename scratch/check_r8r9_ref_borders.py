with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+150, i+800):
                if "if (c === 18)" in lines[j]:
                    for k in range(j-3, j+5):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    print("---")
            break