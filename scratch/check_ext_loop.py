with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "extFiltered.forEach(" in line:
            for k in range(i-2, i+15):
                print(f"{k+1}: {lines[k].rstrip()}")
            break