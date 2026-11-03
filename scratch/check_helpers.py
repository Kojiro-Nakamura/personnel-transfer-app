with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(45, 90):
        print(f"{i+1}: {lines[i].rstrip()}")