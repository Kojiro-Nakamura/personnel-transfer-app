with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2840, 2880):
        if "cell.alignment =" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")
    print("--- loop 2 ---")
    for j in range(3150, 3200):
        if "cell.alignment =" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")