import re
with open("src/hooks/useAppHistory.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "useState" in line and "isOpen" in line:
            print(f"{j+1}: {line.strip()}")
            for k in range(j+1, j + 20):
                print(f"{k+1}: {lines[k].rstrip()}")
            break