with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(235, 275):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")
    print("-----")
    for i in range(300, 315):
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")