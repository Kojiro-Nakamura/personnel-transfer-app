with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    found = False
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+250, i+400):
                if "vals[18] =" in lines[j]:
                    found = True
                    for k in range(j-5, j+20):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break
    if not found:
        print("NOT FOUND")