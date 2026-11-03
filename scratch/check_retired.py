with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "const rObj = currMap['retired'];" in line:
            for j in range(i, i+35):
                if j < len(lines):
                    print(f"{j+1}: {lines[j].rstrip()}")
            break