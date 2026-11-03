with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(805, 1200):
        if i < len(lines):
            if "bgC =" in lines[i] or "isPromoted" in lines[i] or "bgColor" in lines[i] or "backgroundColor" in lines[i]:
                print(f"{i+1}: {lines[i].rstrip()}")