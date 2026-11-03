with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(1225, 1245):
        print(f"{i+1}: {lines[i].rstrip()}")