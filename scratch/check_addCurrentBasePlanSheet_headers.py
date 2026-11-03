import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2400, 2450):
        if "['', '氏名'," in lines[j] or "['', '名前'," in lines[j] or "['" in lines[j] and "氏名" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")