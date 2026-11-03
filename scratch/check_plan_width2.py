with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(785, 805):
        print(f"{i+1}: {lines[i].rstrip()}")