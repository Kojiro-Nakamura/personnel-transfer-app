with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "export const exportUnifiedExcel" in line:
            for j in range(i, i+30):
                print(f"{j+1}: {lines[j].rstrip()}")
            break