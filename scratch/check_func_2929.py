import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2929, 0, -1):
        if "function add" in lines[j] or "const add" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")
            break