with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2125, 2150):
        if "pKeys" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")
            for k in range(j+1, j+10):
                print(f"{k+1}: {lines[k].rstrip()}")
            break