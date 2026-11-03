with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(860, 866):
        print(f"{lines[i].rstrip()}")