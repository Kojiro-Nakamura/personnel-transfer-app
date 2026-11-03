with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addPlanSheet =" in line:
            for j in range(i+100, i+250):
                if "c4.fill =" in lines[j] or "c5.fill =" in lines[j] or "fillFuchsia" in lines[j] or "fillBlue" in lines[j]:
                    for k in range(j-2, j+5):
                        print(f"{k+1}: {lines[k].rstrip()}")
                    print("---")
            break