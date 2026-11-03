with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(155, 175):
        print(f"{i+1}: {lines[i].rstrip()}")
    print("---")
    for i in range(860, 880):
        print(f"{i+1}: {lines[i].rstrip()}")