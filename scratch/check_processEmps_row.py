with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2600, 2630):
        if "ws.getRow" in lines[j]:
            for k in range(j-2, j+5):
                print(f"{k+1}: {lines[k].rstrip()}")
            break