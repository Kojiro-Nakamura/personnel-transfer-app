with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2500, 2600):
        if "const headersR5 =" in lines[j] or "headersR4" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")