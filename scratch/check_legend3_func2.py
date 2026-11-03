with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(1860, -1, -1):
        if "export const" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")
            break