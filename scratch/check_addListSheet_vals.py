import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2110, 2155):
        if "vals" in lines[j] or "push" in lines[j] or "historyYears" in lines[j] or "v[" in lines[j] or "vals[" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")