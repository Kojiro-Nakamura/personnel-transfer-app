with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in [2447, 2448, 2533, 2534, 2608, 2609, 2688, 2689]:
        if i < len(lines):
            print(f"{i+1}: {lines[i].rstrip()}")