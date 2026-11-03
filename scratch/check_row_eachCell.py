with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+400, i+500):
                if "if (c >= 40) {" in lines[j]:
                    for k in range(j-15, j+15):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break