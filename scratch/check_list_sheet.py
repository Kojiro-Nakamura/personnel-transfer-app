with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(len(lines)):
        if "function addListSheet" in lines[i] or "const addListSheet" in lines[i]:
            for j in range(i, i+600):
                if j < len(lines) and "curPromoColors[" in lines[j]:
                    print(f"{j+1}: {lines[j].rstrip()}")
            break