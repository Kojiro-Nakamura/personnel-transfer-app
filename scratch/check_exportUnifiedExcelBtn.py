with open("src/hooks/useExportActions.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "const exportUnifiedExcelBtn =" in line:
            for j in range(i, i+15):
                print(f"{j+1}: {lines[j].rstrip()}")
            break