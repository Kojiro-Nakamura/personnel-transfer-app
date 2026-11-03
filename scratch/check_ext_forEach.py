with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(2900, 3150):
        if "extFiltered.forEach(" in lines[j]:
            for k in range(j-5, j+5):
                print(f"{k+1}: {lines[k].rstrip()}")
            break