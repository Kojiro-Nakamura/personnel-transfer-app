with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(10, 80):
        if "const" in lines[j] or "function" in lines[j] or "export" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")