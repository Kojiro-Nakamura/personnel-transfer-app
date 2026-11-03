with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const addCurrentBasePlanSheet =" in line:
            for j in range(i+100, i+250):
                if "r5Vals.push(" in lines[j] and "'氏名'" in lines[j]:
                    print(lines[j].rstrip())
                    break
            break