with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "if (colNumber <= 11) cell.fill = fillSlate;" in line:
            for j in range(i-5, i+15):
                print(f"{j+1}: {lines[j].rstrip()}")
            break