with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(2360, 2375):
        if "r4Vals" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")