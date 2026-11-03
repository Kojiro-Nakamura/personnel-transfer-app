with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i+100, i+250):
                if "ws.getCell('S3')" in lines[j] or "ws.getCell(" in lines[j]:
                    for k in range(j-5, j+20):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    break
            break