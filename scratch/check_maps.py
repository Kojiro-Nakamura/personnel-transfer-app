with open("src/hooks/useExportActions.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "exportToExcel = " in line or "deptMap" in line:
            print(f"{i+1}: {line.strip()}")