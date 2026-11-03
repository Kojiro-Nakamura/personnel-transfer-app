with open("src/hooks/useExportActions.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(520, 540):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")