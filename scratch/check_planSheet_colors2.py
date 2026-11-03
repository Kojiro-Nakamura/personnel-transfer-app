with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(200, 300):
        if "c4.fill" in lines[i] or "c5.fill" in lines[i]:
            for j in range(i-2, i+5):
                print(f"{j+1}: {lines[j].rstrip()}")
            print("---")
            break