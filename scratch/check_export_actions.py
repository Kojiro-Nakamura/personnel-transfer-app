with open("src/hooks/useExportActions.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(min(50, len(lines))):
        print(f"{i+1}: {lines[i].rstrip()}")