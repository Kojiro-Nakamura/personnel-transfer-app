with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(120, 150):
        if "rowVals.push(" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")