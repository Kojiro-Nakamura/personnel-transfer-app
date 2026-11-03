with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2900, 2925):
        print(f"{j+1}: {lines[j].rstrip()}")
    print("--- loop 2 ---")
    for j in range(3200, 3235):
        print(f"{j+1}: {lines[j].rstrip()}")