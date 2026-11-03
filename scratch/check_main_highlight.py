with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(len(lines)-60, len(lines)-10):
        if "cell.fill = { type:" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")