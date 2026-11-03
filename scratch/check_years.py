with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(2480, 2520):
        if "emp." in lines[i] and "Years" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")
    print("---")
    for i in range(2590, 2610):
        if "emp." in lines[i] and "Years" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")