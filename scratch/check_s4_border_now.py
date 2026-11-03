with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+100, i+250):
                if "ws.getCell('S4')" in lines[j]:
                    for k in range(j-2, j+8):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break