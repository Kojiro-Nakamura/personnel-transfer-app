with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2110, 2150):
        if "vals.push(" in lines[j] or "ny" in lines[j] or "nextEmploymentType" in lines[j] or "age" in lines[j] or "年目" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")