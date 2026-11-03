with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(250, 270):
        print(f"{i+1}: {lines[i].rstrip()}")
    print("-----")
    for i in range(685, 705):
        print(f"{i+1}: {lines[i].rstrip()}")