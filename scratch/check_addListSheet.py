with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "function addListSheet" in line or "const addListSheet" in line:
            print(f"{j+1}: {line.strip()}")
            break