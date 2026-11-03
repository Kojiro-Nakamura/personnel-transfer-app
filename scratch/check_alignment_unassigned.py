with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(2560, 2600):
        if "cell.alignment =" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")
    print("---")
    for i in range(2440, 2460):
        if "cell.alignment =" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")