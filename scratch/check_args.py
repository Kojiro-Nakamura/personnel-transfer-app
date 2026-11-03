with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for line in lines:
        if "addPlanSheet(" in line:
            print(line.strip())