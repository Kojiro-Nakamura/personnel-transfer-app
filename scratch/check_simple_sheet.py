import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    start_idx = -1
    for i, line in enumerate(lines):
        if "function addSimplePlanSheet" in line:
            start_idx = i
            break
    
    if start_idx != -1:
        for j in range(start_idx, start_idx + 600):
            if j < len(lines):
                if "bgC" in lines[j] or "fill" in lines[j] or "isPromoted" in lines[j]:
                    print(f"{j+1}: {lines[j].rstrip()}")