with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(200, 240):
        if "fill =" in lines[i] or "c4.fill" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")