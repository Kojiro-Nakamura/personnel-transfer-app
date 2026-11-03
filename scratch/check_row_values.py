with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+300, i+400):
                if "row.values = vals;" in lines[j] and "vals[16]" in "".join(lines[j-20:j]):
                    for k in range(j-20, j+5):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break