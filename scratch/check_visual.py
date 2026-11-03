with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(2315, 2900):
        if "export const addCurrentBasePlanSheet" in lines[i]:
            for j in range(i, i + 50):
                print(f"{j+1}: {lines[j].rstrip()}")
            break