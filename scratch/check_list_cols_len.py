with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    count = 0
    for j in range(1819, 1854):
        if "{" in lines[j] and "}" in lines[j]:
            count += 1
    print(f"Base columns: {count}")