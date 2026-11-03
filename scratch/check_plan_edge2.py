with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(265, 280):
        print(f"{i+1}: {lines[i].rstrip()}")
    print("-----")
    for i in range(660, 675):
        print(f"{i+1}: {lines[i].rstrip()}")