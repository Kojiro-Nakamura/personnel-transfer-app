with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet" in line:
            for j in range(i, i+150):
                if "const extEmp = emp;" in lines[j]:
                    for k in range(j-5, j+60):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break