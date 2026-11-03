with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(1200, 1400):
        if "curPromoColors[" in lines[i] or "cell.fill" in lines[i] or "isNextTransferred" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")